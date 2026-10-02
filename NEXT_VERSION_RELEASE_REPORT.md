# 2.1.0 release report

Status: local validation passed; production deployment and verification pending.

This is a SemVer minor release from 2.0.1: new compatible pages and capabilities, preserving Pages hosting, hash routes, bilingual preparedness content and the existing operational pipeline. Stricter unsupported official-alert payloads intentionally fail closed.

## Verified problems and changes

See [pre-change audit](V2_0_1_UPGRADE_AUDIT.md). Production omitted normal/unknown regions from warnings, duplicated the map on Overview, lacked Records and versioned comparisons, and only promoted higher-severity official bulletins. Stable ID joins already worked; no actual foreign warning or broken geographic join was found.

The release makes all 15 canonical units explicit, separates official advisories from platform levels, adds filters/sorting and mobile cards, and expands evidence-driven region details. Overview retains ENSO and gains coverage, a priority queue, actual change comparison and preparation without rendering a map. Records separates historical reports from platform snapshots and acknowledges unsupported event inventories.

## Evidence and remaining gaps

New context sources are ASMC's dated seasonal outlook, FAO's dated Myanmar crop calendar/impact brief and WHO general health guidance. See [research decisions](WARNING_SYSTEM_RESEARCH.md), [sources](docs/DATA_SOURCES.md) and [methodology](docs/METHODOLOGY.md). No drought index, flood forecast, crop-loss estimate, disease outbreak or fire/haze signal was fabricated. These remain explicit gaps, alongside an unconnected Myanmar official-warning feed. Static context is manually reviewed and expires on its own cadence; scheduled weather fetches cannot freshen it.

Coverage expects 120 cells (15 × 8): 90 monitoring, 30 context/guidance. With current existing weather/reanalysis and context, 75 are usable, including only 45 monitoring cells. Coverage is not a safety score. Three representative cells per region are not complete township coverage. Numeric screening thresholds remain uncalibrated against Myanmar impacts.

The archive preserves up to 124 distinct validated summaries and 365 days of official bulletins, backed by full Git snapshot history. Retrieval-only repeats do not invent changes; first-baseline state is explicit. Missing/restored evidence is not classified as improved/worsened weather. Forecast-window comparisons are screening changes, not observed trends. Failed sources preserve dated prior data; the browser independently rejects invalid caches.

## Validation and deployment evidence

Local checks passed: formatting, ESLint, TypeScript/production build, source schemas, 60 unit/scientific tests, and 62 browser tests across desktop/tablet/mobile (four intentional duplicate viewport checks skipped). The release verifier independently checked seven routes, 32 combinations of viewport/route/language, source dates and IDs, 15 boundaries, 15 regional rows, two sourced historical records, two actual snapshots, offline navigation, zero console errors and zero asset HTTP errors. See `docs/next-local-verification.json`.

The narrow 320 px check found a pre-existing forecast-table keyboard-scroll gap, repaired by making the scroll region focusable and named. Filter labels were also made explicitly accessible. No browser page overflow was found in the final verification. Burmese layout, routing and accessible names were tested; the scientific terminology has not received an independent Myanmar meteorologist review.

Production workflow and live verification results will be recorded after deployment. A separate isolated browser retains the old 2.0.1 service-worker shell to verify the actual cache transition to 2.1.0.
