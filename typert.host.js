import { z } from 'zod';

const schema = (typeSymbol, create) => ({ mode: 'strict', typeSymbol, create });
const stringParam = (name) => ({ name, wire: name, source: 'json', codec: schema(`dsh-openclaw-memory#openclawMemory/${name}:parameter`, () => z.string()) });
const optionalStringParam = (name) => ({ name, wire: name, source: 'json', codec: schema(`dsh-openclaw-memory#openclawMemory/${name}:parameter`, () => z.string().optional()) });
const optionalNumberParam = (name) => ({ name, wire: name, source: 'json', codec: schema(`dsh-openclaw-memory#openclawMemory/${name}:parameter`, () => z.number().optional()) });
const listResult = () => z.object({ root: z.string(), files: z.array(z.string()) });
const readResult = () => z.object({ path: z.string(), content: z.string(), version: z.string(), size: z.number() });
const writeResult = () => z.object({ path: z.string(), version: z.string(), size: z.number() });
const searchResult = () => z.object({ query: z.string(), hits: z.array(z.object({ path: z.string(), score: z.number(), excerpt: z.string() })) });
const configShape = () => z.object({
  root: z.string(), contextInjection: z.enum(['always', 'continuation-skip', 'never']), bootstrapFiles: z.array(z.string()), bootstrapMaxChars: z.number(), bootstrapTotalMaxChars: z.number(), userMaxChars: z.number(), dailyMemoryDays: z.number(), dailyFileMaxBytes: z.number(), dailyFileMaxChars: z.number(), dailyTotalMaxChars: z.number(), includeDailyStartup: z.boolean(), timeZone: z.string(), includeCredentials: z.boolean(), maxFileChars: z.number(),
});
const configResult = () => z.object({ config: configShape(), revision: z.number(), live: z.boolean() });
const previewFile = () => z.object({ path: z.string(), text: z.string(), block: z.string(), sourceChars: z.number(), sourceBytes: z.number(), maxChars: z.number(), injectedChars: z.number(), truncated: z.boolean() });
const previewResult = () => z.object({ config: configShape(), snapshot: z.string(), snapshotChars: z.number(), bootstrap: z.array(previewFile()), daily: z.array(previewFile()), bootstrapInjectedChars: z.number(), dailyInjectedChars: z.number(), contextEnabled: z.boolean() });
const configPatch = () => z.object({
  root: z.string().optional(), contextInjection: z.enum(['always', 'continuation-skip', 'never']).optional(), bootstrapFiles: z.array(z.string()).optional(), bootstrapMaxChars: z.number().optional(), bootstrapTotalMaxChars: z.number().optional(), userMaxChars: z.number().optional(), dailyMemoryDays: z.number().optional(), dailyFileMaxBytes: z.number().optional(), dailyFileMaxChars: z.number().optional(), dailyTotalMaxChars: z.number().optional(), includeDailyStartup: z.boolean().optional(), timeZone: z.string().optional(), includeCredentials: z.boolean().optional(), maxFileChars: z.number().optional(),
});
const resultCodec = (method, create) => schema(`dsh-openclaw-memory#openclawMemory/${method}:result`, create);

export const TYPERT = {
  package: 'dsh-openclaw-memory',
  face: 'host',
  schemas: [],
  model: {
    services: [{
      key: 'openclawMemory', exportName: 'OpenClawMemoryService', description: 'Bounded OpenClaw shared-memory Remote service.', summary: 'Shared OpenClaw memory', tags: [], types: [],
      members: [
        { kind: 'method', name: 'listFiles', signature: 'listFiles(): Promise<OpenClawMemoryFileList>', summary: 'List safe Markdown memory files.' },
        { kind: 'method', name: 'readFile', signature: 'readFile(relativePath: string): Promise<OpenClawMemoryFile>', summary: 'Read one bounded Markdown file.' },
        { kind: 'method', name: 'writeFile', signature: 'writeFile(relativePath: string, content: string, expectedVersion?: string): Promise<OpenClawMemoryWriteResult>', summary: 'Write one Markdown file with conflict protection.' },
        { kind: 'method', name: 'search', signature: 'search(query: string, limit?: number): Promise<OpenClawMemorySearchResult>', summary: 'Search bounded Markdown memory.' },
        { kind: 'method', name: 'getConfig', signature: 'getConfig(): Promise<OpenClawMemoryConfigResult>', summary: 'Read live shared-memory configuration.' },
        { kind: 'method', name: 'updateConfig', signature: 'updateConfig(patch: OpenClawMemoryConfigPatch, expectedRevision?: number): Promise<OpenClawMemoryConfigResult>', summary: 'Update volatile shared-memory configuration.' },
        { kind: 'method', name: 'preview', signature: 'preview(): Promise<OpenClawMemoryPreview>', summary: 'Preview the exact bounded context and truncation metadata.' },
      ],
    }],
    events: [],
    objects: [],
  },
  invocations: [
    { id: 'dsh-openclaw-memory#openclawMemory/listFiles', service: 'openclawMemory', namespace: 'openclawMemory', method: 'listFiles', invocation: { kind: 'direct' }, parameters: [], result: resultCodec('listFiles', listResult) },
    { id: 'dsh-openclaw-memory#openclawMemory/readFile', service: 'openclawMemory', namespace: 'openclawMemory', method: 'readFile', invocation: { kind: 'direct' }, parameters: [stringParam('relativePath')], result: resultCodec('readFile', readResult) },
    { id: 'dsh-openclaw-memory#openclawMemory/writeFile', service: 'openclawMemory', namespace: 'openclawMemory', method: 'writeFile', invocation: { kind: 'direct' }, parameters: [stringParam('relativePath'), stringParam('content'), optionalStringParam('expectedVersion')], result: resultCodec('writeFile', writeResult) },
    { id: 'dsh-openclaw-memory#openclawMemory/search', service: 'openclawMemory', namespace: 'openclawMemory', method: 'search', invocation: { kind: 'direct' }, parameters: [stringParam('query'), optionalNumberParam('limit')], result: resultCodec('search', searchResult) },
    { id: 'dsh-openclaw-memory#openclawMemory/getConfig', service: 'openclawMemory', namespace: 'openclawMemory', method: 'getConfig', invocation: { kind: 'direct' }, parameters: [], result: resultCodec('getConfig', configResult) },
    { id: 'dsh-openclaw-memory#openclawMemory/updateConfig', service: 'openclawMemory', namespace: 'openclawMemory', method: 'updateConfig', invocation: { kind: 'direct' }, parameters: [{ name: 'patch', wire: 'patch', source: 'json', codec: schema('dsh-openclaw-memory#configPatch:parameter', configPatch) }, optionalNumberParam('expectedRevision')], result: resultCodec('updateConfig', configResult) },
    { id: 'dsh-openclaw-memory#openclawMemory/preview', service: 'openclawMemory', namespace: 'openclawMemory', method: 'preview', invocation: { kind: 'direct' }, parameters: [], result: resultCodec('preview', previewResult) },
  ],
};
export default TYPERT;
