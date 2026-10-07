import z from '@deepseek-ai/schemastery';
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { statSync } from 'node:fs';
import {
  DEFAULT_CONFIG,
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

export const Config = z.object({
  root: z.string().default(DEFAULT_CONFIG.root),
  contextInjection: z.string().default(DEFAULT_CONFIG.contextInjection),
  bootstrapMaxChars: z.number().default(DEFAULT_CONFIG.bootstrapMaxChars),
  bootstrapTotalMaxChars: z.number().default(DEFAULT_CONFIG.bootstrapTotalMaxChars),
  userMaxChars: z.number().default(DEFAULT_CONFIG.userMaxChars),
  dailyMemoryDays: z.number().default(DEFAULT_CONFIG.dailyMemoryDays),
  dailyFileMaxBytes: z.number().default(DEFAULT_CONFIG.dailyFileMaxBytes),
  dailyFileMaxChars: z.number().default(DEFAULT_CONFIG.dailyFileMaxChars),
  dailyTotalMaxChars: z.number().default(DEFAULT_CONFIG.dailyTotalMaxChars),
  includeDailyStartup: z.boolean().default(DEFAULT_CONFIG.includeDailyStartup),
  timeZone: z.string().default(DEFAULT_CONFIG.timeZone),
  includeCredentials: z.boolean().default(DEFAULT_CONFIG.includeCredentials),
  maxFileChars: z.number().default(DEFAULT_CONFIG.maxFileChars),
});

function resolved(input) {
  return normalizeConfig(input);
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
    this.config = resolved(config);
    ctx.inject(['systemPrompt', 'tools'], (scope) => {
      if (this.config.contextInjection !== 'never') applyContext(scope, this.config);
      if (this.config.contextInjection !== 'never') applyTools(scope, this.config);
    });
  }

  async listFiles() {
    return { root: this.config.root, files: await listMemoryFiles(this.config.root, this.config) };
  }

  async readFile(relativePath) {
    return await readMemoryFile(this.config.root, relativePath, this.config);
  }

  async writeFile(relativePath, content, expectedVersion) {
    try {
      return await writeMemoryFile(this.config.root, relativePath, content, expectedVersion, this.config);
    } catch (error) {
      if (error?.code === 'MEMORY_CONFLICT') throw new RemoteError('memory-conflict', error.message, {});
      throw error;
    }
  }

  async search(query, limit) {
    return { query, hits: await searchMemory(this.config.root, query, this.config, limit ?? 8) };
  }
}

function installRemoteMarkers(klass) {
  for (const [method, exportName] of [['listFiles', 'listFiles'], ['readFile', 'readFile'], ['writeFile', 'writeFile'], ['search', 'search']]) {
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
  const paths = ['AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md', 'BOOTSTRAP.md', 'MEMORY.md'];
  if (config.includeDailyStartup) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: config.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const [year, month, day] = today.split('-').map(Number);
    for (let offset = 0; offset < config.dailyMemoryDays; offset += 1) {
      const date = new Date(Date.UTC(year, month - 1, day - offset)).toISOString().slice(0, 10);
      for (const fileName of startupMemoryFileNamesSync(root, date)) paths.push(`memory/${fileName}`);
    }
  }
  return paths.map((relativePath) => {
    try {
      const stat = statSync(`${root}/${relativePath}`);
      return `${relativePath}:${stat.mtimeMs}:${stat.size}`;
    } catch { return `${relativePath}:missing`; }
  }).join('|');
}

function applyContext(ctx, config) {
  const current = resolved(config);
  const snapshots = new WeakMap();
  ctx.on('agent/created', ({ agent }) => snapshots.delete(agent));
  ctx.on('agent/disposed', ({ agent }) => snapshots.delete(agent));
  ctx.systemPrompt.context({
    name: 'openclaw-memory',
    order: ctx.systemPrompt.getContextOrder('SANDBOX_POLICY') - 1,
    text: ({ agent }) => {
      if (agent === void 0) return '';
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

function applyTools(ctx, config) {
  const current = resolved(config);
  ctx.systemPrompt.section({
    name: 'tool:openclaw_memory',
    order: ctx.systemPrompt.getSectionOrder('TOOLS_SDK') - 1,
    text: ({ scope }) => ctx.tools.get('openclaw_memory_search', scope) === void 0 ? '' : 'Use openclaw_memory_search for bounded retrieval from the shared OpenClaw Markdown memory; credential files are excluded by default.',
  });
  ctx.tools.register(defineTool({
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
      try { return { query: args.query, hits: await searchMemory(current.root, args.query, current, args.limit ?? 8) }; }
      catch (error) { throw asToolError(error); }
    },
  }));
}

export default OpenClawMemoryService;
