# Community and discovery plan

This plan separates work that can be prepared locally from public actions that require the account owner to authorize the final send.

## Recommended order

1. Submit a DSH Plugin Hub Issue.
2. Open one Awesome DSH Plugin PR with `data/plugins/zzy-fxxxexxxyxxx__dsh-openclaw-memory.yml`.
3. Let `dsh-market` consume the Awesome registry; do not open a plugin-entry PR against `dsh-market` itself.
4. Publish the prepared post in the official DSH `Show Your Plugins!` Discussion.
5. After the first two listings are visible, share a tailored post in LINUX DO, Reddit, and relevant Discord channels.
6. Maintain the repository metadata and release checks; automate only checks whose input and output schemas are known.

## Authorization boundaries

- DSH Plugin Hub Issue: public external submission; ask before creating it.
- Awesome DSH Plugin PR: public external contribution; ask before opening it.
- Official DSH Discussion: public post under the user's GitHub account; ask before publishing it.
- LINUX DO, Reddit, and Discord: public posts under the user's accounts; ask separately for each platform.
- GitHub repository metadata: `description`, topics, releases, and commits are external changes; ask before changing them.

## What counts as success

- Hub Issue URL and status recorded.
- Awesome PR URL and CI result recorded.
- dsh-market listing verified after the Awesome registry refresh.
- Official Discussion URL recorded.
- Community posts link to the canonical GitHub README and npm package, use a platform-specific title, and disclose that the plugin is community-maintained.

## Long-term discoverability

- Keep `dsh-plugin` and relevant topics accurate.
- Keep the install command, `dsh.bundle.patch`, screenshots, license, compatibility line, and security boundary in both READMEs.
- Keep `screenshots.json` paths valid; storefronts can refresh them from the repository.
- Keep releases and npm dist-tags aligned.
- Run `npm run typecheck`, `npm test`, and `npm pack --dry-run` before every release.
- Do not build a speculative `discover-plugins.mjs`. DSH Plugin Hub and dsh-market already have their own crawler/catalog pipeline; a local discovery script should only be added after a concrete consumer and schema are identified.
