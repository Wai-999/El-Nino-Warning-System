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
