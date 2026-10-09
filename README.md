# dsh-openclaw-memory

[简体中文](README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/dsh-openclaw-memory?color=cb3837&label=npm)](https://www.npmjs.com/package/dsh-openclaw-memory)
[![CI](https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/dsh-openclaw-memory)](LICENSE)

## Keep your OpenClaw continuity when you move to DSH

You have already invested in a persona, preferences, operating rules, and long-term memory in OpenClaw. Moving to DeepSeek Harness should not mean starting over.

**`dsh-openclaw-memory` is the continuity layer for that transition:** it lets DSH read the same OpenClaw workspace, apply explicit context budgets and privacy boundaries, and manage the shared Markdown files from a native DSH Sidebar.

```text
OpenClaw workspace  ──┬──> OpenClaw
                      └──> dsh-openclaw-memory ──> DSH

One workspace. Two clients. No duplicate memory store.
```

> **Designed for:** people who currently use OpenClaw, are moving part of their workflow to DSH, and want to preserve the same identity, preferences, instructions, and accumulated memory.

## Why this exists

An assistant is more than a model endpoint. The useful continuity is usually in the workspace around it:

- `SOUL.md` and `IDENTITY.md` define how the assistant behaves;
- `USER.md` records the user and interaction preferences;
- `AGENTS.md`, `BOOTSTRAP.md`, and `MEMORY.md` carry operating rules and durable context;
- `memory/` contains the daily record that makes the workspace evolve over time.

When a user moves from OpenClaw to DSH, the costly part is not installing another client. It is preserving that accumulated context without creating a second, divergent copy.

This plugin keeps the workspace as the source of truth. DSH reads it directly, injects only the bounded context you configure, and exposes the same files through a controlled Sidebar workflow.

## What you get

### A migration path without a second memory system

Point the plugin at the OpenClaw workspace you already trust. There is no import wizard, hidden database, or automatic file migration. The files stay where they are, and both clients can work from the same source.

### Explicit context, not an opaque prompt dump

Choose which bootstrap files are included and set per-file and total budgets. Preview the exact context before it reaches an agent, including source size, injected characters, limits, and truncation state.

### A real editing surface inside DSH

Use the Sidebar to browse top-level Markdown files and the `memory/` tree, switch between source and rendered Markdown preview, edit, and save. Writes are constrained to the allowed workspace surface and protected by optimistic version checks.

### A deliberate safety boundary

Credential-like files, JSON artifacts, symlinks, absolute paths, and traversal attempts are excluded by default. Shared workspace content is treated as data, not as a higher-priority instruction than DSH system policy.

### Stable continuity across turns

With `continuation-skip`, the same agent reuses an unchanged snapshot until a source file or relevant configuration changes. That keeps context predictable and avoids unnecessary re-injection.

## Product surface

- **Bootstrap context:** independently select `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `BOOTSTRAP.md`, and `MEMORY.md`.
- **Daily memory:** optionally include recent `memory/YYYY-MM-DD.md` and up to four newest `memory/YYYY-MM-DD-*.md` files per day.
- **Context preview:** inspect the exact assembled snapshot and per-file budget accounting.
- **Memory search:** expose bounded keyword retrieval through `openclaw_memory_search`.
- **Remote API:** list, read, search, preview, and conflict-safe write operations through DSH Typert Remote.
- **Sidebar editor:** file tree, source/rendered preview, configuration editor, refresh, and explicit save.
- **Live settings:** update volatile configuration through DSH `Settings`/`ConfigEditor` with optimistic revision checks.

## See the workflow

### 1. Start from the DSH home surface

The plugin appears as a native DSH entry point alongside the workspace and terminal actions.

![DSH home surface with the shared-memory entry point](docs/screenshots/welcome.png)

### 2. Configure the handoff

Choose the OpenClaw files that should inform model context, set the shared root, and control daily memory independently. The configuration is visible rather than hidden in an opaque adapter.

![Shared OpenClaw workspace configuration in the DSH Sidebar](docs/screenshots/configuration.png)

### 3. Verify what DSH will actually receive

The injection preview shows the assembled context, per-file accounting, and truncation status. This is the checkpoint for a cautious migration: inspect the boundary before relying on it.

![Exact context injection preview](docs/screenshots/context-preview.png)

### 4. Continue maintaining the same workspace

Edit the same Markdown files from the Sidebar, preview the rendered result, and save only when you are ready. OpenClaw and DSH continue to meet at the same workspace boundary.

![Markdown file tree and editor in the DSH Sidebar](docs/screenshots/editor.png)

## Install

Install the published plugin into a DSH profile:

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

For development from a local checkout:

```sh
dsh plugin --profile web add link:/path/to/dsh-openclaw-memory
```

Then add the plugin configuration to the profile patch, or adapt the repository's [`cordis.patch.yml`](cordis.patch.yml):

```yaml
- id: openclaw-memory
  name: dsh-openclaw-memory
  config:
    # Use the OpenClaw workspace that contains your existing memory.
    root: /home/sunrise/.openclaw/workspace
    contextInjection: continuation-skip
    bootstrapFiles:
      - AGENTS.md
      - SOUL.md
      - IDENTITY.md
      - USER.md
      - BOOTSTRAP.md
      - MEMORY.md
    bootstrapMaxChars: 20000
    bootstrapTotalMaxChars: 60000
    userMaxChars: 4000
    dailyMemoryDays: 2
    dailyFileMaxBytes: 16384
    dailyFileMaxChars: 1200
    dailyTotalMaxChars: 2800
    includeDailyStartup: true
    timeZone: Asia/Shanghai
    includeCredentials: false
    maxFileChars: 200000
```

`contextInjection` supports:

- `always`: assemble context for every model request;
- `continuation-skip`: reuse an unchanged snapshot for the same agent;
- `never`: disable model context injection and the model-facing search tool while keeping the file Remote available when the profile loads the plugin.

### A cautious migration sequence

1. **Keep the existing OpenClaw workspace unchanged.** Back it up using your normal operational process before changing production settings.
2. **Install the plugin in a test or DSH profile.** Point `root` at the workspace that already contains the OpenClaw identity and memory files.
3. **Start with a narrow selection.** Enable only the files you intend to share and keep `includeCredentials: false`.
4. **Open Injection Preview.** Check the exact snapshot, budgets, and truncation before enabling regular context injection.
5. **Move traffic gradually.** Keep OpenClaw available while you validate DSH responses and Sidebar editing against the same files.

This plugin does not change OpenClaw's agent configuration. If OpenClaw and DSH point at different workspace directories, they are not sharing the same source of truth; review that change separately.

## Trust and security model

This plugin is intentionally a workspace bridge, not a general filesystem browser.

- The default root is `/home/sunrise/.openclaw/workspace` in the example patch; set it to your own canonical workspace.
- Only the configured bootstrap Markdown files and `memory/**/*.md` are in the managed surface.
- Credential and secret filenames are excluded by default. `includeCredentials: true` is an explicit opt-in and is not recommended for production.
- JSON artifacts are not part of the default index, and symlinks are ignored.
- Absolute paths and traversal are rejected.
- Reads and writes are bounded by configuration; writes use optimistic version checks to avoid overwriting a newer edit.
- Workspace text is untrusted data and cannot override DSH system policy.
- The package does not copy, migrate, delete, or silently rewrite OpenClaw files.

## Compatibility and limitations

- Requires a DSH profile that supports the plugin bundle patch and web client surface.
- The published package targets the DSH `0.2.0-rc.2` dependency line used by this release.
- The plugin reads Markdown workspace files; it does not synchronize OpenClaw's private session database or reconstruct conversations from another client's session store.
- It provides a shared file/context boundary. It does not promise identical model behavior across OpenClaw and DSH.
- Configuration changes are live when the profile's Loader can reconcile them; if DSH reports that reconciliation is unavailable, follow the profile's normal reload procedure.

## Development and verification

The maintainable source of truth is TypeScript under `src/`. Root-level JavaScript files are compatibility entrypoints, and the browser Sidebar is bundled separately for DSH's module loader.

```sh
npm install
npm run typecheck
npm test
npm pack --dry-run
```

The test suite uses temporary directories and does not read the real OpenClaw workspace or production profile. It covers behavior, async/sync parity, path and write safety, package exports, declarations, Remote/Typert descriptors, and the DSH client loader contract.

## Project status

`dsh-openclaw-memory` is an MIT-licensed community plugin. The current release is `0.1.4`.

- Repository: <https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory>
- npm: <https://www.npmjs.com/package/dsh-openclaw-memory>
- Issues: <https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/issues>
- DSH Plugin Hub submission: <https://dsh-plugin.org/zh/submit>

## License

MIT
