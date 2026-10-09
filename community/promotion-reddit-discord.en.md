# Reddit / Discord promotion draft

Suggested title:

```text
Keep your OpenClaw persona and memory when moving to DeepSeek Harness
```

Post:

```markdown
I built `dsh-openclaw-memory` for people moving from OpenClaw to DeepSeek Harness who do not want to rebuild their assistant's persona and accumulated memory.

It reads the same OpenClaw Markdown workspace and gives DSH:

- bounded bootstrap and daily-memory context;
- exact injection preview with per-file budgets and truncation state;
- a Sidebar file tree with source/rendered Markdown preview and explicit save;
- bounded search through `openclaw_memory_search`;
- default exclusion of credential-like files, JSON artifacts, and symlinks;
- lstat-based rejection of symlink path components on Remote reads/writes.

Install:

```sh
dsh plugin --profile web add dsh-openclaw-memory
```

The project deliberately does not copy, migrate, delete, or silently rewrite the OpenClaw workspace. It provides a shared file/context boundary, not identical model behavior across runtimes.

GitHub: https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory
npm: https://www.npmjs.com/package/dsh-openclaw-memory

Current release: 0.1.4, MIT.
```

Channel rules: post only where plugin/tool projects are allowed; adapt the title and length to the channel; do not cross-post identical content to multiple communities in a short interval; do not include private workspace data.
