# Community submissions checklist — dsh-openclaw-memory v0.1.4

Release facts:
- npm package: `dsh-openclaw-memory@0.1.4` (latest)
- GitHub repo: `zzy-fxxxexxxyxxx/dsh-openclaw-memory`
- Git tag: `v0.1.4`
- Commit: `ae1449e` (security release)
- README: bilingual storefront with migration workflow and screenshots
- License: MIT
- `dsh.bundle.patch`: points to `./cordis.patch.yml` (marketplace hard requirement, present)
- `screenshots.json`: declares four GitHub-hosted screenshots for downstream storefronts
- DSH market path: submit the Awesome DSH Plugin entry; `dsh-market` consumes that registry and does not accept plugin-entry PRs

## 1. GitHub discoverability (needs authorization)
- [x] Add GitHub topic `dsh-plugin` to repo (also add `openclaw`, `memory`, `dsh`, `plugin-if you like`)
- [ ] Keep repo active (commits + tags)
- [ ] Optional: add a socially shareable description to repo

## 2. DSH Plugin Hub
- [ ] Submit at https://dsh-plugin.org/zh/submit or create the prepared Issue from [`community/dsh-plugin-hub-issue.md`](dsh-plugin-hub-issue.md)
- [ ] Check `build-dsh-plugin` or the Hub's concrete install precheck before submission
- [ ] Record the resulting Issue URL and review status

## 3. DSH-Store / dsh-market
- [ ] The `dsh-market` README says its catalog comes from `awesome-dsh-plugin`; do not open a plugin-entry PR against `dsh-market`
- [ ] After the Awesome PR merges, verify the entry appears in dsh-market after its refresh cycle
- [ ] The separate `DshMarketPlace/dsh-plugins-store` project has no documented public plugin submission form; investigate only if that specific catalog is desired

## 4. awesome-dsh-plugin
- [ ] Open a PR adding exactly one file: `data/plugins/zzy-fxxxexxxyxxx__dsh-openclaw-memory.yml`
- [ ] Use the prepared local entry in [`community/awesome-dsh-plugin.yml`](awesome-dsh-plugin.yml)
- [ ] Category: `memory`
- [ ] Do not edit generated README files or add a hand-written `npm:` field
- [ ] This is a PR to an external repo and needs account authorization

## 5. Official DSH Discussions
- [ ] Post under the `Show Your Plugins!` category in the DeepSeek Harness repository
- [ ] Use the prepared copy in [`community/discussion-post.md`](discussion-post.md)
- [ ] Record the published Discussion URL

## 6. Community interactions
- [ ] Publish a tailored Chinese post in LINUX DO or another relevant Chinese developer community
- [ ] Publish a tailored English post in a relevant Reddit or Discord channel, only where plugin/tool promotion is allowed
- [ ] Keep external posts linked to the canonical README and npm package; do not paste private workspace content
- [ ] Optional: publish the longer migration tutorial after the first community feedback

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
