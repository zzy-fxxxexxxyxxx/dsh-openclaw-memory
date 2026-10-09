# dsh-openclaw-memory

[中文说明（简体中文）](README.zh-CN.md)

**Give DeepSeek Harness (DSH) the same personhood and memory as your OpenClaw workspace — one shared set of Markdown files, safely injected, browsable, and editable in the DSH web sidebar.**

`dsh-openclaw-memory` is a DSH plugin that reads the canonical OpenClaw workspace directly and turns its persona files and daily memory (`AGENTS.md`, `SOUL.md`, `USER.md`, `MEMORY.md`, and `memory/YYYY-MM-DD*.md`) into **bounded, safe shared context** for DSH agents — plus a full Sidebar UI to browse, edit, preview, and search those files.

## ✨ Why it exists

OpenClaw and DSH should share one source of truth. Instead of letting two assistants drift, this plugin makes DSH **read the same workspace OpenClaw uses**, with strict budgets, explicit privacy defaults, and live configuration — so your DSH agents carry the same persona, memory, and memory files you already keep in your OpenClaw `workspace`.

## ✨ What it does

- **Shared persona + memory injection** — pick any of the six bootstrap candidates (`AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `BOOTSTRAP.md`, `MEMORY.md`), each with independent per-file and total character budgets.
- **Bounded daily memory** — recent `memory/YYYY-MM-DD.md` and the four newest `memory/YYYY-MM-DD-*.md` per day, quoted as explicitly untrusted daily notes.
- **Bounded keyword search** — a bounded `openclaw_memory_search` tool for agents, with per-file and total caps.
- **Exact context preview** — see **exactly** what will be sent: source size, budget, injected characters, and truncation, per file, in the Sidebar.
- **A safe Sidebar editor** — VS Code-style file tree (top-level Markdown vs. collapsible `memory/`), source / rendered preview, live `Settings`/`ConfigEditor`, optimistic concurrent-write protection, and per-file truncation checks.
- **`continuation-skip`** — snapshots stay stable until a source file changes; unchanged durable snapshots are reused, so context doesn't churn.
- **Live configuration** — all configuration is volatile; live profiles hot-reconcile without a DSH restart. Optimistic revision checks prevent overwriting concurrent edits.

## ⚖️ Privacy & security by default

- Credential and secret filenames are excluded by default (credential-like names and JSON artifacts are not injected, listed, read, searched, or writable unless you explicitly set `includeCredentials: true`).
- Only OpenClaw bootstrap Markdown and `memory/**/*.md` are editable; traversal and absolute paths are rejected; symlinks are ignored; reads and writes are capped; writes use an optimistic version check.
- Shared memory is **workspace data**, not higher-priority instructions. It can contain untrusted text and must not override DSH system policy.

## 🚀 Install

Install into a DSH profile (replacing the placeholder profile name as needed):

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

For a local checkout during development:

```sh
dsh plugin --profile web add link:/path/to/dsh-openclaw-memory
```

Pair it with the intended defaults in `cordis.patch.yml`:

```yaml
- id: openclaw-memory
  name: dsh-openclaw-memory
  config:
    root: /home/sunrise/.openclaw/workspace
    contextInjection: continuation-skip
    bootstrapFiles: [AGENTS.md, SOUL.md, IDENTITY.md, USER.md, BOOTSTRAP.md, MEMORY.md]
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
    maxFileChars: 200000
```

`contextInjection` accepts `always`, `continuation-skip`, or `never`.

## 📸 See it in action

> Screenshots will appear here (Sidebar overview, file tree, preview, configuration panel). Images are being added — drop the final screenshots below this section.

## ✅ Quick smoke check (works headlessly)

Outside a browser you can exercise the core library directly:

```sh
node --input-type=module - <<'NODE'
import { buildContextSnapshot, loadBootstrap } from 'dsh-openclaw-memory/memory-core';
const snapshot = await buildContextSnapshot('/home/sunrise/.openclaw/workspace', { bootstrapFiles: ['MEMORY.md'] });
console.log(snapshot);
console.log((await loadBootstrap('/home/sunrise/.openclaw/workspace', { bootstrapFiles: ['MEMORY.md'] })).map((f) => f.path));
NODE
```

## 📦 Configuration reference

All of the fields in `cordis.patch.yml` can also be edited live from the Sidebar. See the in-repo `cordis.patch.yml` for the canonical defaults.

## 🧱 OpenClaw workspace caveat

This plugin **reads** from the canonical OpenClaw workspace (default `/home/sunrise/.openclaw/workspace`). OpenClaw's `main` agent may still point at `/home/sunrise/.openclaw/workspace-main`; this plugin never changes that. For true runtime sharing, review and point OpenClaw at the same workspace yourself.

This package only reads and edits shared files — it never copies, migrates, or deletes OpenClaw files.

## 🧪 Improvements & tests

- The entire source is **TypeScript**, organized by responsibility under `src/` (core config/paths/bootstrap/daily/documents/context, service, remote/typert protocol, client Sidebar).
- Root-level `.js` files are thin compatibility entrypoints; `npm run build` compiles to `dist/` and bundles the client.
- 14 automated tests cover behavior plus protocol exports, declarations, and the DSH client loader contract.
- Tests use only temporary directories — never the real OpenClaw workspace or production profile.

```sh
npm run typecheck
npm test
npm pack --dry-run
```

## 🗺 Roadmap

- More daily memory sources and timezone-aware aggregation
- Search relevance tuning and faceted filters
- Extra community distributions and marketplace submissions

## 🤝 Community & support

- Report issues / request features: [GitHub Issues](https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/issues)
- DSH Plugin Hub: [dsh-plugin.org/zh/submit](https://dsh-plugin.org/zh/submit)
- Discussions welcome on the DSH repository's *Show Your Plugins!* category.

## 📄 License

MIT
