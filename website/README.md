# jsPsych Timelines website

Docusaurus site for [timelines.jspsych.org](https://timelines.jspsych.org), built on the shared `@jspsych/docusaurus-preset` / `@jspsych/docusaurus-theme`.

## Run locally

From the repo root install the monorepo once (the site builds packages from it), then the site:

```bash
npm ci
cd website
npm ci
npm start        # builds packages, generates assets, starts the dev server
npm run build    # production build into website/build
npm run serve
```

The site is **not** an npm workspace (like PACKAGE-STANDARD section 12 says). It has its own `package-lock.json` so the Docusaurus pins and `overrides` do not touch the packages' dependency tree. It only needs the root install for the packages' build tooling.

## How packages get onto the site

`docs-packages.json` lists the packages that have a page. `npm run build` and `npm start` first run `scripts/build-package-assets.mjs`, which for each one:

1. runs `npm run build` in `packages/<task>` (so a PR preview shows that PR's code, not npm's);
2. copies `dist/index.browser.js` to `static/bundles/<task>/index.browser.js` (global name read from the build script's `--global-name`);
3. generates `src/schemas/<task>.schema.json` from the exported `<Task>Options` interface with `ts-json-schema-generator`. Doc comments become `description`; a trailing `(default: X)` becomes `default`. Object options typed from the defaults (like `text`) are reduced to a string map, with their keys kept in `x-keys` / `x-function-keys`;
4. merges `packages/<task>/docs-meta/options.meta.json` if it exists. For each property in both files the meta's `x-jspsych` object is deep-merged into the generated property. Properties only in the meta file are ignored with a warning. `x-jspsych-presets` replaces the schema's presets. `x-jspsych-spec` (provenance) is passed through.

Outputs (`static/bundles`, `src/schemas`) are gitignored. Use `node scripts/build-package-assets.mjs --skip-build flanker` to regenerate without rebuilding packages.

## Adding a package page

1. Add `{"task": "<task>"}` to `docs-packages.json` (optional `optionsType`, `globalName`).
2. Copy `templates/package-page.mdx` to `docs/reference/<task>.mdx` and fill it in; mark missing content TODO.
3. Optionally add `packages/<task>/docs-meta/options.meta.json`.

## Deploy and PR previews

Deviation from `jspsych-docs-theme/NEW_SITE.md`: the site deploys from the `gh-pages` branch, not the Actions-artifact deploy, so that PR previews can live in the same branch.

- `.github/workflows/website-deploy.yml`: on push to `main`, builds and publishes to the `gh-pages` root (`keep_files` preserves `pr-preview/`).
- `.github/workflows/website-preview.yml`: on PRs, builds with `DOCUSAURUS_BASE_URL=/pr-preview/pr-<N>/`, publishes to `gh-pages/pr-preview/pr-<N>/` with `rossjrw/pr-preview-action`, comments the link, and removes it when the PR closes. Fork PRs are skipped.

The site reads `baseUrl` from `DOCUSAURUS_BASE_URL` (default `/`).

### Repo settings

Already done: the `gh-pages` branch exists and Pages is enabled from `gh-pages` / root with custom domain `timelines.jspsych.org`.

Remaining:

1. DNS: add a CNAME record `timelines` pointing to `jspsych.github.io`, then enable "Enforce HTTPS" in Settings, Pages.
2. Check Settings, Actions, General: workflow permissions must allow writing (the workflows request `contents: write` and `pull-requests: write`).
3. Add the site to the jsPsych ecosystem list in `jspsych-docs-theme` (NEW_SITE.md section 4).

How the deploy keeps the branch intact: `static/CNAME` and `static/.nojekyll` are part of every build, the deploy action also writes `.nojekyll`, and `keep_files: true` means a main deploy overwrites files but never deletes `pr-preview/`. Previews are written to `pr-preview/pr-<N>/` on the same branch.
