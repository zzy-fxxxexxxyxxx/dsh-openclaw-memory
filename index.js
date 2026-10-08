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
} from './memory-core.js';

export const name = 'openclaw-memory';
export const inject = ['systemPrompt', 'tools'];

const volatile = (schema) => schema.volatile();
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

function plainConfig(input) {
  return Object.fromEntries(Object.entries(input ?? {}).map(([key, value]) => [key, value && typeof value.get === 'function' ? value.get() : value]));
}

function resolved(input) {
  return normalizeConfig(plainConfig(input));
}

function configPatch(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('config patch must be an object');
  const unknown = Object.keys(input).filter((key) => !CONFIG_KEYS.includes(key));
  if (unknown.length > 0) throw new TypeError(`unknown config field: ${unknown.join(', ')}`);
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value && typeof value.get === 'function' ? value.get() : value]));
}

function serializableConfig(config) {
  return { ...resolved(config) };
}

function asToolError(error) {
  const wrapped = new Error(error instanceof Error ? error.message : String(error));
  if (error?.code) wrapped.code = error.code;
  return wrapped;
}

export class OpenClawMemoryService extends TypertRemoteService {
  static inject = [];
  static Config = Config;
  constructor(ctx, config) {
    super(ctx, 'openclawMemory');
    this.config = config;
    ctx.inject(['settings'], (scope) => {
      scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber));
    });
    ctx.inject(['systemPrompt', 'tools'], (scope) => {
      applyContext(scope, this.config);
      applyTools(scope, this.config);
    });
  }

  currentConfig() {
    return resolved(this.config);
  }

  async listFiles() {
    const config = this.currentConfig();
    return { root: config.root, files: await listMemoryFiles(config.root, config) };
  }

  async readFile(relativePath) {
    const config = this.currentConfig();
    return await readMemoryFile(config.root, relativePath, config);
  }

  async writeFile(relativePath, content, expectedVersion) {
    const config = this.currentConfig();
    try {
      return await writeMemoryFile(config.root, relativePath, content, expectedVersion, config);
    } catch (error) {
      if (error?.code === 'MEMORY_CONFLICT') throw new RemoteError('memory-conflict', error.message, {});
      throw error;
    }
  }

  async search(query, limit) {
    const config = this.currentConfig();
    return { query, hits: await searchMemory(config.root, query, config, limit ?? 8) };
  }

  getConfig() {
    const settings = this.ctx.get('settings');
    const descriptor = settings?.describe()?.find((entry) => entry.ns === 'openclaw-memory');
    return { config: serializableConfig(this.config), revision: descriptor?.revision ?? 0, live: true };
  }

  async updateConfig(patch, expectedRevision) {
    const settings = this.ctx.get('settings');
    if (settings === undefined) throw new Error('DSH settings service is unavailable');
    const next = configPatch(patch);
    normalizeConfig({ ...plainConfig(this.config), ...next });
    try {
      await settings.update('openclaw-memory', next, expectedRevision);
    } catch (error) {
      if (error?.code === 'SETTINGS_CONFLICT') throw new RemoteError('settings-conflict', error.message, { expected: error.expected, actual: error.actual });
      if (error?.name === 'ValidationError' || error instanceof TypeError) throw error;
      throw new RemoteError('config-reload-failed', error instanceof Error ? error.message : String(error), { restartRequired: true });
    }
    return this.getConfig();
  }

  preview() {
    const config = this.currentConfig();
    return buildContextPreviewSync(config.root, config);
  }
}

function installRemoteMarkers(klass) {
  for (const [method, exportName] of [
    ['listFiles', 'listFiles'], ['readFile', 'readFile'], ['writeFile', 'writeFile'], ['search', 'search'],
    ['getConfig', 'getConfig'], ['updateConfig', 'updateConfig'], ['preview', 'preview'],
  ]) {
    const initializers = [];
    const decorator = Remote(exportName);
    decorator(klass.prototype[method], {
      kind: 'method', name: method, static: false, private: false,
      access: { has: (object) => method in object, get: (object) => object[method] },
      addInitializer(initializer) { initializers.push(initializer); },
    });
    const receiver = Object.create(klass.prototype);
    for (const initializer of initializers) initializer.call(receiver);
  }
}
installRemoteMarkers(OpenClawMemoryService);

function sourceSignature(root, config) {
  const paths = [...config.bootstrapFiles];
  if (config.includeDailyStartup) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: config.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const [year, month, day] = today.split('-').map(Number);
    for (let offset = 0; offset < config.dailyMemoryDays; offset += 1) {
      const date = new Date(Date.UTC(year, month - 1, day - offset)).toISOString().slice(0, 10);
      for (const fileName of startupMemoryFileNamesSync(root, date, config.includeCredentials)) paths.push(`memory/${fileName}`);
    }
  }
  return `${JSON.stringify(config)}|${paths.map((relativePath) => {
    try {
      const stat = statSync(`${root}/${relativePath}`);
      return `${relativePath}:${stat.mtimeMs}:${stat.size}`;
    } catch { return `${relativePath}:missing`; }
  }).join('|')}`;
}

function applyContext(ctx, configRef) {
  const snapshots = new WeakMap();
  ctx.on('agent/created', ({ agent }) => snapshots.delete(agent));
  ctx.on('agent/disposed', ({ agent }) => snapshots.delete(agent));
  ctx.systemPrompt.context({
    name: 'openclaw-memory',
    order: ctx.systemPrompt.getContextOrder('SANDBOX_POLICY') - 1,
    text: ({ agent }) => {
      if (agent === void 0) return '';
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

function applyTools(ctx, configRef) {
  let disposeTool;
  const currentConfig = () => resolved(configRef);
  const toolDefinition = () => defineTool({
    name: 'openclaw_memory_search',
    description: 'Search the shared OpenClaw Markdown memory and return bounded matching excerpts. JSON artifacts and credential files are excluded.',
    parameters: {
      query: { type: 'string', required: true, description: 'Non-empty words or phrase to search for.' },
      limit: { type: 'number', description: 'Maximum number of matching files. Defaults to 8.' },
    },
    output: {
      schema: {
        type: 'object', additionalProperties: false,
        properties: {
          query: { type: 'string', required: true },
          hits: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
            path: { type: 'string', required: true }, score: { type: 'number', required: true }, excerpt: { type: 'string', required: true },
          } } },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.hits.length === 0 ? 'No shared-memory matches found.' : value.hits.map((hit) => `- ${hit.path}: ${hit.excerpt}`).join('\n') }],
    },
    async execute(args) {
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
    text: ({ scope }) => ctx.tools.get('openclaw_memory_search', scope) === void 0 ? '' : 'Use openclaw_memory_search for bounded retrieval from the shared OpenClaw Markdown memory; credential files are excluded by default.',
  });
}

export default OpenClawMemoryService;
