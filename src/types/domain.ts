export const BOOTSTRAP_FILE_NAMES = [
  'AGENTS.md',
  'SOUL.md',
  'IDENTITY.md',
  'USER.md',
  'BOOTSTRAP.md',
  'MEMORY.md',
] as const;

export type BootstrapFileName = (typeof BOOTSTRAP_FILE_NAMES)[number];
export type ContextInjection = 'always' | 'continuation-skip' | 'never';

export interface MemoryConfig {
  root: string;
  contextInjection: ContextInjection;
  bootstrapFiles: readonly BootstrapFileName[];
  bootstrapMaxChars: number;
  bootstrapTotalMaxChars: number;
  userMaxChars: number;
  dailyMemoryDays: number;
  dailyFileMaxBytes: number;
  dailyFileMaxChars: number;
  dailyTotalMaxChars: number;
  includeDailyStartup: boolean;
  timeZone: string;
  includeCredentials: boolean;
  maxFileChars: number;
}

export type MemoryConfigInput = Partial<Omit<MemoryConfig, 'bootstrapFiles'>> & {
  bootstrapFiles?: readonly string[];
};

export interface BoundedMemoryFile {
  path: string;
  text: string;
  sourceChars: number;
  sourceBytes: number;
  maxChars: number;
  truncated: boolean;
}

export interface PreviewFile extends BoundedMemoryFile {
  block: string;
  injectedChars: number;
}

export interface MemoryPreview {
  config: MemoryConfig;
  snapshot: string;
  snapshotChars: number;
  bootstrap: PreviewFile[];
  daily: PreviewFile[];
  bootstrapInjectedChars: number;
  dailyInjectedChars: number;
  contextEnabled: boolean;
}

export interface MemorySearchHit {
  path: string;
  score: number;
  excerpt: string;
}

export interface MemoryFileRead {
  path: string;
  content: string;
  version: string;
  size: number;
}

export interface MemoryFileWrite {
  path: string;
  version: string;
  size: number;
}
