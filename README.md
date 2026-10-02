# မိုးကင်း · Mokinn 2.1

Burmese-first **Myanmar weather, climate, impacts and El Niño preparedness**, with English available.

[Open the live application](https://wai-999.github.io/El-Nino-Warning-System/)

## Everyday operational information

- All 15 States/Regions, including Nay Pyi Taw: ECMWF IFS forecast weather, current modeled hour, humidity/apparent temperature, rain, wind/gusts and seven-day outlook.
- Real 30-day temperature and rainfall anomalies from ERA5 against matching **1991–2020** calendar-day normals; seven/30-day rainfall and trailing dry spells.
- Ten map layers, source/validity/units, keyboard selection, regional profiles and practical actions.
- Independent heat, rain, wind, dryness, water and agriculture screening signals; source-backed NOAA ENSO status, monthly Niño 3.4 trend and supported seasonal strength outlook.
- Current evidence-driven health, agriculture, water and energy implications. Official warnings, system risk signals and information updates have distinct labels.
- All-region warning matrix and mobile cards with concern, hazard, freshness and official-only filters. Coverage separates monitoring from general context; missing feeds stay explicit.
- Records with sourced historical reports, dated screening snapshots and real change comparisons. Overview prioritizes ENSO, regional concerns, preparation and data quality.
- Burmese/English, Low Data Mode, offline preparedness checklists, cached-date labels, self-hosted fonts, no account or tracking.

**Operational limits:** this is an independent preparedness resource, not an official emergency service. Official Myanmar warning-feed coverage is not connected. ECMWF values are forecasts, ERA5 is delayed reanalysis, and regional estimates use three spatial sample cells rather than complete grid coverage. Screening thresholds have not been calibrated against Myanmar impacts; forecast confidence is not invented. Missing observations, rainfall probabilities, soil moisture, river/reservoir levels, crop losses and grid outages stay unavailable. Follow DMH/local instructions for urgent decisions.

## Architecture and development

React + TypeScript + Vite; static GitHub Pages. Provider adapters and Zod schemas normalize external data in Node/GitHub Actions. The client reads small same-origin snapshots, never external APIs or large climatology files. Numerical rules live in `src/climate` and `src/risk`; map layers in `src/map`; reusable operational evidence UI in `src/components`.

```sh
npm ci
npm run dev
npm run data:refresh   # real source fetch; initial baseline takes several minutes
npm run data:validate
npm run format:check
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Node 24 required. Development: `http://127.0.0.1:5173/El-Nino-Warning-System/`. No API keys. Public `VITE_BASE_PATH` may override the deployment base; never expose private credentials through VITE variables.

## Methods, sources and refresh

Temperature anomaly is recent period mean minus the normal for equivalent calendar dates. Rainfall departure is recent total minus expected total; percentages are suppressed for expected rain below 10 mm. Both sides use the same ERA5 model, sampling, units and Myanmar calendar days. Historical periods end approximately six days before ingestion and are explicitly dated.

Signals use the maximum independent usable hazard; there is no opaque AI score. The regional matrix presents Low platform risk, Attention, Elevated, High and Very high, mapped to the existing internal threshold levels. An unknown input is never normal. ENSO changes context and presentation, not local severity. All active validated Myanmar official advisories outrank weather screens; immediate high weather screens outrank ENSO context.

Scheduled Actions refresh forecasts four times daily, ERA5 daily, and missing baseline dates only when needed. Validated last-good data survives source failures without rewritten timestamps. Weather becomes stale after 18 hours; ERA5 becomes stale when its final day is more than ten days old. The final workflow health job reports failures after the safe fallback is deployed.

- [Source registry, licenses, resolution and limitations](docs/DATA_SOURCES.md)
- [Regional coverage, source hierarchy and snapshot comparisons](docs/METHODOLOGY.md)
- [2.1 release report](NEXT_VERSION_RELEASE_REPORT.md)
- [Scientific methods and screening thresholds](docs/RISK_METHODOLOGY.md)
- [Deployment, ingestion and rollback](docs/DEPLOYMENT.md)
- [V2 audit](docs/V2_AUDIT.md)
- [Validation record](docs/VALIDATION.md)

Attribution: **ECMWF / Copernicus Climate Change Service / Open-Meteo**, CC BY 4.0; **MIMU / OCHA / HDX**, CC BY 3.0 IGO (simplified 2024 reference geometry, Bago/Shan subdivisions dissolved); **NOAA CPC** ENSO public information. WHO/NWS/FAO/WMO guidance is linked and briefly paraphrased. Open-Meteo free endpoints are noncommercial and rate-limited; there is no SLA.

## Privacy, offline and safety

Language, region, cached data and checklist progress stay in the browser. No analytics, geolocation tracking or accounts. First-visit connectivity is needed; browser storage may be evicted. Maps cache after first use. Low Data Mode preserves text and warnings while skipping maps and optional charts. Cached/stale views always retain source dates.

Automated accessibility and browser tests do not establish full WCAG certification or operational meteorological validation. Fluent Burmese editorial, assistive-technology, meteorological and clinical review would strengthen an official rollout. Health advice is general; seek urgent medical help for heatstroke symptoms. The app does not send SMS, email, push or messaging alerts.

V1 commit history remains intact. V2 is an evolution of the existing application, not a replacement repository.
