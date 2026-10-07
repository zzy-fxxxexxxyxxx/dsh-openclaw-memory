import { z } from 'zod';

const schema = (typeSymbol, create) => ({ mode: 'strict', typeSymbol, create });
const stringParam = (name, typeSymbol = `dsh-openclaw-memory#${name}:parameter`) => ({ name, wire: name, source: 'json', codec: schema(typeSymbol, () => z.string()) });
const optionalStringParam = (name, typeSymbol = `dsh-openclaw-memory#${name}:parameter`) => ({ name, wire: name, source: 'json', codec: schema(typeSymbol, () => z.string().optional()) });
const optionalNumberParam = (name, typeSymbol = `dsh-openclaw-memory#${name}:parameter`) => ({ name, wire: name, source: 'json', codec: schema(typeSymbol, () => z.number().optional()) });
const resultCodec = (method, create) => schema(`dsh-openclaw-memory#openclawMemory/${method}:result`, create);
const listResult = () => z.object({ root: z.string(), files: z.array(z.string()) });
const readResult = () => z.object({ path: z.string(), content: z.string(), version: z.string(), size: z.number() });
const writeResult = () => z.object({ path: z.string(), version: z.string(), size: z.number() });
const searchResult = () => z.object({ query: z.string(), hits: z.array(z.object({ path: z.string(), score: z.number(), excerpt: z.string() })) });

export const TYPERT_REMOTE = {
  package: 'dsh-openclaw-memory',
  descriptors: [
    {
      id: 'dsh-openclaw-memory#openclawMemory/listFiles', service: 'openclawMemory', namespace: 'openclawMemory', method: 'listFiles', invocation: { kind: 'direct' }, parameters: [],
      result: resultCodec('listFiles', listResult),
    },
    {
      id: 'dsh-openclaw-memory#openclawMemory/readFile', service: 'openclawMemory', namespace: 'openclawMemory', method: 'readFile', invocation: { kind: 'direct' },
      parameters: [stringParam('relativePath')], result: resultCodec('readFile', readResult),
    },
    {
      id: 'dsh-openclaw-memory#openclawMemory/writeFile', service: 'openclawMemory', namespace: 'openclawMemory', method: 'writeFile', invocation: { kind: 'direct' },
      parameters: [stringParam('relativePath'), stringParam('content'), optionalStringParam('expectedVersion')], result: resultCodec('writeFile', writeResult),
    },
    {
      id: 'dsh-openclaw-memory#openclawMemory/search', service: 'openclawMemory', namespace: 'openclawMemory', method: 'search', invocation: { kind: 'direct' },
      parameters: [stringParam('query'), optionalNumberParam('limit')], result: resultCodec('search', searchResult),
    },
  ],
};
export default TYPERT_REMOTE;
