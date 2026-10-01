# Methodology entry point

The current scientific and operational contract is [V2 Risk Methodology](RISK_METHODOLOGY.md). The full [source registry](DATA_SOURCES.md) records upstream licensing, resolution, timing, fallbacks and limitations. [Deployment](DEPLOYMENT.md) explains ingestion and release operations.

V1 methodology is preserved at commit `e0ddb952d2a57530597be920c071845d42ec236d`. V2 adds explicitly labeled, transparent application screening rules. These have not been validated against Myanmar impacts and are not government warning criteria. The V1 prohibition on invented operational values, forged official warnings and inferred confidence remains in effect.

## Impacts evidence and coverage repair (1 October 2026)

The impacts route now keeps current ENSO assessment, forecast weather, recent ERA5 reanalysis, historical relationships and scenario guidance explicitly separate. ERA5 is a model/observation synthesis, not station observations; no forecast anomaly is calculated. The historical FAO case concerns July 2015–March 2016, not current conditions or an event-attribution study. NOAA's general teleconnection summary does not specify composite years or comparable graded confidence, which the page discloses. No confidence score is assigned.

`src/data/impactEvidence.ts` records bilingual claims, geography, relationship, direction, confidence limitations, source IDs, publication metadata and verification dates. `src/risk/impacts.ts` defines sector driver coverage outside UI: health uses heat/rain, agriculture heat/rain/dryness, water water/rain, energy heat/water/wind. An elevated known driver may be shown even with incomplete coverage, but incomplete evidence must not yield an overall Normal label. This improves missing-data interpretation; all existing numeric hazard thresholds are unchanged. National counts explicitly distinguish complete, partial and unavailable coverage and do not count actual impacts.

Weather aging is 12–18 hours since either retrieval or modeled valid time, followed by stale at 18 hours (or earlier window expiry). ERA5 ages at 8 days and expires at 10 days after its last completed MMT day. These are application freshness policies, not confidence estimates. Retrieval/build times do not reset the actual forecast or observation period. Missing, stale, failed and cached inputs have distinct visible explanations.

Validation now checks rain percentages, seven-day sums and trailing dry-day counts against stored daily values, allowing the known 0.01 mm rounding interval around thresholds. Duplicate/unordered/invalid/incomplete NOAA index months are rejected. Client loading rejects future retrieval timestamps and incomplete observation windows, using only validated dated cache on failure. A corrupt operational snapshot is rejected as a unit; static guidance, history and the independent NOAA bulletin remain accessible.

Filters are stored in `#/impacts?sector=...&region=...&evidence=...`. The separate document query (including `?release=2.0.0`) is preserved. Regional summary uses all sector drivers; evidence filters change the detailed datasets shown. Sector scenarios and official ENSO context remain labeled context. Historical sources and thresholds are disclosed rather than inferred from an ENSO state.
