import path from 'node:path';
import { BOOTSTRAP_FILE_NAMES, CREDENTIAL_FILE_NAMES, DEFAULT_CONFIG } from './constants.js';
import type { MemoryConfig, MemoryConfigInput } from '../types/domain.js';

export function normalizeConfig(input: MemoryConfigInput = {}): MemoryConfig {
  const config = { ...DEFAULT_CONFIG, ...input } as MemoryConfig;
  const selected = new Set(config.bootstrapFiles);
  if (selected.size !== config.bootstrapFiles.length || config.bootstrapFiles.some((name) => !BOOTSTRAP_FILE_NAMES.includes(name as never))) {
    throw new TypeError('bootstrapFiles must contain unique known bootstrap filenames');
  }
  config.bootstrapFiles = Object.freeze(BOOTSTRAP_FILE_NAMES.filter((name) => selected.has(name)));
  if (typeof config.root !== 'string' || !path.isAbsolute(config.root)) throw new TypeError('root must be an absolute path');
  if (!['always', 'continuation-skip', 'never'].includes(config.contextInjection)) {
    throw new TypeError('contextInjection must be always, continuation-skip, or never');
  }
  for (const key of [
    'bootstrapMaxChars', 'bootstrapTotalMaxChars', 'userMaxChars',
    'dailyFileMaxBytes', 'dailyFileMaxChars', 'dailyTotalMaxChars', 'maxFileChars',
  ] as const) positiveInteger(config[key], key);
  nonNegativeInteger(config.dailyMemoryDays, 'dailyMemoryDays');
  if (typeof config.timeZone !== 'string' || config.timeZone.trim() === '') throw new TypeError('timeZone must be a non-empty IANA timezone');
  try { new Intl.DateTimeFormat('en-CA', { timeZone: config.timeZone }).format(); }
  catch { throw new TypeError('timeZone must be a valid IANA timezone'); }
  for (const key of ['includeDailyStartup', 'includeCredentials'] as const) {
    if (typeof config[key] !== 'boolean') throw new TypeError(`${key} must be boolean`);
  }
  return Object.freeze(config);
}

function positiveInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 1) throw new TypeError(`${name} must be a positive safe integer`);
  return value;
}

function nonNegativeInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`${name} must be a non-negative safe integer`);
  return value;
}

export function truncateChars(text: string, limit: number): { text: string; truncated: boolean } {
  if (text.length <= limit) return { text, truncated: false };
  const suffix = '\n\n[Truncated by shared-memory budget.]';
  if (limit <= suffix.length) return { text: text.slice(0, limit), truncated: true };
  const bodyLimit = limit - suffix.length;
  return { text: text.slice(0, bodyLimit) + suffix, truncated: true };
}

export const CONFIG_KEYS = Object.freeze(Object.keys(DEFAULT_CONFIG) as Array<keyof MemoryConfig>);

export function patchConfig(input: unknown): MemoryConfigInput {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('config patch must be an object');
  const record = input as Record<string, unknown>;
  const unknown = Object.keys(record).filter((key) => !CONFIG_KEYS.includes(key as keyof MemoryConfig));
  if (unknown.length > 0) throw new TypeError(`unknown config field: ${unknown.join(', ')}`);
  return record as MemoryConfigInput;
}
