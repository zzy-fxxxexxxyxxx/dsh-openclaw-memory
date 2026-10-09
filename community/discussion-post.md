# 📢 "Show Your Plugins!" — dsh-openclaw-memory v0.1.4

Post title: `dsh-openclaw-memory: keep your OpenClaw persona and memory when moving to DSH`

## Basic prompt

If you are moving from OpenClaw to DeepSeek Harness, you should not have to rebuild the assistant's identity, preferences, operating rules, and long-term memory from scratch.

**dsh-openclaw-memory** lets DSH read the same OpenClaw workspace as OpenClaw itself. It turns the Markdown files you select into bounded shared context, and adds a native Sidebar for configuration, exact injection preview, file browsing, source/rendered preview, search, and explicit save.

**Install:**

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

A cautious migration looks like this:

1. Keep the existing OpenClaw workspace unchanged and point the plugin at that canonical directory.
2. Start with a test DSH profile and select only the bootstrap files you want to share.
3. Open Injection Preview to inspect the exact assembled context, budgets, and truncation state.
4. Move traffic gradually while OpenClaw remains available as a comparison point.

The boundary is deliberate:

- Bootstrap and daily memory are bounded by per-file and total character budgets.
- Credential-like names, JSON artifacts, symlinks, absolute paths, and traversal attempts are excluded or rejected by default.
- Remote reads and writes reject symlink path components.
- Shared workspace text is treated as data, not as higher-priority instructions than DSH system policy.
- The plugin does not copy, migrate, delete, or silently rewrite OpenClaw files. The Sidebar can explicitly edit the allowed Markdown files when you choose to save.
- It does not synchronize OpenClaw's private session database.

Screenshots and the full migration guide are in the README:

- Repository: https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory
- npm: https://www.npmjs.com/package/dsh-openclaw-memory
- Current release: `0.1.4`
- License: MIT

Feedback is welcome, especially around OpenClaw workspace layouts, DSH profile configuration, and which context boundaries make migration safer.
