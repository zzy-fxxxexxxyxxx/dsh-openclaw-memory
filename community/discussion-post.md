# 📢 "Show Your Plugins!" — dsh-openclaw-memory v0.1.4

Post title: `dsh-openclaw-memory: share one OpenClaw persona + memory with DeepSeek Harness`

## Basic prompt

**Title: dsh-openclaw-memory — give DeepSeek Harness the same persona and memory as your OpenClaw workspace**

**dsh-openclaw-memory** is a DSH plugin that makes DSH agents share the **same OpenClaw workspace** — same persona, persona files, MEMORY.md, and daily memory — in one shared, bounded, safe Markdown context.

**Install:**

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

It injects the OpenClaw bootstrap + daily memory as **bounded** shared context (`continuation-skip` by default), exposes a safe Sidebar editor (VS Code-style file tree, source/rendered preview, live Settings/ConfigEditor), an exact injection preview, and a bounded `openclaw_memory_search` tool.

Why I built it: OpenClaw and DSH each had their own memory files. I wanted them to share one source of truth — the same workspace — so the persona and memory are the same everywhere. It reads the canonical workspace, never modifies it.

- Repo: https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory
- npm: `dsh-openclaw-memory@0.1.4`
- License: MIT
- Full docs: https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory#readme

**Try it:** `dsh plugin --profile web add dsh-openclaw-memory` then configure `cordis.patch.yml` and restart the profile; verify context preview and search in the Sidebar.
