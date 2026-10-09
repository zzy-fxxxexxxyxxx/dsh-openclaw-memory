import { promises as fs, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_CONFIG } from './constants.js';
import { normalizeConfig, truncateChars } from './config.js';
import { isCredentialPath, resolveInsideRoot } from './paths.js';
import type { BoundedMemoryFile, MemoryConfig, MemoryConfigInput } from '../types/domain.js';

const MAX_SLUGGED_FILES_PER_DAY = 4;

function shiftDateKey(dateKey: string, offset: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! - offset)).toISOString().slice(0, 10);
}

function localDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT';
}

export function startupMemoryFileNamesSync(root: string, dateKey: string, includeCredentials = false): string[] {
  const memoryRoot = resolveInsideRoot(root, 'memory');
  const canonical = `${dateKey}.md`;
  try {
    const slugged = readdirSync(memoryRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md') && entry.name.startsWith(`${dateKey}-`) && (includeCredentials || !isCredentialPath(`memory/${entry.name}`)))
      .map((entry) => {
        try { return { name: entry.name, mtimeMs: statSync(path.join(memoryRoot, entry.name)).mtimeMs }; }
        catch { return undefined; }
      })
      .filter((entry): entry is { name: string; mtimeMs: number } => entry !== undefined)
      .sort((left, right) => right.mtimeMs - left.mtimeMs || right.name.localeCompare(left.name))
      .slice(0, MAX_SLUGGED_FILES_PER_DAY)
      .map(({ name }) => name);
    return [canonical, ...slugged];
  } catch (error) {
    if (isMissing(error)) return [canonical];
    throw error;
  }
}

async function startupMemoryFileNames(root: string, dateKey: string, includeCredentials: boolean): Promise<string[]> {
  const memoryRoot = resolveInsideRoot(root, 'memory');
  const canonical = `${dateKey}.md`;
  try {
    const entries = await fs.readdir(memoryRoot, { withFileTypes: true });
    const slugged = (await Promise.all(entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md') && entry.name.startsWith(`${dateKey}-`) && (includeCredentials || !isCredentialPath(`memory/${entry.name}`)))
      .map(async (entry) => {
        try { return { name: entry.name, mtimeMs: (await fs.stat(path.join(memoryRoot, entry.name))).mtimeMs }; }
        catch { return undefined; }
      })))
      .filter((entry): entry is { name: string; mtimeMs: number } => entry !== undefined)
      .sort((left, right) => right.mtimeMs - left.mtimeMs || right.name.localeCompare(left.name))
      .slice(0, MAX_SLUGGED_FILES_PER_DAY)
      .map(({ name }) => name);
    return [canonical, ...slugged];
  } catch (error) {
    if (isMissing(error)) return [canonical];
    throw error;
  }
}

async function readDailyFile(root: string, relativePath: string, config: MemoryConfig): Promise<BoundedMemoryFile | undefined> {
  try {
    const absolute = resolveInsideRoot(root, relativePath);
    const buffer = await fs.readFile(absolute);
    const source = buffer.subarray(0, config.dailyFileMaxBytes).toString('utf8');
    const stat = await fs.stat(absolute);
    const clipped = truncateChars(source, config.dailyFileMaxChars);
    return {
      path: relativePath,
      text: clipped.text,
      sourceChars: source.length,
      sourceBytes: stat.size,
      maxChars: config.dailyFileMaxChars,
      truncated: stat.size > config.dailyFileMaxBytes || clipped.truncated,
    };
  } catch (error) {
    if (isMissing(error)) return undefined;
    throw error;
  }
}

export async function loadStartupDaily(root: string, input: MemoryConfigInput = DEFAULT_CONFIG, now = new Date()): Promise<BoundedMemoryFile[]> {
  const config = normalizeConfig({ ...input, root });
  if (!config.includeDailyStartup || config.dailyMemoryDays === 0) return [];
  const files: BoundedMemoryFile[] = [];
  let usedChars = 0;
  const today = localDateKey(now, config.timeZone);
  for (let offset = 0; offset < config.dailyMemoryDays; offset += 1) {
    const dateKey = shiftDateKey(today, offset);
    for (const fileName of await startupMemoryFileNames(root, dateKey, config.includeCredentials)) {
      const file = await readDailyFile(root, `memory/${fileName}`, config);
      if (file === undefined) continue;
      const remaining = config.dailyTotalMaxChars - usedChars;
      if (remaining <= 0) return files;
      const bounded = truncateChars(file.text, remaining);
      files.push({ ...file, text: bounded.text, truncated: file.truncated || bounded.truncated });
      usedChars += bounded.text.length;
      if (bounded.truncated) return files;
    }
  }
  return files;
}

export function loadStartupDailySync(root: string, input: MemoryConfigInput = DEFAULT_CONFIG, now = new Date()): BoundedMemoryFile[] {
  const config = normalizeConfig({ ...input, root });
  if (!config.includeDailyStartup || config.dailyMemoryDays === 0) return [];
  const files: BoundedMemoryFile[] = [];
  let usedChars = 0;
  const today = localDateKey(now, config.timeZone);
  for (let offset = 0; offset < config.dailyMemoryDays; offset += 1) {
    const dateKey = shiftDateKey(today, offset);
    for (const fileName of startupMemoryFileNamesSync(root, dateKey, config.includeCredentials)) {
      try {
        const absolute = resolveInsideRoot(root, `memory/${fileName}`);
        const buffer = readFileSync(absolute);
        const stat = statSync(absolute);
        const source = buffer.subarray(0, config.dailyFileMaxBytes).toString('utf8');
        const clipped = truncateChars(source, config.dailyFileMaxChars);
        const remaining = config.dailyTotalMaxChars - usedChars;
        if (remaining <= 0) return files;
        const bounded = truncateChars(clipped.text, remaining);
        files.push({ path: `memory/${fileName}`, text: bounded.text, sourceChars: source.length, sourceBytes: stat.size, maxChars: config.dailyFileMaxChars, truncated: stat.size > config.dailyFileMaxBytes || clipped.truncated || bounded.truncated });
        usedChars += bounded.text.length;
        if (bounded.truncated) return files;
      } catch (error) {
        if (!isMissing(error)) throw error;
      }
    }
  }
  return files;
}
