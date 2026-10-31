# El Niño Warning System

[Open the verified production site](https://el-nino-warning-system.vercel.app/)

Burmese-first Myanmar weather, climate context and practical preparedness, with English available. Independent public information aid; follow Myanmar DMH/local instructions for urgent decisions.

## Version 3

- Six core pages: Home, Weather, Climate, Map, Safety, Sources; secondary Learn with six lightweight, keyboard-operable synthetic activities.
- Real ECMWF model samples across all 15 states/regions, seven daily forecasts, apparent temperature, humidity, rain and wind. Model estimates are not station observations or township measurements.
- ERA5 recent temperature/rainfall comparisons against matching 1991–2020 normals, original dates and delayed states.
- Dated official NOAA ENSO assessment, separate RONI history, all nine phase-probability seasons, monthly Niño 3.4 and source event-strength statement where available.
- Searchable single Sources page, source health and machine-readable indicator registry; CSV/JSON exports retain units, dates, provenance and licensing.
- Keyboard-selectable regional map, accessible searchable list, local language/location/map preferences and optional consent-based approximate geolocation.
- Hazard-specific offline checklists, static WHO/NWS health education and conservative FAO-informed crop/stage considerations.
- Installable PWA with cached timestamps, exact alert expiry even offline, safe cache upgrades and low-data map fallback.

**Coverage limits:** no verified automated Myanmar warning feed, township/village gazetteer, local flood/gauge/extent product, calibrated seasonal/subseasonal outlook, SPI/SPEI/soil-moisture integration, UV/air-quality feed or browser/Telegram delivery. These have specific unavailable states and reasons. Empty warning lists do not mean all clear. Regional automated screens are not locally calibrated official warnings. Health material is static education, not weather-triggered diagnosis or disease prediction.

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

Attribution: ECMWF / Copernicus / Open-Meteo (CC BY 4.0, noncommercial API terms), NOAA public information, MIMU/OCHA/HDX boundaries (CC BY 3.0 IGO), and linked WHO/NWS/FAO guidance. See the runtime Sources page for individual definitions and terms. No incompatible provider is silently substituted.

## Printed leaflet URL

Keep [the existing single-QR Burmese leaflet hub](https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/) available. `public/pamphlet/el-nino/` is an independent generated site with its own worker and offline copy; its 30 tracked files are preserved. The main PWA neither precaches nor intercepts this path. Do not move the path, rename the repository or disable GitHub Pages. [Leaflet deployment evidence](docs/pamphlet/DEPLOYMENT.md).

Language, region, map layer, dated caches and checklists stay in browser storage. No analytics, reading account or subscriber contacts are collected. Human Burmese editorial, assistive-technology and meteorological review remain valuable release limitations; automated testing is not formal WCAG or warning-system certification.
