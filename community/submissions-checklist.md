# Community submissions checklist — dsh-openclaw-memory v0.1.4

Release facts:
- npm package: `dsh-openclaw-memory@0.1.4` (latest)
- GitHub repo: `zzy-fxxxexxxyxxx/dsh-openclaw-memory`
- Git tag: `v0.1.4`
- Commit: `pending` (security release prepared locally)
- README: bilingual storefront with migration workflow and screenshots
- License: MIT
- `dsh.bundle.patch`: points to `./cordis.patch.yml` (marketplace hard requirement, present)
- Security fix: all shared-memory path components are checked with `lstat`; symlink files/directories are excluded from indexing and context, and rejected by Remote reads/writes.

## 1. GitHub discoverability (needs authorization)
- [x] Add GitHub topic `dsh-plugin` to repo (also add `openclaw`, `memory`, `dsh`, `plugin-if you like`)
- [ ] Keep repo active (commits + tags)
- [ ] Optional: add a socially shareable description to repo

## 2. DSH Plugin Hub
- [ ] Submit at https://dsh-plugin.org/zh/submit with repo URL `https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory`
- [ ] Check `build-dsh-plugin` precheck passes before submission

## 3. DSH-Store
- [ ] Submit public GitHub repo URL; bot reads metadata automatically
- [ ] Run `build-dsh-plugin` read-only precheck first

## 4. awesome-dsh-plugin
- [ ] Open PR adding a YAML entry (see draft in this file)
- [ ] This is a PR to an external repo — needs account authorization

## 5. dsh-market (if relevant)
- [ ] Open Issue requesting inclusion, referencing npm `dsh-openclaw-memory@0.1.4`

## 6. Official DSH Discussions
- [ ] Post under "Show Your Plugins!" in the deepseek-harness repo (needs authorization)
- Template for the post is in `community/discussion-post.md`

## 7. Community interactions
- [ ] Share in Reddit / LINUX DO / Discord when relevant threads appear
- Optional: docs/blog article and zhihu content

---

## awesome-dsh-plugin PR draft (YAML entry)

File: `awesome-dsh-plugin/data/plugins/dsh-openclaw-memory.yml` (adjust to actual data layout)

```yaml
name: dsh-openclaw-memory
description: Shared OpenClaw persona and bounded memory context for DeepSeek Harness, with a safe Markdown editor Sidebar.
long_description: |
  Reads the canonical OpenClaw workspace (AGENTS.md, SOUL.md, USER.md, MEMORY.md,
  memory/YYYY-MM-DD*.md) and injects it as bounded, safe shared context for DSH
  agents, plus a full Sidebar UI to browse, edit, preview, and search those files.
repo: https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory
npm: dsh-openclaw-memory
version: 0.1.4
license: MIT
platform:
  - web
tags:
  - memory
  - openclaw
  - persona
  - shared-context
  - markdown
```

## dsh-market Issue draft

```text
Title: Add dsh-openclaw-memory to dsh-market

Body:
npm: dsh-openclaw-memory
version: 0.1.4
repo: https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory
dsh.bundle.patch: present (cordis.patch.yml)
platform: web
license: MIT
Description: Shared OpenClaw persona and bounded memory context for DeepSeek Harness.
```
