import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_CONFIG } from './constants.js';
import { normalizeConfig } from './config.js';
import { isCredentialPath, resolveInsideRoot, safeRelativePath } from './paths.js';
import type { MemoryConfigInput, MemoryFileRead, MemoryFileWrite, MemorySearchHit } from '../types/domain.js';

async function walkMarkdown(root: string, directory: string, result: string[], includeCredentials: boolean): Promise<void> {
  let entries;
  try { entries = await fs.readdir(directory, { withFileTypes: true }); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replaceAll(path.sep, '/');
    if (entry.isDirectory()) await walkMarkdown(root, absolute, result, includeCredentials);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md') && (includeCredentials || !isCredentialPath(relative))) result.push(relative);
  }
}

export async function listMemoryFiles(root: string, input: MemoryConfigInput = DEFAULT_CONFIG): Promise<string[]> {
  const config = normalizeConfig({ ...input, root });
  const paths: string[] = [];
  for (const candidate of ['AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md', 'BOOTSTRAP.md', 'MEMORY.md']) {
    if (config.includeCredentials || !isCredentialPath(candidate)) {
      try { await fs.stat(resolveInsideRoot(root, candidate)); paths.push(candidate); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    }
  }
  await walkMarkdown(root, resolveInsideRoot(root, 'memory'), paths, config.includeCredentials);
  return [...new Set(paths)].sort((a, b) => a.localeCompare(b));
}

function keywordScore(text: string, terms: string[]): number {
  const lower = text.toLocaleLowerCase();
  let score = 0;
  for (const term of terms) {
    let offset = 0;
    while (true) {
      const found = lower.indexOf(term, offset);
      if (found < 0) break;
      score += 1;
      offset = found + term.length;
    }
  }
  return score;
}

export async function searchMemory(root: string, query: string, input: MemoryConfigInput = DEFAULT_CONFIG, limit = 8): Promise<MemorySearchHit[]> {
  if (typeof query !== 'string' || query.trim() === '') throw new TypeError('query must be non-empty');
  if (!Number.isSafeInteger(limit) || limit < 1) throw new TypeError('limit must be a positive safe integer');
  const config = normalizeConfig({ ...input, root });
  const terms = query.toLocaleLowerCase().split(/\s+/u).filter(Boolean);
  const hits: MemorySearchHit[] = [];
  for (const relativePath of await listMemoryFiles(root, config)) {
    const buffer = await fs.readFile(resolveInsideRoot(root, relativePath));
    const text = buffer.subarray(0, config.maxFileChars * 4).toString('utf8');
    const score = keywordScore(`${relativePath}\n${text}`, terms);
    if (score === 0) continue;
    const firstTerm = terms.find((term) => text.toLocaleLowerCase().includes(term));
    const index = firstTerm === undefined ? 0 : text.toLocaleLowerCase().indexOf(firstTerm);
    hits.push({ path: relativePath, score, excerpt: text.slice(Math.max(0, index - 180), Math.max(0, index - 180) + 600) });
  }
  return hits.sort((left, right) => right.score - left.score || left.path.localeCompare(right.path)).slice(0, limit);
}

export function isMemoryDocumentPath(relativePath: string): boolean {
  const safe = safeRelativePath(relativePath);
  if (!safe.toLowerCase().endsWith('.md')) return false;
  return ['AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md', 'BOOTSTRAP.md', 'MEMORY.md'].includes(safe) || safe.startsWith('memory/');
}

export async function readMemoryFile(root: string, relativePath: string, input: MemoryConfigInput = DEFAULT_CONFIG): Promise<MemoryFileRead> {
  const config = normalizeConfig({ ...input, root });
  const safe = safeRelativePath(relativePath);
  if (!isMemoryDocumentPath(safe)) throw new Error('only OpenClaw Markdown memory files are exposed');
  if (!config.includeCredentials && isCredentialPath(safe)) throw new Error('credential files are not exposed by shared-memory UI');
  const absolute = resolveInsideRoot(root, safe);
  const stat = await fs.stat(absolute);
  if (!stat.isFile()) throw new Error('only regular files can be read');
  const content = await fs.readFile(absolute, 'utf8');
  if (content.length > config.maxFileChars) throw new Error(`file exceeds ${config.maxFileChars} character read cap`);
  return { path: safe, content, version: `${stat.mtimeMs}:${stat.size}`, size: stat.size };
}

export async function writeMemoryFile(root: string, relativePath: string, content: string, expectedVersion: string | undefined, input: MemoryConfigInput = DEFAULT_CONFIG): Promise<MemoryFileWrite> {
  const config = normalizeConfig({ ...input, root });
  const safe = safeRelativePath(relativePath);
  if (!isMemoryDocumentPath(safe)) throw new Error('only OpenClaw Markdown memory files are writable');
  if (!config.includeCredentials && isCredentialPath(safe)) throw new Error('credential files are not writable through shared-memory UI');
  if (typeof content !== 'string') throw new TypeError('content must be a string');
  if (content.length > config.maxFileChars) throw new Error(`file exceeds ${config.maxFileChars} character write cap`);
  const absolute = resolveInsideRoot(root, safe);
  const stat = await fs.stat(absolute);
  if (!stat.isFile()) throw new Error('only regular files can be written');
  if (expectedVersion !== `${stat.mtimeMs}:${stat.size}`) {
    const error = new Error('file changed since it was read') as NodeJS.ErrnoException;
    error.code = 'MEMORY_CONFLICT';
    throw error;
  }
  await fs.writeFile(absolute, content, { encoding: 'utf8', mode: 0o600 });
  const updated = await fs.stat(absolute);
  return { path: safe, version: `${updated.mtimeMs}:${updated.size}`, size: updated.size };
}
