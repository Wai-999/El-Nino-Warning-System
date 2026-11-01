# NOAA parser fixtures

Public NOAA source responses retrieved 31 October 2026 from the URLs in `src/data/climate.ts`. The probability HTML preserves source markup and data; line endings are normalized and trailing whitespace removed. Source HTML has legacy invalid nesting, so fixture HTML is excluded from Prettier. The source RONI table is not synthetic data. Fixtures are not copied to public runtime assets.

`who-myanmar-don.json` contains minimal original WHO Disease Outbreak News metadata for three Myanmar-tagged historical publications. It demonstrates original 2019 issue dates versus later CMS modification and exact country-tag validation; it is test input, not active health data. Production health snapshots are independently fetched by `scripts/refresh-health-advisories.ts`. No full article text, clinical table, logo or image is reproduced.

V3.2 official NOAA fixtures: `noaa-oni-v6.html` is the explicitly versioned CPC ONI v6 table, including its unclosed final partial-year row; `noaa-soi.txt` contains both pressure-anomaly and standardized blocks; `noaa-meiv2.txt` includes the two-month column convention and missing sentinels. Retrieved 1 November 2026 from the URLs in `src/data/ensoIndices.ts`. NOAA public information, attributed. These source fixtures are test-only; production publishes independently ingested validated values.
