# Warning methodology and data contract

## Public-safety boundary

Mokinn is an independent preparedness application. It is **not an official warning authority, emergency dispatch service, or validated numerical forecasting model**. The current release has a sourced Pacific ENSO assessment, but no connected Myanmar regional alert, observation, drought, reservoir, or grid feed. Those surfaces display unavailable or not assessed, never fabricated values or a green all-clear.

## Explicit operational thresholds

| Rule                             | Threshold                                                                 | Outcome                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Active regional bulletin         | `validFrom <= now < validUntil`, with `issuedAt <= now`                   | Eligible for current warning view                                                               |
| Regional level                   | Maximum of eligible source-mapped severities for that region              | Normal=0, advisory=1, watch=2, warning=3, emergency=4; these are ordinal ranks, not risk scores |
| Complete coverage freshness      | Strictly less than 24 hours from `regionalCheckedAt`, no future timestamp | A region without a valid bulletin may be normal only with verified complete coverage            |
| Missing, partial, stale coverage | Any of the above prerequisites absent                                     | Not assessed                                                                                    |
| ENSO freshness                   | Valid through the stated next NOAA discussion day, UTC                    | Afterwards the old bulletin is labelled out of date and no current ENSO status is asserted      |
| Plausible NOAA issue interval    | More than zero and at most 45 days                                        | Reject unknown source formats or implausible parsed dates                                       |

Expiry is checked every 30 seconds and on visibility/network changes. The device clock is used; an incorrect device clock can affect freshness. A page refresh checks the deployed snapshot, not NOAA directly. Daily publication retrieves NOAA. Retrieval time, issue time, and validity are separate values.

**There are no meteorological scoring thresholds in this release.** National ENSO status must never create a Myanmar alert or fill a missing regional measure. A heat threshold without local climatology, humidity, exposure, duration, and expert review would create unwarranted precision. Adding numerical triggers requires a documented Myanmar validation study, source-specific units and spatial aggregation, an approved threshold configuration, uncertainty handling, versioned methodology, and tests. Never activate a demonstration rule on the public warning map.

## Data provenance and validation

`src/data/schema.ts` uses Zod to reject malformed timestamps, invalid geography, unsupported severity/confidence values, missing Burmese or English action text, duplicate alert IDs, invalid periods, and source-publisher hostname mismatch. Schema validation does not prove the content of a bulletin: a maintainer must verify the original document. WHO/FAO/WMO content must actually be a location-specific bulletin; a general article is not sufficient.

The NOAA adapter extracts only the stated ENSO alert status, issue date, and next discussion date from the official CPC page. It does not infer a probability, local temperature anomaly, or local warning. Any source-format change causes safe failure. The previous bulletin retains its dates. `ensoFetch: failed` is visibly reported. The pipeline deploys this safe fallback before the separate ingestion-health job flags a source failure to the repository owner.

Sources:

- [NOAA CPC ENSO discussion](https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml): official, global-scale assessment. Not a local forecast.
- [Myanmar DMH](https://www.dmh.gov.mm/): link to official local information. No scraping or feed integration is represented as working. Access was unreliable during implementation.
- [geoBoundaries metadata](https://www.geoboundaries.org/api/current/gbOpen/MMR/ADM1/): MMR-ADM1-20573499, reference year 2019, Myanmar Analytics Project, CC BY 4.0. Source revision `9469f09`, build December 2023. Source metadata retained in `public/data/boundary-source.json`.
- [WHO heat and health](https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health) and [WHO heat advice](https://www.who.int/docs/librariesprovider2/default-document-library/who-heat-infosheet-eng-2026.pdf): general preparedness, not personalised care.
- [FAO El Niño](https://www.fao.org/el-nino/en): agricultural mechanisms and anticipatory actions.
- [WMO ENSO](https://wmo.int/themes/el-nino-la-nina-phenomena), [NOAA education](https://oceanservice.noaa.gov/facts/ninonina.html), [NOAA Walker circulation](https://www.weather.gov/media/wrn/walker-circulation.pdf): educational mechanisms.

## Regional bulletin update procedure

1. Obtain an accessible official, location-specific bulletin and review its original publication, period, units, geography, hazards, and instructions. Have a fluent Burmese reviewer verify safety-critical translated instructions.
2. Add it to `public/data/current.json` using `alertSchema`. Retain `source.url`, `source.name`, `source.publisher`, `source.originalSeverity`, and `source.retrievedAt`. Use a unique stable ID including the bulletin revision. Supply 3–5 concise actions and at least one preparation item.
3. Preserve the publisher's confidence and justification. If none is stated, use `not-provided`; do not infer high confidence from an official logo. Preserve original severity and document any translation to the app's five-level scale in the record description/change text.
4. Set `regionalCoverage` to partial for a subset. **Only set complete after an actual authoritative check of every supported area**, timestamped in `regionalCheckedAt`. Merely having no records is not complete coverage. The 24-hour TTL is deliberately conservative and is not a scientific warning threshold.
5. For a replacement/cancellation, move the prior revision to `history`, update the active list, and record a bilingual `change` explanation. An expired active record automatically appears as history. Archives are never treated as active.
6. Run `npm run data:validate`, `npm test`, `npm run lint`, `npm run build`, and `npm run test:e2e`. Review the changed public view, then merge through GitHub.

No test fixtures ship in `public/`. Test alerts are synthetic and named TEST-ONLY.

## Map precision and limitations

The 14 polygon areas are reference geography, not current political or operational boundaries. Nay Pyi Taw is selectable but lacks a separate polygon in this source; the app explicitly says so. Existing 2019 Mandalay geometry may include territory now separately administered. No administrative endorsement is implied. A current vetted boundary source with a compatible redistribution license is needed before treating this as authoritative geography.

Source names such as `Saigang` and `Tanitharyi` are joined by ISO codes and displayed with canonical names. Simplification uses topology-preserving mapshaper at 12%, preserving shapes and rounding to 0.001 degrees; source download was about 1.5 MB and the distributed geometry is about 76 KB. This is display geometry, not survey geometry. D3 requires a winding conversion in memory; the source file remains RFC 7946. A geometry regression test checks area and bounds.

Only warning severity and coverage layers are enabled. Anomalies, drought, sector risk, district and township precision are unavailable. When selected, a region's green fill means **selection only**, as stated in the legend. Hatching means missing assessment. Future temperature/rainfall layers require a baseline, period, resolution, units, source, and uncertainty; actual temperature and anomaly must be separate fields.

## Scenarios, offline behavior, and delivery

Planning scenarios are qualitative conditional assumptions, not local forecasts, historical measurements, or assigned probabilities. No scenario generates alerts.

The production build precaches the shell, all lazy route chunks, Burmese fonts, geometry, and the dated snapshot. A network-first snapshot response falls back to the cached response with an explicit cache header; the UI also validates cached localStorage records. On first visit, network is required to install the cache. Browser eviction, unsupported service workers, private-mode restrictions, or an interrupted first installation can prevent offline use. Blocked localStorage is handled without crashing; checklists then last only for that visit.

`src/services/delivery.ts` defines a future delivery contract. No messages or notifications are sent, and no permission prompt is raised. Future channels must check validity at send time, retain the source, deduplicate revision IDs, and handle cancellations. Critical notification infrastructure needs a separate operational review.
