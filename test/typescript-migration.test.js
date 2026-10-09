import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import test from 'node:test';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildContextSnapshot, buildContextSnapshotSync, DEFAULT_CONFIG, normalizeConfig } from '../memory-core.js';
import TYPERT from '../typert.host.js';
import TYPERT_REMOTE from '../remote.js';

test('compiled TypeScript public core preserves package behavior', async () => {
  const config = normalizeConfig({ root: '/tmp/dsh-openclaw-memory-test', bootstrapFiles: [] });
  assert.equal(config.contextInjection, DEFAULT_CONFIG.contextInjection);
  assert.deepEqual(config.bootstrapFiles, []);
  assert.equal(await buildContextSnapshot(config.root, { ...config, contextInjection: 'never' }), '');
  assert.equal(buildContextSnapshotSync(config.root, { ...config, contextInjection: 'never' }), '');
});

test('async and sync context assembly agree on the same fixture', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'dsh-openclaw-memory-ts-'));
  await mkdir(path.join(root, 'memory'), { recursive: true });
  await writeFile(path.join(root, 'MEMORY.md'), 'stable TypeScript migration memory');
  await writeFile(path.join(root, 'memory', '2026-10-07.md'), 'daily TypeScript migration note');
  const config = { root, bootstrapFiles: ['MEMORY.md'], dailyMemoryDays: 1 };
  const now = new Date('2026-10-07T06:00:00Z');
  assert.equal(await buildContextSnapshot(root, config, now), buildContextSnapshotSync(root, config, now));
});

test('compiled protocol descriptors preserve all Remote methods', () => {
  const remoteMethods = TYPERT_REMOTE.descriptors.map((descriptor) => descriptor.method);
  const hostMethods = TYPERT.invocations.map((invocation) => invocation.method);
  assert.deepEqual(remoteMethods, ['listFiles', 'readFile', 'writeFile', 'search', 'getConfig', 'updateConfig', 'preview']);
  assert.deepEqual(hostMethods, remoteMethods);
  assert.equal(TYPERT.package, 'dsh-openclaw-memory');
  assert.equal(TYPERT.face, 'host');
});

test('build emits declarations and DSH-compatible client loader', () => {
  for (const declaration of [
    'dist/core/index.d.ts',
    'dist/service/index.d.ts',
    'dist/remote/schema.d.ts',
    'dist/typert/host.d.ts',
  ]) assert.equal(existsSync(new URL(`../${declaration}`, import.meta.url)), true, declaration);
  const client = readFileSync(new URL('../client.js', import.meta.url), 'utf8');
  assert.match(client, /window\.__ModuleLoader__\.load/);
  assert.match(client, /dsh-openclaw-memory/);
  assert.match(client, /aria-expanded/);
  assert.match(client, /(?:[▼▶]|\\u25(?:BC|B6))/u);
  assert.match(client, /memory/);
});
