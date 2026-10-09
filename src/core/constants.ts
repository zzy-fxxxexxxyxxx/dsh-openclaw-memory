import type { BootstrapFileName, MemoryConfig } from '../types/domain.js';

export const BOOTSTRAP_FILE_NAMES: readonly BootstrapFileName[] = Object.freeze([
  'AGENTS.md',
  'SOUL.md',
  'IDENTITY.md',
  'USER.md',
  'BOOTSTRAP.md',
  'MEMORY.md',
] as const);

export const DEFAULT_ROOT = '/home/sunrise/.openclaw/workspace';
export const CREDENTIAL_FILE_NAMES = Object.freeze(['part-of-account.md', 'credentials.md', 'credentials.json']);

export const DEFAULT_CONFIG: MemoryConfig = Object.freeze({
  root: DEFAULT_ROOT,
  contextInjection: 'continuation-skip',
  bootstrapFiles: BOOTSTRAP_FILE_NAMES,
  bootstrapMaxChars: 20_000,
  bootstrapTotalMaxChars: 60_000,
  userMaxChars: 4_000,
  dailyMemoryDays: 2,
  dailyFileMaxBytes: 16_384,
  dailyFileMaxChars: 1_200,
  dailyTotalMaxChars: 2_800,
  includeDailyStartup: true,
  timeZone: 'Asia/Shanghai',
  includeCredentials: false,
  maxFileChars: 200_000,
});
