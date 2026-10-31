# Existing application audit

Inspected 31 October 2026, base commit `b413a71bb9724c002ccb0ff6385cdf125eae97f3` (verify against Git before release).

## Evidence and findings

| Area              | Evidence                                                    | Finding / decision                                                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | `package.json`, `vite.config.ts`                            | React 19, TypeScript, Vite, Node 24. Retain framework and lockfile.                                                                                                                                |
| Navigation        | `src/app/App.tsx`                                           | Nine sidebar destinations; old Mokinn branding. Replace shell with six core pages, secondary Learn; keep useful old hash links as redirects.                                                       |
| Forecasts         | `src/data/operational.ts`, `scripts/refresh-operational.ts` | Validated ECMWF IFS 0.25° snapshots, three sample cells per region, seven daily forecasts. Preserve pipeline and truthful regional precision.                                                      |
| Reanalysis        | same; `scripts/cache/climatology.json`                      | ERA5 1991–2020 calendar-matched baseline. Latest retained window ended 2 October; ingestion failed 31 October. Render delayed data with original dates, never as current conditions.               |
| ENSO              | `src/data/schema.ts`, `public/data/current.json`            | Dated NOAA assessment and limited strength statement, separate from local warning. Preserve. Add independently validated RONI history and official phase probability data.                         |
| Warning integrity | `src/risk/engine.ts`, `src/data/schema.ts`                  | Source hostname, geographic scope, issue/expiry validation already exist. Preserve; show original issuer severity instead of translating it into platform categories.                              |
| Official coverage | `public/data/current.json`                                  | No connected official Myanmar feed. Empty alert array cannot imply safety. Show coverage unavailable and official issuer links.                                                                    |
| Maps              | `src/map/MyanmarMap.tsx`, `public/data/myanmar.geojson`     | Validated 15 state/region geometries with keyboard selection and list fallback. Retain geometry; simplify default layer and expose true model resolution. No validated township/village gazetteer. |
| Languages         | `src/app/context.tsx`, self-hosted Noto Sans Myanmar        | Burmese default, English supported. Retain preferences and improve bilingual copy; fluent editorial review remains a release limitation.                                                           |
| Offline           | `scripts/build-offline.mjs`, `src/data/load*.ts`            | Hashed offline shell, network-first data, retained timestamps. Preserve; add supplemental climate data to network-first policy.                                                                    |
| Printed materials | `public/pamphlet/el-nino/`, `docs/pamphlet/`                | Independent QR destination and service worker. Preserve byte-for-byte. GitHub Pages must remain enabled.                                                                                           |
| Deployment        | `.github/workflows/deploy.yml`                              | Four daily Actions refreshes and Pages deployment; provider failures retain last good values. Add Vercel root-base configuration; no high-frequency Hobby cron.                                    |
| Verification      | `tests/*.test.ts`, `tests/e2e/`                             | Substantial scientific and regression coverage. Preserve science/geometry tests; replace UI assertions for intentionally retired routes.                                                           |

## Keep / replace / remove

Keep source adapters, Zod validation, independent risk calculations, historical baseline, geometry, local preferences, preparedness concepts, offline strategy and printed hub. Replace sidebar, branding, dense overview, navigation, source presentation and education interface. Retire dynamic health/weather implications, energy/infrastructure presentation, multiple-location comparison, large video-first learning UI and redundant public source pages. Existing modules may remain temporarily as unreferenced migration evidence; they are not included in the new app bundle.

No observations, local flood alerts, crop losses, standardized drought indices, subscriptions or disease estimates are fabricated. Rainfall deficits remain different from SPI and flood forecasts.
