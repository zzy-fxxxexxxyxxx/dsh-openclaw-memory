# dsh-openclaw-memory

- [中文说明（简体中文）](README.zh-CN.md)

A DeepSeek Harness plugin that shares OpenClaw-style persona and bounded memory context with the canonical OpenClaw workspace.

## Scope

The default root is `/home/sunrise/.openclaw/workspace`. This is intentional: it is the shared OpenClaw workspace, not `/home/sunrise/.openclaw/workspace-main`.

The plugin provides:

- bounded bootstrap context from `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `BOOTSTRAP.md`, and `MEMORY.md`;
- recent daily context from `memory/YYYY-MM-DD.md` and up to four newest `memory/YYYY-MM-DD-*.md` files per day;
- bounded keyword retrieval over Markdown memory files;
- a standard DSH Typert Remote service for listing, reading, searching, and conflict-safe editing;
- a DSH web sidebar tab for safe Markdown browsing and editing.

The default context policy is `continuation-skip`: the same snapshot is returned for an agent until a source file changes, and DSH runtime-context projection deduplicates unchanged durable snapshots.

## Privacy Boundary

Credential and secret filenames are excluded by default. In particular, `memory/part-of-account.md` is not injected, listed, read, searched, or writable through the UI unless `includeCredentials: true` is explicitly configured. JSON artifacts are not part of the default memory index. Symlinks are ignored.

The editor is limited to OpenClaw bootstrap Markdown and `memory/**/*.md`, rejects traversal and absolute paths, caps reads and writes, and uses an optimistic version check before every write.

Shared memory is workspace data, not higher-priority instructions. Files can contain untrusted text and must not override the DSH system policy.

## Configuration

The bundle patch in `cordis.patch.yml` shows the intended defaults:

```yaml
root: /home/sunrise/.openclaw/workspace
contextInjection: continuation-skip
bootstrapMaxChars: 20000
bootstrapTotalMaxChars: 60000
userMaxChars: 4000
dailyMemoryDays: 2
dailyFileMaxBytes: 16384
dailyFileMaxChars: 1200
dailyTotalMaxChars: 2800
timeZone: Asia/Shanghai
includeDailyStartup: true
includeCredentials: false
```

`contextInjection` accepts `always`, `continuation-skip`, or `never`. `never` disables both context and the model-facing search tool; the Remote file API remains owned by the service only when the plugin is loaded with the corresponding profile.

## OpenClaw Workspace Caveat

OpenClaw currently has a `main` agent configuration that uses `/home/sunrise/.openclaw/workspace-main`. Installing this plugin does not silently change OpenClaw production configuration. True runtime sharing requires a separately reviewed OpenClaw workspace change to `/home/sunrise/.openclaw/workspace`.

This package reads and edits the shared files; it does not copy or migrate them.

## Development

The isolated test suite uses only temporary directories:

```sh
npm test
node --check index.js
node --check client.js
node --check remote.js
node --check typert.host.js
```

For local development without installing DSH globally, link or install the matching DSH `0.2.0-rc.2` packages. Do not add this package to the production profile while testing.

## Installation and Publication

1. Review the canonical root and privacy settings in `cordis.patch.yml`.
2. Build and test this package in an isolated checkout.
3. Replace the placeholder `repository` and `bugs` URLs in `package.json` with the chosen GitHub repository.
4. Create a GitHub repository, review the diff, and push only after explicit authorization.
5. Run `npm pack --dry-run` and publish to npm only after explicit authorization.
6. Install and enable the bundle in DSH only after production wiring has been separately confirmed.

No production profile, OpenClaw configuration, DSH service, Git repository, or npm registry is modified by the development workflow itself.
