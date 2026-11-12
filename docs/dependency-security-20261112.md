# Dependency security update, 2026-11-12

Base: `ce18cd63e462d41186fa2ed348a385513531efcc` (main).

## Changes

- Upgrade Next.js and eslint-config-next together from 16.2.4 to 16.4.6.
- Upgrade @netlify/blobs from 10.7.4 to 10.7.13 within its existing major version.
- Refresh vulnerable lockfile dependencies, including Undici 7.30.2, PostCSS
  8.5.23, Sharp 0.35.5, and patched build/lint dependencies.
- Override minimatch to 11.0.1 only under @typescript-eslint/typescript-estree.
  Its existing 10.x range cannot select the fix for
  [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
  Keep this override until the upstream parser dependency accepts a patched
  release, then remove it and rerun the compatibility tests and audit.

The scoped override preserves the named minimatch API used by the parser and
does not replace the older minimatch branch used by other ESLint plugins.
React, React DOM, Cheerio, Playwright and application source are unchanged.

## Verification

The baseline passed 61 tests, type checking and build. Lint reported three
existing warnings and no errors. Before this update, the reproduced full audit
reported 31 affected package entries; production dependencies alone reported 19.

After this update:

- A clean `npm ci --ignore-scripts` reproduces the lockfile successfully.
- Full and production-only npm audits both report zero vulnerabilities.
- All 64 tests pass, including the three new dependency compatibility tests.
- Type checking passes, including Netlify Functions.
- Lint has no errors and the same three existing warnings.
- The production static build passes; structured-data validation checks 488
  files with no errors.
- Browser smoke testing could not start: the execution environment denied
  Chromium's local socket operation, including on the supported escalated run.
  Browser interaction checks are not counted as passed.

The new parser test exercises project-service allow-list behavior for exact,
wildcard and hidden filenames, including rejection of a nonmatching filename.
The new Blobs tests use the actual SDK with an intercepted transport, covering
site and deploy stores, strong consistency, JSON and metadata serialization,
conditional writes, missing keys, pagination and deletion. They never contact
Netlify or write live data.

Reproduce the checks with:

```sh
npm ci --ignore-scripts
npm audit
npm audit --omit=dev
npm run lint
node --test scripts/*.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
NEXT_TELEMETRY_DISABLED=1 npm run build
```

## Limits and release status

Zero audit findings describes the npm advisory database and locked dependencies
at verification time. It is not a guarantee against all application or platform
vulnerabilities. Node's built-in fetch, Netlify's deployed runtime and actual
production function bundles require separate platform verification.

Apply this dependency update with a `[skip netlify]` commit. Preview and
production deployment are excluded from this change. No live subscription/alert
changes or production exploit tests were performed during verification.
