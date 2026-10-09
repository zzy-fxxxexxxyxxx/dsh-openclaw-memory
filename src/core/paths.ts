import path from 'node:path';
import { lstatSync } from 'node:fs';
import { lstat } from 'node:fs/promises';
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

function symlinkError(absolutePath: string): NodeJS.ErrnoException {
  const error = new Error(`symlink path components are not allowed: ${absolutePath}`) as NodeJS.ErrnoException;
  error.code = 'SYMLINK_PATH';
  return error;
}

export function isSymlinkPathError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'SYMLINK_PATH';
}

function components(absolutePath: string): string[] {
  const parsed = path.parse(absolutePath);
  const relative = path.relative(parsed.root, absolutePath);
  return relative === '' ? [] : relative.split(path.sep).filter(Boolean);
}

export function assertNoSymlinkPathSync(root: string, relativePath = ''): void {
  const absoluteRoot = path.resolve(root);
  let current = path.parse(absoluteRoot).root;
  for (const part of components(absoluteRoot)) {
    current = path.join(current, part);
    if (lstatSync(current).isSymbolicLink()) throw symlinkError(current);
  }
  const safe = safeRelativePath(relativePath);
  for (const part of safe === '' ? [] : safe.split('/')) {
    current = path.join(current, part);
    if (lstatSync(current).isSymbolicLink()) throw symlinkError(current);
  }
}

export async function assertNoSymlinkPath(root: string, relativePath = ''): Promise<void> {
  const absoluteRoot = path.resolve(root);
  let current = path.parse(absoluteRoot).root;
  for (const part of components(absoluteRoot)) {
    current = path.join(current, part);
    if ((await lstat(current)).isSymbolicLink()) throw symlinkError(current);
  }
  const safe = safeRelativePath(relativePath);
  for (const part of safe === '' ? [] : safe.split('/')) {
    current = path.join(current, part);
    if ((await lstat(current)).isSymbolicLink()) throw symlinkError(current);
  }
}
