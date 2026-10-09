import z from '@deepseek-ai/schemastery';
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { statSync } from 'node:fs';
import {
  DEFAULT_CONFIG,
  buildContextPreviewSync,
  buildContextSnapshotSync,
  listMemoryFiles,
  normalizeConfig,
  readMemoryFile,
  searchMemory,
  startupMemoryFileNamesSync,
  writeMemoryFile,
} from '../core/index.js';
import type { MemoryConfig, MemoryConfigInput } from '../types/domain.js';

export const name = 'openclaw-memory';
export const inject = ['systemPrompt', 'tools'];

const volatile = (schema: any) => schema.volatile();
const bootstrapFile = z.union([...DEFAULT_CONFIG.bootstrapFiles]);

export const Config = z.object({
  root: volatile(z.string().default(DEFAULT_CONFIG.root)),
  contextInjection: volatile(z.union(['always', 'continuation-skip', 'never']).default(DEFAULT_CONFIG.contextInjection)),
  bootstrapFiles: volatile(z.array(bootstrapFile).default([...DEFAULT_CONFIG.bootstrapFiles])),
  bootstrapMaxChars: volatile(z.number().default(DEFAULT_CONFIG.bootstrapMaxChars)),
  bootstrapTotalMaxChars: volatile(z.number().default(DEFAULT_CONFIG.bootstrapTotalMaxChars)),
  userMaxChars: volatile(z.number().default(DEFAULT_CONFIG.userMaxChars)),
  dailyMemoryDays: volatile(z.number().default(DEFAULT_CONFIG.dailyMemoryDays)),
  dailyFileMaxBytes: volatile(z.number().default(DEFAULT_CONFIG.dailyFileMaxBytes)),
  dailyFileMaxChars: volatile(z.number().default(DEFAULT_CONFIG.dailyFileMaxChars)),
  dailyTotalMaxChars: volatile(z.number().default(DEFAULT_CONFIG.dailyTotalMaxChars)),
  includeDailyStartup: volatile(z.boolean().default(DEFAULT_CONFIG.includeDailyStartup)),
  timeZone: volatile(z.string().default(DEFAULT_CONFIG.timeZone)),
  includeCredentials: volatile(z.boolean().default(DEFAULT_CONFIG.includeCredentials)),
  maxFileChars: volatile(z.number().default(DEFAULT_CONFIG.maxFileChars)),
});

const CONFIG_KEYS = Object.freeze(Object.keys(DEFAULT_CONFIG));

type ConfigRef = Record<string, unknown>;

function plainConfig(input: unknown): MemoryConfigInput {
  const source = input && typeof input === 'object' ? input as ConfigRef : {};
  return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, value && typeof value === 'object' && 'get' in value && typeof value.get === 'function' ? value.get() : value])) as MemoryConfigInput;
}

function resolved(input: unknown): MemoryConfig {
  return normalizeConfig(plainConfig(input));
}

function configPatch(input: unknown): MemoryConfigInput {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('config patch must be an object');
  const source = input as ConfigRef;
  const unknown = Object.keys(source).filter((key) => !CONFIG_KEYS.includes(key));
  if (unknown.length > 0) throw new TypeError(`unknown config field: ${unknown.join(', ')}`);
  return plainConfig(source);
}

function serializableConfig(config: unknown): MemoryConfig {
  return { ...resolved(config) };
}

function asToolError(error: unknown): Error & { code?: string } {
  const wrapped = new Error(error instanceof Error ? error.message : String(error)) as Error & { code?: string };
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') wrapped.code = error.code;
  return wrapped;
}

export class OpenClawMemoryService extends TypertRemoteService {
  static inject = [];
  static Config = Config;
  private readonly config: unknown;
  private readonly runtime: any;

  constructor(ctx: any, config: unknown) {
    super(ctx, 'openclawMemory');
    this.runtime = ctx;
    this.config = config;
    ctx.inject(['settings'], (scope: any) => {
      scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber));
    });
    ctx.inject(['systemPrompt', 'tools'], (scope: any) => {
      applyContext(scope, this.config);
      applyTools(scope, this.config);
    });
  }

  currentConfig(): MemoryConfig { return resolved(this.config); }

  async listFiles(): Promise<{ root: string; files: string[] }> {
    const config = this.currentConfig();
    return { root: config.root, files: await listMemoryFiles(config.root, config) };
  }

  async readFile(relativePath: string) {
    const config = this.currentConfig();
    return readMemoryFile(config.root, relativePath, config);
  }

  async writeFile(relativePath: string, content: string, expectedVersion?: string) {
    const config = this.currentConfig();
    try { return await writeMemoryFile(config.root, relativePath, content, expectedVersion, config); }
    catch (error) {
      const typed = asToolError(error);
      if (typed.code === 'MEMORY_CONFLICT') throw new (RemoteError as any)('memory-conflict', typed.message, {});
      throw error;
    }
  }

  async search(query: string, limit?: number) {
    const config = this.currentConfig();
    return { query, hits: await searchMemory(config.root, query, config, limit ?? 8) };
  }

  getConfig() {
    const settings = this.runtime.get('settings');
    const descriptor = settings?.describe()?.find((entry: any) => entry.ns === 'openclaw-memory');
    return { config: serializableConfig(this.config), revision: descriptor?.revision ?? 0, live: true };
  }

  async updateConfig(patch: unknown, expectedRevision?: number) {
    const settings = this.runtime.get('settings');
    if (settings === undefined) throw new Error('DSH settings service is unavailable');
    const next = configPatch(patch);
    normalizeConfig({ ...plainConfig(this.config), ...next });
    try { await settings.update('openclaw-memory', next, expectedRevision); }
    catch (error) {
      const typed = asToolError(error);
      if (typed.code === 'SETTINGS_CONFLICT') throw new (RemoteError as any)('settings-conflict', typed.message, { expected: (error as any).expected, actual: (error as any).actual });
      if ((error as any)?.name === 'ValidationError' || error instanceof TypeError) throw error;
      throw new (RemoteError as any)('config-reload-failed', typed.message, { restartRequired: true });
    }
    return this.getConfig();
  }

  preview() {
    const config = this.currentConfig();
    return buildContextPreviewSync(config.root, config);
  }
}

function installRemoteMarkers(klass: any): void {
  for (const [method, exportName] of [
    ['listFiles', 'listFiles'], ['readFile', 'readFile'], ['writeFile', 'writeFile'], ['search', 'search'],
    ['getConfig', 'getConfig'], ['updateConfig', 'updateConfig'], ['preview', 'preview'],
  ] as const) {
    const methodName: string = method;
    const initializers: Function[] = [];
    const decorator = Remote(exportName) as (target: Function, context: any) => void;
    decorator(klass.prototype[methodName], {
      kind: 'method', name: methodName, static: false, private: false,
      access: { has: (object: any) => methodName in object, get: (object: any) => object[methodName] },
      addInitializer(initializer: Function) { initializers.push(initializer); },
    });
    const receiver = Object.create(klass.prototype);
    for (const initializer of initializers) initializer.call(receiver);
  }
}
installRemoteMarkers(OpenClawMemoryService);

function sourceSignature(root: string, config: MemoryConfig): string {
  const paths: string[] = [...config.bootstrapFiles];
  if (config.includeDailyStartup) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: config.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const [year, month, day] = today.split('-').map(Number);
    for (let offset = 0; offset < config.dailyMemoryDays; offset += 1) {
      const date = new Date(Date.UTC(year!, month! - 1, day! - offset)).toISOString().slice(0, 10);
      for (const fileName of startupMemoryFileNamesSync(root, date, config.includeCredentials)) paths.push(`memory/${fileName}`);
    }
  }
  return `${JSON.stringify(config)}|${paths.map((relativePath) => {
    try { const stat = statSync(`${root}/${relativePath}`); return `${relativePath}:${stat.mtimeMs}:${stat.size}`; }
    catch { return `${relativePath}:missing`; }
  }).join('|')}`;
}

function applyContext(ctx: any, configRef: unknown): void {
  const snapshots = new WeakMap<object, { signature: string; text: string }>();
  ctx.on('agent/created', ({ agent }: any) => snapshots.delete(agent));
  ctx.on('agent/disposed', ({ agent }: any) => snapshots.delete(agent));
  ctx.systemPrompt.context({
    name: 'openclaw-memory',
    order: ctx.systemPrompt.getContextOrder('SANDBOX_POLICY') - 1,
    text: ({ agent }: any) => {
      if (agent === undefined) return '';
      const current = resolved(configRef);
      const signature = sourceSignature(current.root, current);
      const cached = snapshots.get(agent);
      if (current.contextInjection === 'continuation-skip' && cached?.signature === signature) return cached.text;
      try {
        const text = buildContextSnapshotSync(current.root, current);
        snapshots.set(agent, { signature, text });
        return text;
      } catch (error) {
        ctx.logger.warn(`openclaw-memory context unavailable: ${error instanceof Error ? error.message : String(error)}`);
        return '';
      }
    },
  });
}

function applyTools(ctx: any, configRef: unknown): void {
  let disposeTool: (() => void) | undefined;
  const currentConfig = () => resolved(configRef);
  const toolDefinition = () => defineTool({
    name: 'openclaw_memory_search',
    description: 'Search the shared OpenClaw Markdown memory and return bounded matching excerpts. JSON artifacts and credential files are excluded.',
    parameters: { query: { type: 'string', required: true, description: 'Non-empty words or phrase to search for.' }, limit: { type: 'number', description: 'Maximum number of matching files. Defaults to 8.' } },
    output: { schema: { type: 'object', additionalProperties: false, properties: { query: { type: 'string', required: true }, hits: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: { path: { type: 'string', required: true }, score: { type: 'number', required: true }, excerpt: { type: 'string', required: true } } } } } }, render: (_args: any, value: any) => [{ type: 'text', text: value.hits.length === 0 ? 'No shared-memory matches found.' : value.hits.map((hit: any) => `- ${hit.path}: ${hit.excerpt}`).join('\n') }], },
    async execute(args: { query: string; limit?: number }) {
      const current = currentConfig();
      if (current.contextInjection === 'never') throw new Error('shared-memory search is disabled by contextInjection=never');
      try { return { query: args.query, hits: await searchMemory(current.root, args.query, current, args.limit ?? 8) }; }
      catch (error) { throw asToolError(error); }
    },
  });
  const sync = () => {
    const enabled = currentConfig().contextInjection !== 'never';
    if (enabled && disposeTool === undefined) disposeTool = ctx.tools.register(toolDefinition());
    if (!enabled && disposeTool !== undefined) { disposeTool(); disposeTool = undefined; }
  };
  sync();
  ctx.on('loader/volatile-update', sync);
  ctx.effect(() => () => { if (disposeTool !== undefined) disposeTool(); });
  ctx.systemPrompt.section({
    name: 'tool:openclaw_memory',
    order: ctx.systemPrompt.getSectionOrder('TOOLS_SDK') - 1,
    text: ({ scope }: any) => ctx.tools.get('openclaw_memory_search', scope) === undefined ? '' : 'Use openclaw_memory_search for bounded retrieval from the shared OpenClaw Markdown memory; credential files are excluded by default.',
  });
}

export default OpenClawMemoryService;
