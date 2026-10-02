# 2.1.0 release report

Status: **2.1.0 deployed and production-verified on 2 October 2026.** [Open the live application](https://wai-999.github.io/El-Nino-Warning-System/?release=2.1.0#/).

This is a SemVer minor release from 2.0.1: new compatible pages and capabilities, preserving Pages hosting, hash routes, bilingual preparedness content and the existing operational pipeline. Stricter unsupported official-alert payloads intentionally fail closed.

## Verified problems and changes

See [pre-change audit](V2_0_1_UPGRADE_AUDIT.md). Production omitted normal/unknown regions from warnings, duplicated the map on Overview, lacked Records and versioned comparisons, and only promoted higher-severity official bulletins. Stable ID joins already worked; no actual foreign warning or broken geographic join was found.

The release makes all 15 canonical units explicit, separates official advisories from platform levels, adds filters/sorting and mobile cards, and expands evidence-driven region details. Overview retains ENSO and gains coverage, a priority queue, actual change comparison and preparation without rendering a map. Records separates historical reports from platform snapshots and acknowledges unsupported event inventories.

## Evidence and remaining gaps

New context sources are ASMC's dated seasonal outlook, FAO's dated Myanmar crop calendar/impact brief and WHO general health guidance. See [research decisions](WARNING_SYSTEM_RESEARCH.md), [sources](docs/DATA_SOURCES.md) and [methodology](docs/METHODOLOGY.md). No drought index, flood forecast, crop-loss estimate, disease outbreak or fire/haze signal was fabricated. These remain explicit gaps, alongside an unconnected Myanmar official-warning feed. Static context is manually reviewed and expires on its own cadence; scheduled weather fetches cannot freshen it.

Coverage expects 120 cells (15 × 8): 90 monitoring, 30 context/guidance. With current existing weather/reanalysis and context, 75 are usable, including only 45 monitoring cells. Coverage is not a safety score. Three representative cells per region are not complete township coverage. Numeric screening thresholds remain uncalibrated against Myanmar impacts.

The archive preserves up to 124 distinct validated summaries and 365 days of official bulletins, backed by full Git snapshot history. Retrieval-only repeats do not invent changes; first-baseline state is explicit. Missing/restored evidence is not classified as improved/worsened weather. Forecast-window comparisons are screening changes, not observed trends. Failed sources preserve dated prior data; the browser independently rejects invalid caches.

## Validation and deployment evidence

Formatting, ESLint, TypeScript/production build, source schemas and all 60 unit/scientific tests passed. Final CI passed 63 browser tests across desktop/tablet/mobile; six duplicate viewport/lifecycle checks were intentionally skipped. The repaired local build also passed seven routes, 32 combinations of viewport/route/language, source schemas, all 15 boundaries and regional rows, two sourced historical records, three locally available snapshots, and full offline restart with no console or HTTP asset errors. See [local verification](docs/next-local-verification.json).

The narrow 320 px check found a pre-existing forecast-table keyboard-scroll gap, repaired by making the scroll region focusable and named. Filter labels were also made explicitly accessible. No browser page overflow was found in the final verification. Burmese layout, routing and accessible names were tested; the scientific terminology has not received an independent Myanmar meteorologist review.

The first production verifier run timed out while waiting for refresh completion; a fresh diagnostic run and the complete repeated production verifier passed. It was not treated as a verified application defect. The original live 2.0.1 cache transition separately failed to expose the new release footer. A controlled reproduction using both real release builds and a still-fresh ten-minute HTTP cache established the cause: the new service worker's `cache.addAll` reused old `index.html`, so the new cache permanently retained the old application. Precache requests now use `cache: "reload"`, and cache-policy source changes also change the cache fingerprint. The same real-build migration now loads 2.1.0, requests fresh HTML, preserves one prior shell for open pages and emits no runtime errors. See `docs/next-cache-migration-local.json`.

A regression browser test reproduces the cached prior shell, checks replacement, retention/pruning, prior lazy assets and offline restarts on four routes. Both it and the existing offline test passed. The final [Pages workflow 37016262488](https://github.com/Wai-999/El-Nino-Warning-System/actions/runs/37016262488) succeeded for repair commit `7dca6ab0b0c7229306b5b013f1fc093276d18d79`. Build, deployment and provider-health jobs all passed; deployment finished at 13:57:35 UTC. Its validated data snapshot was committed as `22975f9`.

The [production verifier](docs/next-production-verification.json), started at 13:58:57 UTC, passed all seven routes: Overview, Warnings, Records, Map, Mandalay detail, Data & methodology and Impacts. It confirmed the actual `v2.1.0` footer and release metadata, 32 viewport/language accessibility and overflow checks (320/390/768/1440 px; English/Burmese), eight source links, 15 mapped boundaries and warning rows, two sourced historical records and four genuine snapshots. Overview did not request map code or geometry. No page/console errors, failed online requests or asset HTTP errors occurred. A fresh installation completed a full offline reload, then navigated Overview, Warnings, Records and Prepare with the dated offline banner.

Published forecast valid time was 13:30 UTC on 2 October, retrieved at 13:55:40 UTC; ERA5 covered 28 August–26 September. Both datasets covered all 15 canonical units. NOAA's bulletin retained its actual 10 September issue date. Connected provider health checks succeeded; that does not imply a connected DMH feed or complete hazard coverage.

The separate [production cache-upgrade check](docs/next-cache-upgrade-verification.json) seeded an isolated browser at the production origin with the rebuilt real 2.0.1 commit, then removed interception and fetched the actual deployed service worker. This setup is distinct from the original failed live upgrade and the controlled HTTP-cache reproduction. It verified transition from `mokinn-4eabf603110a` to production `mokinn-bd9cd699087c`, actual 2.1.0 content, retention of exactly the current and prior caches, four offline page restarts and no runtime errors. The production verifier and migration evidence are saved alongside the report.

No SPI/SPEI, flood probability, disease-outbreak forecast, crop-loss estimate or fabricated historical inventory was added to fill gaps. Manual source review, an authorized and validated Myanmar official feed, better spatial aggregation, threshold calibration and independent Burmese/scientific review remain documented limitations rather than completed capabilities.
