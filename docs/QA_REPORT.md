# Redesign validation record

Validation date: 31 October 2026 (owner timezone). Runtime dates use Myanmar time; near this release Myanmar is already on 1 November.

## Evidence recorded before deployment

- Original baseline: 69 unit tests, lint and source validation passed before changes.
- Redesign: 83 unit tests passed, including unchanged scientific/geometry/risk tests, real NOAA fixtures, invalid/future data, HTTP 429/503 cache fallback, exact warning expiry, synthetic-model guards, Myanmar dates, safe CSV, midnight forecast range and persistent daily quota accounting.
- Formatting, lint, TypeScript and production build passed.
- Source validation: 15 weather regions, 15 ERA5 regions, 82 archived summaries, 920 RONI seasons, nine probability rows and 44 indicator entries.
- Primary-source requests recovered ERA5 history and validated the explicit Myanmar-day forecast request; all operational provider health checks succeeded on the recovery run.
- Desktop/tablet/mobile functional checks passed, including navigation, keyboard map, 320px layout, 200% text, exports, offline restarts, issuer taxonomy, expiry while offline, cache upgrade and the printed QR hub.
- Automated WCAG 2.2 AA-tagged rules passed for all seven pages in both languages after repairing observed contrast failures. This is not a conformance certificate.
- All 30 tracked pamphlet files remain unchanged against the base commit; existing worker bypass and complete hub tests passed.

## Release checks and publication

- The inherited Zod advisory [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) was fixed by migrating record schemas to Zod 4.6.7. Compatible Vite 7.3.7, Vitest 4.1.12 and source-map updates removed high-severity development advisories. Production `npm audit --omit=dev` reports zero vulnerabilities. Eleven moderate minimatch advisories remain in development-only lint/TypeScript tooling; the audit's forced ESLint 4 downgrade is intentionally not applied. These packages are not shipped as production runtime dependencies.
- Final local browser suite: 50 passed, four intentionally skipped duplicate viewport cases (cache upgrade and explicit 320px/200% matrix run once on desktop). All seven pages passed WCAG-tagged automated rules in both languages across desktop, tablet and mobile. Warning expiry also passes at a non-interval-aligned 17-second boundary while offline.
- Public Vercel verification, deployment identity and repository review link are recorded below after successful execution.

## Visual and performance evidence

Screenshots: `docs/qa/` (desktop pages and Burmese mobile home). Browser preview was inspected at 1440×1000 and 390×844. Layout checks cover 320px, phone, tablet and desktop in both languages; 200% text remains within the viewport.

After the security migration, the entry JavaScript is about 116 kB gzip and CSS about 10.5 kB gzip; self-hosted Myanmar WOFF2 fonts total about 97 kB. Maps, RONI history and secondary pages are separate chunks; no heavy 3D or third-party provider requests occur on the homepage. The offline cache is about 1.52 MB uncompressed, excluding the 4.8 MB printed leaflet hub and first-use map geometry. These are build/lab measurements, not field Core Web Vitals. Performance on real low-end phones/mobile networks needs user testing.

## Unavailable capability and review limits

Official live Myanmar feed, township/village search and flood geography, river gauges/flood extent, calibrated long outlooks, standardized drought products, UV/air quality and browser/Telegram delivery remain unshipped with explicit reasons in the registry. Health guidance is static. No fake measurement, forecast probability, local warning, contact subscription or disease estimate is substituted.

Fluent Burmese editorial review, assistive-technology user testing and Myanmar meteorological/agricultural review cannot be certified by automated checks; these remain human review tasks. Simulations are explicitly educational/synthetic and isolated from warning inputs.

## Verified production publication

- Public production: https://el-nino-warning-system.vercel.app/
- Vercel deployment: `dpl_AsY8m3HhHSASSdv9LTBD1yBeY7xL`, ready production, basic Hobby build machine.
- Deployed code commit: `6228b197bae8c30fe71053848b4fd77648be2987`.
- Public HTTP evidence: `docs/qa/production-http.json`, all checks passed without authentication. Root JS/CSS, release 3.0.0, source contracts, 44-entry registry, manifest/icons and worker returned successfully; a missing JSON URL correctly returned 404. Weather and ERA5 were fresh and all operational provider health checks succeeded.
- Production build logs inspected: build/deployment succeeded; only documented development advisories and upstream annotation warnings remained. No runtime service/function was provisioned.
- Live browser evidence: `docs/qa/production-browser.json`. Burmese default, Myanmar digits/dates, English switch, 15 map regions/list, seven daily forecasts, CSV download, 44 registry entries and deep links, six synthetic learning modules and ENSO controls all worked at the production root without horizontal overflow at 390×844.
- Vercel project settings explicitly confirmed Vite, Node 24.x, `npm ci`, root-base build and `dist` output.
- Pull request: https://github.com/Wai-999/El-Nino-Warning-System/pull/1 . Initial GitHub build run `41227123693` passed.

The owner explicitly approved continuous deployment after automatic approval review required confirmation of persistent GitHub access and future deployment triggers. The Vercel CLI then confirmed the repository connection. No bypass or alternate integration was used. Main-branch code/data commits can now trigger Vercel publication; the existing bounded four-daily ingestion schedule remains best effort.

## V3.1 owner-decision completion checks

The preceding production evidence records the original 3.0.0 release. The V3.1 follow-up applies the subsequently confirmed 49-decision document; complete acceptance and remaining external gates are in `V3_DECISIONS_ACCEPTANCE.md`.

- 94 unit tests pass (8 files), including geographic hierarchy/ambiguity, WHO country/date/expiry failure cases, cached fallback and verified notice priority.
- Full Playwright matrix: 68 passed, four intentionally skipped duplicate viewport cases. Both languages and all primary pages pass WCAG-tagged rules on desktop, tablet and mobile; the township overview also passes automated accessibility checks. Offline warning expiry, cache upgrades and printed QR checks remain green.
- Formatting, lint, data validation and TypeScript production build pass. Validation covers 330 townships and every parent, 46 registry entries, three historical WHO publications, 15 weather/reanalysis regions, 920 RONI seasons and nine probability rows.
- Observed failures were repaired: animation-background contrast, source publication calendar date shifted by MMT conversion, and exact-name locator ambiguity after township results were added. No expiry or new clinical advice was manufactured.
- Entry JS is approximately 135 kB gzip; CSS approximately 11.5 kB gzip; offline shell about 1.65 MB uncompressed excluding the protected leaflet and first-use regional geometry. Township polygons are not downloaded. These are build/lab sizes, not field Core Web Vitals.
- `npm audit` still reports 11 moderate minimatch-related development-tool advisories (no high/critical); production dependencies remain clear. The reported fixed minimatch major and forced ESLint downgrade are not blindly substituted into incompatible tool APIs. This is documented development-tool exposure, not a shipped runtime dependency.
- Qualified Burmese/subject-matter, assistive-technology and physical-phone review remain external gates. The WHO monitor provides limited official publication metadata, not complete Myanmar current health-advisory coverage.

Post-merge public HTTP/browser evidence will be recorded separately to avoid an evidence-only commit causing another scheduled refresh and deployment.

Initial V3.1 public verification: production `https://el-nino-warning-system.vercel.app/`, deployment `dpl_5VtgVSRDNvZwUWk1svF8ci14XCPb`, code `a044fe003c7c3ef54638dd6ccedb2512ce37994c`. `docs/qa/v3-production-http.json` passed without authentication: release 3.1.0, 46 registry entries, fresh regional forecast/reanalysis, independent dated WHO records, PWA assets, missing-JSON 404 and worker policies. Follow-up review/release: https://github.com/Wai-999/El-Nino-Warning-System/pull/2 . Linux CI also identified undersized adjacent homepage source links; their explicit touch areas were enlarged rather than weakening accessibility rules.

## V3.2 specification-audit verification (1 November 2026)

- Required local unit suite: **109 passed in 10 files**. New cases verify distinct settlement identities/parents, reviewed names, retained retired references, all hourly source periods/units/bounds, missing optional data and bounded core retry, original briefing date across MMT midnight, completed rain sums and independent ONI/SOI/MEI source/period semantics.
- Formatting, lint, data validation and TypeScript/Vite build pass. Data validation covers 51 registry entries, 330 townships, 515 separate settlement points, 45 forecast points × 168 hours, and 920 ONI / 909 standardized SOI / 573 MEI published periods at this source check. Counts can grow with source updates; parser fixtures are versioned independently.
- Full local Playwright matrix: **84 passed, six intentionally skipped duplicate viewport cases** (cache upgrade, 320px/200%-text matrix and optional-detail offline policy each run once on desktop). Both languages, three responsive viewports, all new feature paths and the existing expiry/QR regressions pass. Observed legacy selector failures were repaired by scoping tests to the distinct regional list; the city and regional search controls now have independent queries. Linux CI and deployment evidence are recorded with the release.
- Direct visual inspection confirmed city names appear immediately when opening the picker, with filters and internal result scrolling; map labels and the selected settlement remain visible. New evidence: `docs/qa/v32-location-picker-en.png`, `v32-cities-map-en.png`, `v32-hourly-en.png`. Automated tests cover both languages/three viewports; this remains distinct from expert/native-reader certification.
- Measured entry JavaScript: approximately **156.5 kB gzip**; CSS **11.9 kB gzip**. Offline shell approximately **1.76 MB uncompressed**, excluding the protected printed hub, first-use regional geometry, hourly detail and advanced index payloads. Optional grid detail is about **118.4 kB gzip**; index history about **33.6 kB gzip**. No field Core Web Vitals or physical-device certification is asserted.
- `npm audit --omit=dev` reports **zero production vulnerabilities**. Existing development tooling advisory limitations remain documented above; no forced incompatible tooling downgrade/override was applied.
- The printed `public/pamphlet/` tree is unchanged from main. Existing cache-upgrade, exact offline warning expiry and printed QR tests remain required in the full suite.
- [Approved-spec acceptance and remaining gates](SPEC_COMPLETION_AUDIT.md) explicitly retain unshipped official feeds, delivery infrastructure, unvalidated scientific products and human review. Passing tests does not certify those capabilities.

Independent Linux CI run `41335617638` passed for head `464938f`, including the complete browser suite. Vercel preview `dpl_DyaDFNA3ou7fBg6Hj3yJdJsmmwTD` was READY; the existing signed-in Chrome session confirmed release 3.2.0, Rangoon→Yangon settlement selection, actual map labels, 24 hourly rows and all advanced source columns without overflow. Unauthenticated preview HTTP reaches Vercel sign-in and is not claimed as a public smoke pass. No protection settings, tokens or account access were changed. Final PR-head checks and post-merge public production checks remain required.
