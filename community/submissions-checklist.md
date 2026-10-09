# Community submissions checklist — dsh-openclaw-memory v0.1.4

Release facts:
- npm package: `dsh-openclaw-memory@0.1.4` (latest)
- GitHub repo: `zzy-fxxxexxxyxxx/dsh-openclaw-memory`
- Git tag: `v0.1.4`
- Commit: `2ce8d4e` (submission status and promotion materials; release code remains `ae1449e`)
- README: bilingual storefront with migration workflow and screenshots
- Repository description/homepage: configured for discoverability
- Plugin Hub Issue: https://github.com/dshplugin/dsh-plugin-hub/issues/140 (open, awaiting review)
- Awesome PR: https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/6998 (open, checks passed, maintainer review pending)
- Official Discussion: https://github.com/deepseek-ai/deepseek-harness/discussions/9288 (published)
- DSH Marketplace: repository submission accepted into manual review queue (`ok: true`, `duplicate: false`; listing URL pending review)
- GitHub Release: https://github.com/zzy-fxxxexxxyxxx/dsh-openclaw-memory/releases/tag/v0.1.4
- License: MIT
- `dsh.bundle.patch`: points to `./cordis.patch.yml` (marketplace hard requirement, present)
- `screenshots.json`: declares four GitHub-hosted screenshots for downstream storefronts
- DSH market path: submit the Awesome DSH Plugin entry; `dsh-market` consumes that registry and does not accept plugin-entry PRs

## 1. GitHub discoverability
- [x] Add GitHub topics `dsh-plugin`, `openclaw`, `memory-plugin`, `dsh`, `deepseek-harness`
- [x] Set a concise repository description and npm homepage
- [x] Publish the `v0.1.4` GitHub Release

## 2. DSH Plugin Hub
- [x] Create submission Issue: https://github.com/dshplugin/dsh-plugin-hub/issues/140
- [ ] Await maintainer review; answer concrete compatibility or install-check questions

## 3. DSH Marketplace / dsh-market
- [x] Submit the repository to independent DSH Marketplace review: `ok: true`, `duplicate: false`
- [ ] Await manual review and record the public listing URL when it exists
- [ ] `dsh-market` consumes the `awesome-dsh-plugin` registry; verify this listing after PR #6998 merges
- [ ] Do not open plugin-entry PRs against the `dsh-market` app repository
- [ ] The separate `DshMarketPlace/dsh-plugins-store` is a store client seeded from the same registry, not a separate manually-submitted directory

## 4. awesome-dsh-plugin
- [x] Open PR adding exactly one file: `data/plugins/zzy-fxxxexxxyxxx__dsh-openclaw-memory.yml`
- [x] Automated checks passed: https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/6998
- [ ] Await maintainer review and merge; do not edit generated README files

## 5. Official DSH Discussions
- [x] Publish in `Show Your Plugins!`: https://github.com/deepseek-ai/deepseek-harness/discussions/9288

## 6. Community interactions
- [ ] Publish the Chinese draft in LINUX DO or another relevant Chinese developer community after selecting an allowed board/thread
- [ ] Publish the English draft in a relevant Reddit or Discord channel only where plugin/tool promotion is allowed
- [ ] Keep external posts linked to the canonical README and npm package; do not paste private workspace content
- [ ] Optional: publish a longer migration tutorial after the first community feedback

## 7. Long-term discovery
- [ ] Keep GitHub topics, release tags, npm `latest`, README install command, screenshots, and `dsh.bundle.patch` aligned
- [ ] Run the release checks before every version update
- [ ] Do not add a speculative `discover-plugins.mjs` until a concrete catalog API and consumer are selected
- [ ] Follow [`community/discovery-plan.md`](discovery-plan.md)

## Prepared local materials

- DSH Plugin Hub Issue: [`community/dsh-plugin-hub-issue.md`](dsh-plugin-hub-issue.md)
- Awesome DSH Plugin entry: [`community/awesome-dsh-plugin.yml`](awesome-dsh-plugin.yml)
- Official Discussion draft: [`community/discussion-post.md`](discussion-post.md)
- Screenshot manifest: [`screenshots.json`](../screenshots.json)
