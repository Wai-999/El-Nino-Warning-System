# Build, ingestion and deployment

Production: https://wai-999.github.io/El-Nino-Warning-System/

Node 24; `npm ci`. Run `npm run format:check`, `npm run lint`, `npm test`, `npm run data:validate`, `npm run build`, then `npm run test:e2e` after `npx playwright install chromium`. The browser suite uses the production preview on port 4173. Use `npm run dev` for local editing on port 5173.

## Data pipeline

`npm run data:refresh` runs NOAA ingestion, `scripts/refresh-operational.ts`, and `scripts/refresh-archive.ts`. The last step atomically appends distinct validated screening summaries and retains official history; invalid input leaves the prior archive untouched. Forecast, reanalysis and monthly Niño index have independent last-known-good fallbacks. `public/data/operational.json` is the compact validated client artifact. `scripts/cache/samples.json` and `climatology.json` are versioned server-side preprocessing inputs; no 30-year arrays reach the browser. The initial baseline fetch is several minutes and respects weighted rate limits. ERA5 recent data is fetched only when its end date changes; the baseline is replenished only for uncached calendar dates, with future buffer. Failed baseline construction never replaces a valid baseline.

The same sample hash must match the baseline. A boundary/sampling change requires rebuilding compatible baseline dates. To reproduce geometry, download the source GeoJSON archive linked in `public/data/boundary-source.json`, extract admin1, run `node scripts/prepare-geography.mjs path/to/mmr_admin1.geojson`, then simplify the generated `/tmp/mokinn-merged.geojson` with mapshaper `-dissolve shapeISO copy-fields=shapeName -simplify weighted 4% keep-shapes -o public/data/myanmar.geojson format=geojson precision=0.0001 force`. Review boundary changes before publication. Source archive is not committed.

GitHub Actions runs at 04:17, 10:17, 16:17, 22:17 UTC, after upstream six-hour model cycles with processing allowance. Schedules are best-effort, not guaranteed delivery. Manual dispatch and main pushes also run. Pull requests validate without refreshing published source data or deploying. No paid credentials or secrets are required. Free Open-Meteo is for noncommercial use; obtain a commercial plan before monetizing.

The workflow formats-checks/lints/tests, refreshes sources, validates/builds, runs desktop/tablet/mobile accessibility and offline checks, commits successful dated snapshots/cache using GITHUB_TOKEN, uploads dist, and deploys Pages. Bot data pushes do not recursively trigger workflows. Data failures deploy safe dated fallbacks; the final health job then fails to make the source issue visible. Check Actions and the in-app Data Status panel for provider problems. Never reset failed data to zero or rewrite valid times.

## Pages and release

Pages source is GitHub Actions. Vite base is `/El-Nino-Warning-System/`; hash routes need no server rewrites. CSP restricts scripts/styles/fonts/connect to self. The service worker uses content-versioned caches, network-first data and explicit offline markers. Precache requests bypass the HTTP cache so a still-fresh older HTML document cannot enter a new shell. The cache fingerprint includes both resource content and cache-policy source. Activation keeps the current and immediate prior shell, allowing already-open pages to load prior lazy assets. Navigation uses the current shell. It does not force-reload an active user's session.

Before releasing, verify all 15 polygons including Nay Pyi Taw, real regional values and dates, anomalies with 1991–2020 reference, official/system distinction, map layers and low-data/offline behavior. Check production `/`, `#/map`, `#/warnings`, `#/records`, `#/impacts`, `#/region/MM-18` on desktop and mobile; load the production operational JSON and inspect model, valid/fetched dates, provider health and 15-region coverage. Run `node scripts/verify-release.mjs https://wai-999.github.io/El-Nino-Warning-System/ docs/next-production-verification.json` to record live routing, responsive bilingual accessibility, source schemas and full offline restart. The regression suite also exercises a still-fresh prior HTTP cache during a service-worker upgrade. Create a semver Git tag/release only after successful Pages deployment and live verification. Preserve V1 commits.

Concurrency serializes runs on the same ref. Branch protection must permit the documented data bot or use a reviewed PR workflow; do not bypass protection. GitHub may disable schedules on inactive public repositories. There is no operational SLA; freshness labels remain the safety boundary if ingestion stops.

## Rollback

Prefer reverting the faulty code commit and running the workflow; retain valid dated source snapshots. Do not delete history or force-push main. If reverting to V1, use its compatible data schema and disclose that numerical regional capabilities are unavailable. Do not label obsolete forecasts live. Release artifacts and prior commits remain recoverable.
