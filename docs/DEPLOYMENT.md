# Deployment, ingestion and rollback

Version 3 retains React/TypeScript/Vite, Node 24 and static hosting. Vercel Hobby is the new production target; the existing GitHub Pages site and printed QR hub remain enabled. The verified production URL and deployment evidence are recorded in `QA_REPORT.md` after publication.

## Reproducible local checks

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run data:validate
npm run build
npm run test:e2e
```

The Playwright suite serves `dist/` at `127.0.0.1:4173/El-Nino-Warning-System/`; local editing uses port 5173. Browsers must be installed (`npx playwright install chromium`) if absent. The source-matched production dependency audit is `npm audit --omit=dev`. Do not use `npm audit fix --force` to downgrade the lint toolchain.

## Vercel settings

The authenticated scope was inspected and confirmed Hobby before creating `el-nino-warning-system`. No paid service, database, function, cron or notification service is provisioned. The project is linked locally; `.vercel/` and `.env.local` are ignored and must never be committed/uploaded. `.vercelignore` also excludes all environment files, tests, documentation and the large server-side baseline cache; sample coordinates and public runtime data remain available to the build.

`vercel.json` declares Vite, `npm ci`, `VITE_BASE_PATH=/ npm run build`, output `dist`, fresh HTML/service-worker/data cache policies, MIME-sniffing protection, referrer policy and restricted camera/microphone permissions. `package.json` pins Node 24.x. There is no catch-all rewrite that serves HTML for a missing JSON file. Hash routes work at the root URL.

Deployment with an authenticated official CLI:

```sh
vercel link --yes --project el-nino-warning-system
vercel deploy --prod --yes
```

Do not claim success merely from uploading. Wait for ready status, request the literal returned public URL without authentication, and verify main HTML, release version, source JSON, manifest/icons/worker, bilingual navigation, exports, map/list, unavailable states and offline expiry. Inspect deployment/build logs. The release is not an authoritative warning issuer.

For continuous delivery, connect the approved GitHub repository to this Vercel project and use `main` as the production branch. Make this connection only after the first redesign production deployment is verified, then integrate the tested branch through a normal reviewed pull request workflow. Do not use protected-branch bypass, force pushes, domain deletion or project deletion. Existing GitHub Pages remains an independent rollback/reference and printed-material destination.

## Shared data pipeline and quotas

`npm run data:refresh` runs the retained official assessment ingestion, operational weather/reanalysis, archive update and the new independent NOAA climate adapter. Atomic snapshots preserve independent source issue, model/observation, retrieval and valid times. Missing/invalid input does not become zero. The climate adapter retains all 1950+ RONI rows and nine source phase-probability rows with month-level issue precision.

The Actions workflow runs four times daily and on manual dispatch/main changes; PRs validate without refreshing or deploying. Forecast requests explicitly specify the Myanmar calendar range, avoiding a verified upstream midnight-default mismatch. ERA5 uses the same sample hash, same model and matching 1991–2020 normals. Only missing baseline dates are fetched; failed construction cannot replace a valid baseline. A persisted daily quota reservation caps baseline work at 4,500 weighted calls across retries and throttles below 450/minute, leaving headroom under free-tier quotas for forecasts/recent history. See `OPERATIONS.md` and current provider terms.

The workflow saves dated source snapshots, baseline cache and any daily budget ledger. Successful data commits can trigger the connected Vercel build (up to the existing four scheduled changes/day), below the verified Hobby deployment count. Bot commits do not recursively run the Pages workflow. This bounded static approach does not promise instant delivery; a future independently published snapshot store could separate data from builds if usage justifies it. No per-visitor provider polling and no invalid high-frequency Hobby cron are configured.

The final ingestion-health job reports provider failures after safe dated fallback publication. A green hosting status alone does not prove fresh data. GitHub schedules can delay/drop or disable after inactivity; retain manual dispatch and freshness checks.

## Offline and printed QR safety

The Pages base remains `/El-Nino-Warning-System/`; Vercel overrides only the build base. The content-versioned service worker bypasses HTTP cache during shell upgrades, retains the current and immediate prior shell, loads source data network-first and marks offline responses. Original dates survive fallback and expired warnings cannot be active. CSP permits same-origin scripts/styles/fonts/connect only; original-source links open normally. No provider secrets are needed.

`public/pamphlet/el-nino/` is a separate generated static hub with its own worker and explicit offline copy. The app never precaches/intercepts `pamphlet/`; all 30 tracked files remain unchanged. Keep the canonical printed [QR destination](https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/) and GitHub Pages enabled. Existing pamphlet regression tests are retained unchanged.

## Rollback

Record the release commit and Vercel deployment ID. Promote a prior ready deployment through Vercel rollback, or revert the faulty merge commit and rebuild. For the first Vercel release, the preserved Pages site/base commit is the fallback. Retain valid dated datasets and compatible schemas; never force-push or delete history to recover. A rollback must still expose stale/expired states. Main integration and future source refreshes remain recoverable through normal Git history.
