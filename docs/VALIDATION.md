# V2 validation record

Release candidate 2.0.0; checked 30 September 2026 (US Pacific), 1 October 2026 (UTC/MMT).

## Sources and scientific checks

- Real public ECMWF IFS 0.25° feed successfully normalized for 45 sample cells across all 15 regions.
- ERA5 recent period 27 August–25 September 2026 retrieved, with matching calendar-day normals calculated from all 30 years of 1991–2020. Every regional temperature/rainfall anomaly is derived; no fabricated production fixtures.
- Immutable baseline cache verifies all 15 IDs and 30 contributing years per ordinary calendar day. Regional weights sum to one. Map has 15 distinct regions including Nay Pyi Taw.
- NOAA CPC assessment, published 10 September 2026, validated; source's next discussion date is 8 October 2026. Calendar-date display preserves that date in MMT rather than converting the end-of-day UTC expiry into 9 October.
- Monthly Niño 3.4 anomaly extracted from its correct source column; explicit strength probability and seasonal horizon are separate from Myanmar weather probabilities.
- All source health checks succeeded in the release snapshot. ERA5 retains its original retrieval/valid dates on same-day pipeline runs; baseline and recent data never silently substitute ECMWF forecast output.

## Automated checks

- 36 passing unit tests: official bulletin expiry/source validation; NOAA status/strength/index parsing; source units/coordinate/contiguous dates; schema duplicates; NWS heat-index conversion/adjustments; matched regional aggregation; rainfall denominator/sign; dry-day threshold; next-24-hour precipitation interval; model/reanalysis staleness; MMT half-hour conversion; risk/priority logic; malformed-response and corrupt-cache fallback; old forecast-window rejection; geographic projection and stored baseline completeness.
- 33 passing browser checks across desktop (1440 px), tablet (768 px) and mobile (Pixel 7): Burmese default and English, all routes, 15 map polygons/keyboard selection/layers/zoom, official/system lists, sector changes, local checklist persistence, malformed/missing/stale data, low-data behavior, and offline restart with previously loaded geometry.
- Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA automated checks on Burmese overview and English core routes pass. Fixed definition-list semantics and insufficient source-link target spacing found during QA. The Linux release check also caught a floating Low Data control overlapping a sidebar link; the control now sits in normal header flow.
- Production TypeScript/Vite build, ESLint, data validation and formatting checks pass. Generated data/cache files are excluded from stylistic formatting checks because ingestion emits stable machine JSON; schemas validate their content.

## Manual browser checks

Burmese screenshots saved as `docs/v2-desktop.png`, `v2-mobile.png`, `v2-impacts.png`, `v2-region.png`. Reviewed region map, numerical units, provenance and layout. Narrow 320 px layout and enlarged text were inspected; repaired map-select width and header wrapping. Throttled connection (250 ms latency, 75 kB/s download) displayed regional values in approximately 2.9 seconds on the local production preview. This is a development measurement, not a production performance guarantee.

Data payload approximately 42 KB uncompressed; display GeoJSON approximately 100 KB; baseline ~70 KB stays server-side. Application code is route-split. The map is not fetched in Low Data Mode, and is cached after first use. A first visit remains necessary for offline availability.

## Limits of validation

These tests establish software and calculation behavior, not Myanmar forecast skill, impact calibration, complete official-warning coverage, professional Burmese translation approval, clinical validation or full WCAG certification. Three samples per region can miss local extremes. Source delays, device-clock errors, GitHub scheduling delays, storage eviction and upstream outages remain possible. Dates and missing-data states are the explicit public safety boundary.

Deployment and live-production verification are recorded in the V2 GitHub release and Actions run linked there.
