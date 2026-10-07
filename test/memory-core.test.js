import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  buildContextSnapshot,
  buildContextSnapshotSync,
  isCredentialPath,
  listMemoryFiles,
  loadBootstrap,
  loadStartupDaily,
  readMemoryFile,
  resolveInsideRoot,
  safeRelativePath,
  searchMemory,
  writeMemoryFile,
} from '../memory-core.js';

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'dsh-openclaw-memory-'));
  await mkdir(path.join(root, 'memory'), { recursive: true });
  await writeFile(path.join(root, 'AGENTS.md'), 'agent rules');
  await writeFile(path.join(root, 'SOUL.md'), 'soul');
  await writeFile(path.join(root, 'USER.md'), 'user');
  await writeFile(path.join(root, 'MEMORY.md'), 'stable memory about SearXNG');
  await writeFile(path.join(root, 'memory', '2026-10-07.md'), 'today memory about shared plugin');
  await writeFile(path.join(root, 'memory', 'topic.md'), 'historical topic about OpenClaw');
  await writeFile(path.join(root, 'memory', 'part-of-account.md'), 'secret password');
  return root;
}

test('bounds bootstrap and daily startup independently', async () => {
  const root = await fixture();
  const config = {
    root,
    bootstrapMaxChars: 5,
    bootstrapTotalMaxChars: 12,
    userMaxChars: 4,
    dailyMemoryDays: 1,
    dailyFileMaxBytes: 100,
    dailyFileMaxChars: 180,
    dailyTotalMaxChars: 180,
  };
  const bootstrap = await loadBootstrap(root, config);
  assert.equal(bootstrap[0].text.length <= 12, true);
  assert.equal(bootstrap.some((item) => item.path === 'MEMORY.md'), false);
  const daily = await loadStartupDaily(root, config, new Date('2026-10-07T06:00:00Z'));
  assert.equal(daily.length, 1);
  assert.equal(daily[0].path, 'memory/2026-10-07.md');
  assert.equal(daily[0].text.length <= 180, true);
  const snapshot = buildContextSnapshotSync(root, { ...config, dailyMemoryDays: 1, dailyFileMaxChars: 180, dailyTotalMaxChars: 180 }, new Date('2026-10-07T06:00:00Z'));
  const dailyBlock = snapshot.slice(snapshot.indexOf('## OpenClaw startup daily memory') + '## OpenClaw startup daily memory\n\n'.length);
  assert.ok(dailyBlock.length <= 180);
  assert.match(dailyBlock, /^\[Untrusted daily memory: memory\/2026-10-07\.md\]/);
});

test('startup daily context includes date-slugged notes like OpenClaw', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'memory', '2026-10-07-project.md'), 'slugged project memory');
  const daily = await loadStartupDaily(root, { root, dailyMemoryDays: 1, dailyFileMaxChars: 1200, dailyTotalMaxChars: 2800 }, new Date('2026-10-07T06:00:00Z'));
  assert.deepEqual(daily.map((item) => item.path), ['memory/2026-10-07.md', 'memory/2026-10-07-project.md']);
});

test('continuation snapshot is stable and refreshes from changed files', async () => {
  const root = await fixture();
  const config = { root, dailyMemoryDays: 1 };
  const first = buildContextSnapshotSync(root, config, new Date('2026-10-07T06:00:00Z'));
  assert.match(first, /OpenClaw shared bootstrap/);
  assert.match(first, /SearXNG/);
  await writeFile(path.join(root, 'MEMORY.md'), 'changed stable memory');
  const second = buildContextSnapshotSync(root, config, new Date('2026-10-07T06:00:00Z'));
  assert.match(second, /changed stable memory/);
  assert.equal(await buildContextSnapshot(root, { ...config, contextInjection: 'never' }), '');
});

test('excludes credential paths and JSON from default memory listing', async () => {
  const root = await fixture();
  const files = await listMemoryFiles(root);
  assert.ok(files.includes('MEMORY.md'));
  assert.ok(files.includes('memory/topic.md'));
  assert.ok(!files.includes('memory/part-of-account.md'));
  assert.equal(isCredentialPath('memory/part-of-account.md'), true);
  assert.equal(isCredentialPath('memory/notes.md'), false);
});

test('search returns bounded Markdown excerpts', async () => {
  const root = await fixture();
  const hits = await searchMemory(root, 'shared plugin', { root }, 2);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].path, 'memory/2026-10-07.md');
  assert.ok(hits[0].excerpt.includes('shared plugin'));
});

test('path containment and optimistic concurrency protect writes', async () => {
  const root = await fixture();
  assert.throws(() => safeRelativePath('../outside.md'), /escapes/);
  assert.throws(() => resolveInsideRoot(root, '/etc/passwd'), /absolute/);
  const initial = await readMemoryFile(root, 'MEMORY.md');
  await assert.rejects(() => readMemoryFile(root, 'openclaw.json'), /Markdown/);
  await assert.rejects(() => writeMemoryFile(root, 'memory/part-of-account.md', 'stale', initial.version), /credential/);
  await writeMemoryFile(root, 'MEMORY.md', 'updated', initial.version);
  await assert.rejects(() => writeMemoryFile(root, 'MEMORY.md', 'stale', initial.version), { code: 'MEMORY_CONFLICT' });
  assert.equal(await readFile(path.join(root, 'MEMORY.md'), 'utf8'), 'updated');
});
