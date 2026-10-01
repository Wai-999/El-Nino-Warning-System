# IMPACTS PAGE REPAIR REPORT

Audit date: 1 October 2026. Baseline: V2 commit `1c4cb82`. Repair version: 2.0.1. Target: [GitHub Pages impacts](https://wai-999.github.io/El-Nino-Warning-System/?release=2.0.0#/impacts).

Deployed and publicly verified on 1 October 2026. The existing Pages workflow passed all build, data-refresh, browser and ingestion-health checks. [IMPACTS_AUDIT.md](IMPACTS_AUDIT.md) contains the pre-edit evidence, architecture inventory, reproduction conditions and passing baseline checks.

## Verified Bugs Found

### I01 — Missing ENSO context and explanatory evidence

- **Severity:** P2.
- **Component/file:** `src/features/Impacts.tsx`.
- **Reproduction:** Open the original public route; only sector planning summaries appear.
- **Root cause:** The page did not render the existing NOAA assessment or explanatory/historical evidence.
- **User impact:** No explanation of how El Niño might influence local conditions, or how today differs from past relationships.
- **Fix:** Reuse the dated official ENSO panel; add a Myanmar snapshot, conditional mechanism, structured sourced historical cases and sector scenarios.
- **Verification:** Browser evidence-label/source/date tests; source review against NOAA, WHO, FAO and WMO. Burmese and English provided.

### I02 — Combined evidence obscured its forecast driver

- **Severity:** P2.
- **Component/file:** `src/components/Operational.tsx`, `src/features/Impacts.tsx`, `src/risk/signals.ts`.
- **Reproduction:** Select Agriculture; cards list generic crop stress and the expanded date identifies ERA5, although the level also uses the next 24-hour forecast.
- **Root cause:** Combined signals shared a historical flag; dates and evidence types were mostly hidden.
- **User impact:** Users cannot identify the driver or distinguish forecast weather from past estimates.
- **Fix:** Agriculture displays heat, rain and dryness separately, each with actual evidence, visible classification and period. Shared combined cards expose both periods. Water signals now expose their actual rainfall totals, normal, departure and dry days.
- **Verification:** Forecast-only, reanalysis-only and all-evidence browser assertions; no changes to numeric screening thresholds.

### I03 — Missing/error/loading data resembled zero signals

- **Severity:** P2.
- **Component/file:** `src/app/context.tsx`, `src/features/Impacts.tsx`.
- **Reproduction:** Delay the operational request or return HTTP 503 with no cache. Original page displays “0 / 15” elevated regions, with no operational-specific fetch-error explanation.
- **Root cause:** Empty initial state and failed response were rendered through the same count branch.
- **User impact:** Unassessed conditions could be read as zero risk.
- **Fix:** Separate loading, unavailable, failed, cached and stale states; no elevated count when no regional assessment exists. Static guidance/history and independent NOAA information remain usable.
- **Verification:** Browser fault injection for delayed response, HTTP failure, empty valid snapshot, corrupt data, dated cache and offline restart.

### I04 — Partial coverage could produce an overall Normal label

- **Severity:** P2.
- **Component/file:** `src/features/Impacts.tsx`; new coverage calculation in `src/risk/impacts.ts`.
- **Reproduction:** Supply a low weather forecast but no history for a multi-driver sector. Original branch returned Normal when any available driver was normal and none was elevated.
- **Root cause:** Unknown drivers were filtered out before choosing the summary level.
- **User impact:** Partial evidence appeared complete.
- **Fix:** Count complete, partial and unavailable coverage independently. Show an elevated known driver with an incomplete-evidence label; otherwise an incomplete overall assessment stays unknown.
- **Verification:** Synthetic partial-input unit tests and browser test; ENSO never increases the local hazard level.

### I05 — Some corrupted or incomplete observations passed validation

- **Severity:** P2 (fault-injection finding; no corrupted production observations were found).
- **Component/file:** `src/data/operational.ts`, `src/data/loadOperational.ts`.
- **Reproduction:** Replace a rain percentage with a value inconsistent with totals, duplicate a monthly Niño index, or set a history end date to an unfinished MMT day. Original validator/freshness checks accepted them.
- **Root cause:** Derived-value and chronology constraints were incomplete; date-only parsing tested the start of a historical day.
- **User impact:** Such malformed inputs could be presented as valid evidence.
- **Fix:** Validate rainfall arithmetic, seven-day totals, dry-day count and chronological complete monthly indices; account for stored rounding; require completed historical days and reject future retrieval timestamps at loading.
- **Verification:** Negative-input unit tests, browser malformed-payload test and real published-snapshot schema validation. Existing provider unit-mismatch/null/duplicate tests remain passing.

### I06 — Sector choices did not survive refresh or sharing

- **Severity:** P3.
- **Component/file:** `src/app/App.tsx`, `src/features/Impacts.tsx`, `src/risk/impacts.ts`.
- **Reproduction:** Select Agriculture and refresh: Health reappears and the address never encoded the choice.
- **Root cause:** Selection was component-only state.
- **User impact:** Back/forward and shared links could not restore the view.
- **Fix:** Validated hash query for sector, region and evidence. The document query `?release=2.0.0` remains intact. Hash navigation and Pages base are preserved.
- **Verification:** Direct links, refresh, back/forward, internal navigation, release query preservation and invalid-parameter defaults.

### I07 — Some sector claims lacked a directly relevant source

- **Severity:** P2.
- **Component/file:** `src/features/Impacts.tsx`; new `src/data/impactEvidence.ts`.
- **Reproduction:** Original health text included heavy rain and water safety but linked only WHO heat guidance. Water pressure provided no visible rainfall values.
- **Root cause:** One generic source link per sector and generic proxy text.
- **User impact:** Claim-to-source and signal-to-input traceability were incomplete.
- **Fix:** Claim-specific source registry with publisher, original publication title, date where supplied, link and verification date; explicit unknown confidence; actual driver inputs. NOAA SST feed's unstated anomaly baseline is disclosed, rather than assumed to match ERA5.
- **Verification:** Direct authoritative-source review, structured-source tests and rendered links/periods.

### I08 — English-only assistive announcement in Burmese mode

- **Severity:** P3.
- **Component/file:** `src/components/shared.tsx`.
- **Reproduction:** Inspect a Burmese-mode external source link's accessible name: it appended English “opens in a new tab.”
- **Root cause:** Hard-coded assistive text.
- **User impact:** Screen-reader language mismatch.
- **Fix:** Translate the announcement through the app's language context.
- **Verification:** Burmese accessible-name test, keyboard activation and disclosure checks.

## Scientific Problems Fixed

| Original presentation                          | Problem                                                      | Replacement                                                                                                                    | Evidence/source                                                                                                                                                                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sector guidance without ENSO mechanism         | Missing causal context                                       | Pacific ocean/atmosphere → circulation → changed weather probabilities → hazard, exposure and vulnerability → potential impact | [NOAA PMEL](https://www.pmel.noaa.gov/elnino/what-is-el-nino)                                                                                                                                                                                                                 |
| Generic agriculture level                      | Forecast and historical evidence obscured                    | Separate heat/rain/dryness drivers; conditional crop-stage/water mechanism; no yield-loss percentage                           | [FAO El Niño](https://www.fao.org/el-nino/en/)                                                                                                                                                                                                                                |
| Health/water text linked only to heat guidance | Incomplete sourcing                                          | Distinct heat, safe-water and disease-pathway references; non-climate factors explicit; no disease prediction                  | [WHO heat](https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health), [WHO water](https://www.who.int/news-room/fact-sheets/detail/drinking-water), [WHO ENSO](<https://www.who.int/news-room/fact-sheets/detail/el-nino-southern-oscillation-(enso)>) |
| No historical comparison on route              | No way to distinguish past association from current forecast | FAO's 2015–16 Myanmar case alongside NOAA seasonal relationships, explicitly labeled history with dates and limits             | [FAO March 2016, PDF p. 38](https://www.fao.org/fileadmin/user_upload/emergencies/docs/FAOEl%20NinoReportMarch2016.pdf#page=38), [NOAA CPC](https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/elninosfc_body.html)                                         |

No unsupported deterministic drought, disease or crop-loss claim was found in the original page, and no fabricated numerical probabilities were removed. The repair adds missing context rather than claiming those hypothetical defects existed.

## Data Problems Fixed

Visible anomaly units, recent period, 1991–2020 calendar-day baseline, source and retrieval dates; separate forecast versus reanalysis labels; aging/stale states; retained timestamps on cached data; no overall all-clear from partial coverage. ERA5 is described as a delayed observation/model synthesis. Rainfall amount, anomaly and flood probability remain distinct.

## UX Problems Fixed

Shareable sector/region/evidence state; selected-region drivers instead of six repetitive generic agriculture cards; national coverage available on demand; practical action before deeper explanations; mechanisms, confidence limitations and historical provenance in native disclosures.

## Mobile Problems Fixed

No pre-existing horizontal-overflow defect was reproduced. Repaired content retains usable layouts at 320×568, 375×667, 390×844, 430×932 and 768×1024 in Burmese and English. Filters and evidence columns stack; sector controls use a two-column mobile layout. No hover-dependent interactions or mandatory large visualization.

## Accessibility Problems Fixed

Burmese source-link announcement repaired. New controls have explicit associated labels; data use semantic definition lists. Keyboard activation, persistent filter-button focus, disclosure controls, reduced-motion setting and 200% text were checked. During development, automated checks caught invalid definition-list markup and a control-label issue; both were corrected before release. These introduced issues are not misreported as baseline production defects.

## Performance Problems Fixed

No heavy-engine performance defect was found. Impacts remains lazy-loaded with its own stylesheet and no map/3D requirement. Added bilingual evidence increases the impacts JavaScript from about 3.7 KB encoded in the baseline production measurement to about 13 KB gzip in the repaired build. This is documented content cost, not a claimed speed improvement. The offline shell still precaches page resources; Low Data Mode remains available.

## GitHub Pages Problems Fixed

No pre-existing base-path or `?release=2.0.0` routing defect was found. The existing `/El-Nino-Warning-System/` Vite base, hash routing, workflow and service worker are retained; only safe hash-query parsing is added. Publication uses the existing lint/test/ingestion/build/browser-test/Pages workflow.

## Remaining Limitations

- Three sample cells per State/Region; no township, watershed or separate Central Dry Zone estimate.
- No official Myanmar warning-feed connection. DMH/local-authority guidance remains separate from system signals.
- ERA5 publication delay; weather model issue time is not provided by the API. A retrieval is not a new observation.
- NOAA monthly SST feed does not state its anomaly baseline in the supplied file; it is not interchangeable with ONI/RONI or regional ERA5 anomalies.
- No graded local predictive confidence or calibrated impact probability. Historical case studies do not attribute each event to ENSO.
- A malformed operational snapshot is rejected as a whole and falls back to validated cache; its providers are not individually salvaged in the browser. Static information and the independent NOAA bulletin remain available.
- Automated Chromium/axe checks are not full WCAG certification or a human Burmese linguistic/assistive-technology review.
- External source websites can change or restrict access. Verification date is editorial provenance, not climate-data freshness.

## Items Requiring Better Data

Official Myanmar alerts; local station observations; river/reservoir/groundwater levels; soil moisture; crop type, area and growth stage; disease surveillance; fire, haze and air quality; population/infrastructure exposure; local forecast/impact calibration. None is fabricated or inferred solely from ENSO state.

## Validation and publication record

- Unit tests: **44 passed** (including 8 new impacts/data-safety tests).
- Browser regression: **49 passing cases**, with the exact five-size/two-language accessibility matrix run once; two redundant project copies of that matrix are intentionally skipped.
- Lint, formatting, real-data schema validation and TypeScript production build: passed.
- [Successful GitHub Pages deployment](https://github.com/Wai-999/El-Nino-Warning-System/actions/runs/36873618517): code commit `338ae75cf9d76f9404fb862679cfe88ec65fc3e7`; generated source snapshot `d1ddf88`.
- Public verification began **2026-10-01T14:08:10.230Z** and passed against the actual GitHub Pages domain: root, impacts, release-query impacts, direct refresh, preserved sector/region/evidence selections, back/forward, five viewport sizes in both languages, zero axe violations in those views, and service-worker-enabled offline restart.
- Ordinary production browsing recorded **zero console errors, failed requests or HTTP 4xx/5xx responses**. Deliberate failed-request tests run separately and are not suppressed.
- [Machine-readable production evidence](docs/impacts-production-verification.json) includes tested routes/viewports, actual rendered source dates, request sizes and offline result. Reproduce using `node scripts/verify-impacts.mjs`.
- No unverified production fix or unpublished application change remains. Source-data and human-review limitations above remain explicit.
