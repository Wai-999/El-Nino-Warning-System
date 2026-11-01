# El Niño Warning System

[Open the verified production site](https://el-nino-warning-system.vercel.app/)

Burmese-first Myanmar weather, climate context and practical preparedness, with English available. Independent public information aid; follow Myanmar DMH/local instructions for urgent decisions.

## Version 3.2

- Six core pages: Home, Weather, Climate, Map, Safety, Sources; secondary Learn with six lightweight, keyboard-operable synthetic activities.
- Real ECMWF model samples across all 15 states/regions, seven daily forecasts, apparent temperature, humidity, rain and wind. Model estimates are not station observations or township measurements.
- ERA5 recent temperature/rainfall comparisons against matching 1991–2020 normals, original dates and delayed states.
- Dated official NOAA ENSO assessment, separate RONI history, all nine phase-probability seasons, monthly Niño 3.4 and source event-strength statement where available.
- Searchable single Sources page, source health and machine-readable indicator registry; CSV/JSON exports retain units, dates, provenance and licensing.
- Keyboard-selectable regional map, accessible searchable list, local language/location/map preferences and optional consent-based approximate geolocation.
- 330 bilingual source townships with typed PCodes, hierarchy, reviewed alternate names, explicit parent-region weather fallback and up to 12 device-local saved places.
- 515 separately identified city/town settlement points, searchable names and reviewed aliases, settlement overviews, saved selection and map labels; 337 have source Burmese labels. Points do not imply city-scale weather measurements or complete village coverage.
- On-demand seven-day hourly tables for 45 representative model grid points, including point rain probability, wind direction, pressure, wet-bulb, two soil-moisture depths and reference ET₀; source periods, units, missing fields and CSV/JSON provenance remain explicit.
- Independent published ONI v6, standardized SOI and MEI.v2 histories and source-health checks; these do not override NOAA's official assessment or determine local warnings.
- Hazard-specific offline checklists and conservative FAO-informed crop/stage choices saved per place.
- Independent official WHO health-publication monitor and source-verified emergency contact scopes; no weather-generated clinical advice.
- Weather and map side by side on desktop, source-based bilingual local briefing, international numerals by default with optional Myanmar numerals, and pausable reduced-motion-aware weather illustrations.
- Installable PWA with cached timestamps, exact alert expiry even offline, safe cache upgrades and low-data map fallback.

**Coverage limits:** no verified automated Myanmar warning feed, complete village gazetteer, direct township warning/flood/gauge/extent product, calibrated seasonal/subseasonal outlook, SPI/SPEI/soil-moisture anomaly product, UV/air-quality feed or browser/Telegram delivery. These have specific unavailable states and reasons. Empty warning lists do not mean all clear. Regional automated screens are not locally calibrated official warnings. WHO publication coverage is limited; no expiry or active local advisory status is inferred from historical publications or a successful empty query.

## Development

React + TypeScript + Vite; Node 24. No provider credentials are required. Public `VITE_BASE_PATH` selects deployment path; never put secrets in VITE variables.

```sh
npm ci
npm run dev
npm run data:refresh
npm run data:validate
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Local preview: `http://127.0.0.1:5173/El-Nino-Warning-System/`. Vercel uses root base `/` through `vercel.json`; GitHub Pages retains its repository base. Source refresh uses shared validated snapshots, independent source dates, bounded provider calls and last-good fallback. Missing baseline construction takes several minutes. Schedules are best effort and cannot guarantee emergency delivery.

- [Audit and retained features](docs/AUDIT.md)
- [Architecture decision](docs/ARCHITECTURE.md)
- [Primary-source research and zero-cost comparison](docs/DESIGN_RESEARCH.md)
- [Indicator coverage](docs/INDICATOR_REGISTRY.md) / [machine-readable definitions](src/data/indicators.json)
- [Source matrix](docs/SOURCE_MATRIX.md)
- [Numerical methods and screening thresholds](docs/RISK_METHODOLOGY.md)
- [Deployment and rollback](docs/DEPLOYMENT.md)
- [Operations, recovery and quotas](docs/OPERATIONS.md)
- [Validation evidence and limitations](docs/QA_REPORT.md)
- [Redesign migration](docs/CHANGELOG_REDESIGN.md)
- [All 49 V3 decisions and acceptance evidence](docs/V3_DECISIONS_ACCEPTANCE.md)
- [Approved-spec audit, repairs and remaining gates](docs/SPEC_COMPLETION_AUDIT.md)
- [Geography versions and reviewed corrections](docs/GEOGRAPHY_MAINTENANCE.md)

Attribution: ECMWF / Copernicus / Open-Meteo (CC BY 4.0, noncommercial API terms), NOAA public information, MIMU/OCHA/HDX boundaries (CC BY 3.0 IGO), GeoNames settlement points/names (CC BY 4.0), and linked WHO/NWS/FAO guidance. See the runtime Sources page for individual definitions and terms. No incompatible provider is silently substituted.

## Printed leaflet URL

Keep [the existing single-QR Burmese leaflet hub](https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/) available. `public/pamphlet/el-nino/` is an independent generated site with its own worker and offline copy; its 30 tracked files are preserved. The main PWA neither precaches nor intercepts this path. Do not move the path, rename the repository or disable GitHub Pages. [Leaflet deployment evidence](docs/pamphlet/DEPLOYMENT.md).

Language, numerals, motion, saved places, per-place crop choices, map layer, dated caches and checklists stay in browser storage. No analytics, reading account or subscriber contacts are collected. Human Burmese editorial, assistive-technology and meteorological review remain valuable release limitations; automated testing is not formal WCAG or warning-system certification.
