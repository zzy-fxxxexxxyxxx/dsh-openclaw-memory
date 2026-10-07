import { z } from 'zod';

const schema = (typeSymbol, create) => ({ mode: 'strict', typeSymbol, create });
const stringParam = (name) => ({ name, wire: name, source: 'json', codec: schema(`dsh-openclaw-memory#openclawMemory/${name}:parameter`, () => z.string()) });
const optionalStringParam = (name) => ({ name, wire: name, source: 'json', codec: schema(`dsh-openclaw-memory#openclawMemory/${name}:parameter`, () => z.string().optional()) });
const optionalNumberParam = (name) => ({ name, wire: name, source: 'json', codec: schema(`dsh-openclaw-memory#openclawMemory/${name}:parameter`, () => z.number().optional()) });
const listResult = () => z.object({ root: z.string(), files: z.array(z.string()) });
const readResult = () => z.object({ path: z.string(), content: z.string(), version: z.string(), size: z.number() });
const writeResult = () => z.object({ path: z.string(), version: z.string(), size: z.number() });
const searchResult = () => z.object({ query: z.string(), hits: z.array(z.object({ path: z.string(), score: z.number(), excerpt: z.string() })) });
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
  ],
};
export default TYPERT;
