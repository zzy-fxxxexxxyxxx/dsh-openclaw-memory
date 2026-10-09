import { promises as fs, readFileSync, statSync } from 'node:fs';
import { DEFAULT_CONFIG } from './constants.js';
import { normalizeConfig, truncateChars } from './config.js';
import { isCredentialPath, resolveInsideRoot, assertNoSymlinkPath, assertNoSymlinkPathSync, isSymlinkPathError } from './paths.js';
import type { BoundedMemoryFile, MemoryConfig, MemoryConfigInput } from '../types/domain.js';

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT';
}

export async function loadBootstrap(root: string, input: MemoryConfigInput = DEFAULT_CONFIG): Promise<BoundedMemoryFile[]> {
  const config = normalizeConfig({ ...input, root });
  const files: BoundedMemoryFile[] = [];
  let usedChars = 0;
  for (const relativePath of config.bootstrapFiles) {
    if (!config.includeCredentials && isCredentialPath(relativePath)) continue;
    try {
      await assertNoSymlinkPath(root, relativePath);
      const source = await fs.readFile(resolveInsideRoot(root, relativePath), 'utf8');
      const stat = await fs.stat(resolveInsideRoot(root, relativePath));
      const maxChars = relativePath === 'USER.md' ? config.userMaxChars : config.bootstrapMaxChars;
      const clipped = truncateChars(source, maxChars);
      const remaining = config.bootstrapTotalMaxChars - usedChars;
      if (remaining <= 0) break;
      const bounded = truncateChars(clipped.text, remaining);
      files.push({ path: relativePath, text: bounded.text, sourceChars: source.length, sourceBytes: stat.size, maxChars, truncated: clipped.truncated || bounded.truncated });
      usedChars += bounded.text.length;
      if (bounded.truncated) break;
    } catch (error) {
      if (!isMissing(error) && !isSymlinkPathError(error)) throw error;
    }
  }
  return files;
}

export function loadBootstrapSync(root: string, config: MemoryConfig): BoundedMemoryFile[] {
  const files: BoundedMemoryFile[] = [];
  let usedChars = 0;
  for (const relativePath of config.bootstrapFiles) {
    if (!config.includeCredentials && isCredentialPath(relativePath)) continue;
    try {
      const absolute = resolveInsideRoot(root, relativePath);
      assertNoSymlinkPathSync(root, relativePath);
      const source = readFileSync(absolute, 'utf8');
      const stat = statSync(absolute);
      const maxChars = relativePath === 'USER.md' ? config.userMaxChars : config.bootstrapMaxChars;
      const clipped = truncateChars(source, maxChars);
      const remaining = config.bootstrapTotalMaxChars - usedChars;
      if (remaining <= 0) break;
      const bounded = truncateChars(clipped.text, remaining);
      files.push({ path: relativePath, text: bounded.text, sourceChars: source.length, sourceBytes: stat.size, maxChars, truncated: clipped.truncated || bounded.truncated });
      usedChars += bounded.text.length;
      if (bounded.truncated) break;
    } catch (error) {
      if (!isMissing(error) && !isSymlinkPathError(error)) throw error;
    }
  }
  return files;
}
