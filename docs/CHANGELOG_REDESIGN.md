# 3.0 redesign migration

Base: `b413a71bb9724c002ccb0ff6385cdf125eae97f3`. Work isolated on `codex/master-redesign`; history retained.

## User-visible changes

- Restore the product name **El Niño Warning System**. Replace the sidebar with white-first desktop top navigation and mobile bottom navigation.
- Six core pages: Home, Weather, Climate, Map, Safety, Sources; secondary Learn with six keyboard-operable synthetic activities.
- Burmese default and persistent English switch, self-hosted Myanmar font and cross-browser Myanmar date/digit formatting.
- Searchable regional location picker, alias search, optional approximate geolocation after a deliberate permission action, persisted region/map layer and map list fallback.
- Add real NOAA RONI history and nine-season phase probabilities, independent of monthly Niño 3.4 and source event-strength statements.
- One searchable Sources page with machine-readable indicator registry, provenance, licensing, freshness, original sources, unavailable reasons, and exports.
- Hazard-specific locally saved checklists, static WHO/NWS safety education and conservative FAO-informed crop considerations.
- Keep source timestamps, visibly delayed snapshots, separate automated screens from original issuer taxonomy, and expire warnings offline.

## Retained and corrected

Retain ECMWF/ERA5 sampling, validated numerical rules, Zod contracts, historical baseline, map geometry, local preference keys, offline cache migration and the independent printed leaflet hub. The new high/low labels use daily extrema; legacy `now.min/max` are spatial variation across current cells. Daily peak heat values are labeled heat index, separate from provider apparent temperature. Explicit forecast start/end dates fix an observed Myanmar-midnight rollover mismatch. Baseline quota accounting is persisted across retries instead of resetting the cap on every run.

## Retired public presentation

Retire the dense overview, separate impacts/health/records dashboards, dynamic weather-derived health implications, energy/infrastructure exposure presentation, multi-area comparison and the video-first learning page. Old modules remain in source history/temporarily unreferenced files for scientific regression evidence; they are not imported into the new application bundle. Existing scientific tests remain. UI tests for retired features are replaced by equivalent new navigation, integrity, crop/guidance, offline, source and learning tests.

## Old links

`#/data` → Sources; `#/warnings`, `#/prepare`, `#/health`, `#/impacts` → Safety; `#/records` → Climate; `#/region/MM-xx` → Map with that region selected. Existing language/region/low-data preferences survive. New hazard checklists use a new key because old household/farmer item positions do not map safely to hazard items; old saved values are retained, not deleted.

`public/pamphlet/` is unchanged. Its 30 tracked files, QR URL and service-worker bypass remain protected by the original pamphlet regression tests. Pages stays enabled while Vercel is validated.

## Explicit unshipped scope

Official live warning ingestion, township/village datasets, flood extent/gauges, standardized drought products, locally calibrated longer outlooks, UV/air quality and browser/Telegram delivery are unavailable with documented reasons. No fake controls, observations or warnings replace these gaps.

## Dependency security

Migrate inherited Zod 3 validation to patched Zod 4.6.7, explicitly retaining string-key record schemas and the scientific regression suite. Apply compatible Vite/Vitest/source-map patches. Production dependency audit is clean; remaining moderate minimatch advisories are confined to the lint/TypeScript development toolchain and documented in QA. No forced ESLint downgrade is applied.

## V3.1 owner-decision completion

Apply the explicitly confirmed V3 decision document. Add a pinned 330-township hierarchy, typed IDs, nine individually reviewed alternate names and correction workflow; multiple local saved places; township overview with per-indicator parent fallback; local briefing; per-place crop and preparedness state; default international numerals plus optional Myanmar digits; glossary; pausable lightweight weather art; compact homepage map.

The original scientific aggregation and warning thresholds remain unchanged. Source urgency is unknown when absent. Village records remain excluded because the source coverage is partial; township geography does not create township meteorological data. Replace the current static clinical-health panel with independently fetched original WHO publication metadata and explicit incomplete coverage. No bulletin expiry or current health alert is manufactured. Source-verified MRCS/ICRC contacts include their actual service scope. Legacy clinical code remains in history/unused files, outside current routes and production chunks.

Add `public/data/health-advisories.json` to scheduled ingestion, validation, snapshot commits and network-first offline caching. Existing preferences are retained; the former unscoped checklist migrates once to the selected place. No account, subscriber backend, paid service, high-frequency cron, repository deletion or printed-QR modification occurs.

## 3.2.0 — approved-spec audit and source-backed gap repairs

- Separate city/town/settlement search and map names from township administrative units; add place-type filters, parent-qualified queries, persistent saved points and overviews. Preserve unresolved saved references for review.
- Retain full hourly point forecasts and verified ensemble rain probability, pressure/direction, wet-bulb, depth-specific soil moisture and reference ET₀; on-demand loading, exact units/periods and source-aware exports.
- Add independent published NOAA ONI v6, standardized SOI and MEI.v2 histories with source-version and cross-year period validation; preserve RONI and official assessment as different products.
- Add three-day completed-rainfall accumulation and correct briefing calendar-day wording across Myanmar midnight. No official-warning or scientific risk threshold changed.
- Tighten the 49-decision and master-spec audits: bounded geography, missing scientific products, delivery infrastructure and human review are no longer called fully implemented. Preserve all source/failure/offline/QR contracts and repeat release checks.
