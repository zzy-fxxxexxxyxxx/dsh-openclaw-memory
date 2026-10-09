import path from 'node:path';
import { CREDENTIAL_FILE_NAMES } from './constants.js';

export function isCredentialPath(relativePath: string): boolean {
  const normalized = relativePath.replaceAll('\\', '/').replace(/^\.\//, '');
  const basename = path.posix.basename(normalized).toLowerCase();
  return CREDENTIAL_FILE_NAMES.includes(basename) || basename.includes('credential') || basename.includes('secret');
}

export function safeRelativePath(relativePath: string): string {
  if (typeof relativePath !== 'string' || relativePath.trim() === '') throw new TypeError('path must be a non-empty string');
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized)) throw new Error('absolute paths are not accepted');
  const clean = path.posix.normalize(normalized);
  if (clean === '..' || clean.startsWith('../') || clean.includes('/../')) throw new Error('path escapes the shared workspace');
  return clean === '.' ? '' : clean;
}

export function resolveInsideRoot(root: string, relativePath: string): string {
  const safe = safeRelativePath(relativePath);
  const absolute = path.resolve(root, safe);
  const rootWithSeparator = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (absolute !== root && !absolute.startsWith(rootWithSeparator)) throw new Error('path escapes the shared workspace');
  return absolute;
}
