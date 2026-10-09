import test from 'node:test';
import { Config } from '../index.js';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  buildContextPreviewSync,
  buildContextSnapshot,
  buildContextSnapshotSync,
  isCredentialPath,
  listMemoryFiles,
  loadBootstrap,
  normalizeConfig,
  loadStartupDaily,
  readMemoryFile,
  resolveInsideRoot,
  safeRelativePath,
  searchMemory,
  writeMemoryFile,
} from '../memory-core.js';

test('all Sidebar configuration fields are volatile and live-validatable', () => {
  const parsed = Config['~standard'].validate({ dailyMemoryDays: 0 });
  assert.equal(parsed.issues, undefined);
  assert.equal(parsed.value.root.get(), '/home/sunrise/.openclaw/workspace');
  assert.equal(parsed.value.dailyMemoryDays.get(), 0);
  assert.deepEqual(parsed.value.bootstrapFiles.get(), ['AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md', 'BOOTSTRAP.md', 'MEMORY.md']);
  const subset = Config['~standard'].validate({ bootstrapFiles: ['MEMORY.md'] });
  assert.equal(subset.issues, undefined);
  assert.deepEqual(subset.value.bootstrapFiles.get(), ['MEMORY.md']);
  const json = Config.toJSON();
  const fields = Object.values(json.refs).filter((ref) => ref.meta?.volatile);
  assert.equal(fields.length, 14);
});

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

test('per-file bootstrap selection controls context without hiding files', async () => {
  const root = await fixture();
  const config = { root, bootstrapFiles: ['MEMORY.md'], includeDailyStartup: false };
  const bootstrap = await loadBootstrap(root, config);
  assert.deepEqual(bootstrap.map((file) => file.path), ['MEMORY.md']);
  const snapshot = buildContextSnapshotSync(root, config);
  assert.match(snapshot, /stable memory about SearXNG/);
  assert.doesNotMatch(snapshot, /agent rules/);
  assert.ok((await listMemoryFiles(root, config)).includes('AGENTS.md'));
  assert.equal(buildContextSnapshotSync(root, { ...config, bootstrapFiles: [], includeDailyStartup: false }), '');
});

test('bootstrap selection rejects unknown and duplicate filenames', () => {
  assert.throws(() => normalizeConfig({ bootstrapFiles: ['AGENTS.md', 'AGENTS.md'] }), /unique known/);
  assert.throws(() => normalizeConfig({ bootstrapFiles: ['notes.md'] }), /unique known/);
});

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

test('preview reports exact injected blocks and truncation metadata', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'AGENTS.md'), 'x'.repeat(100));
  const preview = buildContextPreviewSync(root, { root, bootstrapMaxChars: 20, bootstrapTotalMaxChars: 60, dailyMemoryDays: 1, dailyFileMaxChars: 180, dailyTotalMaxChars: 180 }, new Date('2026-10-07T06:00:00Z'));
  const agents = preview.bootstrap.find((file) => file.path === 'AGENTS.md');
  assert.equal(agents.sourceChars, 100);
  assert.equal(agents.truncated, true);
  assert.equal(agents.injectedChars, agents.block.length);
  assert.equal(preview.daily[0].injectedChars <= 180, true);
  assert.equal(preview.snapshotChars, preview.snapshot.length);
  assert.equal(preview.snapshot, buildContextSnapshotSync(root, { root, bootstrapMaxChars: 20, bootstrapTotalMaxChars: 60, dailyMemoryDays: 1, dailyFileMaxChars: 180, dailyTotalMaxChars: 180 }, new Date('2026-10-07T06:00:00Z')));
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
  const withCredentials = await listMemoryFiles(root, { includeCredentials: true });
  assert.ok(withCredentials.includes('memory/part-of-account.md'));
});

test('search returns bounded Markdown excerpts', async () => {
  const root = await fixture();
  const hits = await searchMemory(root, 'shared plugin', { root }, 2);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].path, 'memory/2026-10-07.md');
  assert.ok(hits[0].excerpt.includes('shared plugin'));
});

test('symlinked workspace entries are excluded from context and rejected by Remote file access', async () => {
  const root = await fixture();
  const outside = await mkdtemp(path.join(tmpdir(), 'dsh-openclaw-memory-outside-'));
  try {
    await writeFile(path.join(outside, 'AGENTS.md'), 'outside bootstrap secret');
    await unlink(path.join(root, 'AGENTS.md'));
    await symlink(path.join(outside, 'AGENTS.md'), path.join(root, 'AGENTS.md'));

    await writeFile(path.join(outside, 'leaked.md'), 'outside memory secret');
    await symlink(path.join(outside, 'leaked.md'), path.join(root, 'memory', 'leaked.md'));

    const files = await listMemoryFiles(root);
    assert.ok(!files.includes('AGENTS.md'));
    assert.ok(!files.includes('memory/leaked.md'));
    assert.doesNotMatch(buildContextSnapshotSync(root, { root, dailyMemoryDays: 0 }), /outside (?:bootstrap|memory) secret/);
    assert.deepEqual(await searchMemory(root, 'outside secret', { root }), []);
    await assert.rejects(() => readMemoryFile(root, 'AGENTS.md'), { code: 'SYMLINK_PATH' });
    await assert.rejects(() => writeMemoryFile(root, 'AGENTS.md', 'overwrite', undefined), { code: 'SYMLINK_PATH' });
    await assert.rejects(() => readMemoryFile(root, 'memory/leaked.md'), { code: 'SYMLINK_PATH' });
    await assert.rejects(() => writeMemoryFile(root, 'memory/leaked.md', 'overwrite', undefined), { code: 'SYMLINK_PATH' });

    const directoryRoot = await mkdtemp(path.join(tmpdir(), 'dsh-openclaw-memory-directory-'));
    try {
      const outsideMemory = path.join(outside, 'memory');
      await mkdir(outsideMemory);
      await writeFile(path.join(outsideMemory, '2026-10-07.md'), 'outside daily secret');
      await rm(path.join(directoryRoot, 'memory'), { recursive: true, force: true });
      await symlink(outsideMemory, path.join(directoryRoot, 'memory'), 'dir');
      assert.ok(!(await listMemoryFiles(directoryRoot)).some((file) => file.startsWith('memory/')));
      assert.deepEqual(await loadStartupDaily(directoryRoot, { root: directoryRoot, dailyMemoryDays: 1 }, new Date('2026-10-07T06:00:00Z')), []);
      await assert.rejects(() => readMemoryFile(directoryRoot, 'memory/2026-10-07.md'), { code: 'SYMLINK_PATH' });
      await assert.rejects(() => writeMemoryFile(directoryRoot, 'memory/2026-10-07.md', 'overwrite', undefined), { code: 'SYMLINK_PATH' });
    } finally {
      await rm(directoryRoot, { recursive: true, force: true });
    }
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
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
