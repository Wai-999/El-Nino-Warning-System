# V2 scientific methods and operational contract

Version 2.0.0. V1 history is preserved in Git. V2 introduces **application screening signals**, not an official warning authority or a locally validated impact forecast. These signals are separate from official bulletins. Deployment is not scientific certification.

## Regional sampling

MIMU/OCHA HDX source geometry has 18 administrative units. Dissolve Bago East/West and Shan East/North/South to obtain 15 familiar State/Region units, including Nay Pyi Taw. `scripts/prepare-geography.mjs` enumerates 0.25° grid centres inside unsimplified polygons, forms three deterministic spatial clusters, chooses the nearest interior cell to each cluster's weighted centroid, and assigns weights proportional to the sum of cos(latitude) within each cluster. Coordinates and weights are versioned in `scripts/cache/samples.json`.

This is a **three-cell regional sampling estimate**, not a complete area average or a capital-city observation. Large or mountainous regions can contain important unsampled extremes. It is inappropriate to infer township conditions from the polygons. The same cells, weights, explicit ERA5 model, disabled elevation downscaling, nearest-grid selection, units and MMT daily boundaries are used on both sides of climate comparisons. Forecast and ERA5 do not have to share model orography because they are never subtracted to form an anomaly.

## Forecasts

Explicit ECMWF IFS 0.25° via Open-Meteo, with hourly interpolation of coarser native model intervals. Latest modeled hour ≤ retrieval time is shown as a forecast, not a weather-station observation. The next-24-hour sum uses the 24 following hourly precipitation intervals, excluding the preceding hour shown in the current panel. Daily minimum/maximum are extrema of the weighted regional hourly temperature series. Daily rain is its weighted total. Current weather code is the code at the sample representing the largest area; this is disclosed.

For hazard screening, maximum heat index, 24-hour sample rain total, and wind gust are taken across all three cells and the next 24 forecast hours. They are not the maximum over the whole administrative area. The API does not expose a model initialization time; retrieval time must not be described as a model run. Deterministic IFS precipitation does not supply a probability, so none is invented.

## Real climate departures

ERA5 historical daily data is delayed by approximately five days. The pipeline uses the complete 30-calendar-day window ending six UTC dates before ingestion, with a conservative margin. All provider daily sums and means use Asia/Yangon (UTC+06:30). The resulting period is displayed explicitly.

- Temperature: mean of the 30 regional daily means, minus the mean normal for those same calendar dates.
- Baseline normal: arithmetic mean of each calendar day's regional value across **all 30 years, 1991–2020**. An absent year invalidates that day; missing data is not zero. February 29 uses the average of February 28 and March 1 normals to retain a 30-year reference rather than an eight-leap-year normal.
- Rainfall: recent 7/30-day totals and expected totals from the same dates in the baseline. Absolute 30-day departure is recent minus expected.
- Percentage departure: `100 × (recent − expected) / expected`, withheld if expected <10 mm. This denominator guard is a display-stability policy, not a climatological hazard threshold.
- Trailing dry days: consecutive regional sampled-mean days with precipitation <1 mm/day, counted backward from the recent window's final day and capped at 30 (display 30+). It is not annual ETCCDI CDD, and it is not SPI/SPEI or a formal drought declaration. The wet-day threshold follows the [ETCCDI convention](https://etccdi.pacificclimate.org/list_27_indices.shtml).

Intermediate calculations retain precision. Published data is rounded to two decimals and UI mostly one decimal. Baselines remain in the repository cache, never the browser. Calendar-day means support expected totals; no percentile or return period is claimed. Rainfall reanalysis is subject to model bias and can differ substantially from local gauges.

## Independent screening modules

Ordinal taxonomy: Normal=0, Advisory=1, Watch=2, Warning=3, Severe=4. These are not probabilities or an additive risk score. A source failure yields unknown for dependent modules.

| Module          | Inputs and exact thresholds                                                                                                                          | Meaning / limits                                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heat            | Highest next-24-hour sampled NWS heat index ≥80/90/103/125°F → Advisory/Watch/Warning/Severe                                                         | NWS general caution, extreme caution, danger and extreme danger categories, translated into app taxonomy. Not Myanmar government heat criteria                                  |
| Heavy rain      | Highest next-24-hour sample total ≥20/50/100/200 mm                                                                                                  | Application planning cutoffs. They are not locally calibrated flood thresholds; drainage, terrain and upstream water are missing                                                |
| Wind            | Highest next-24-hour sampled gust ≥40/60/80/100 km/h                                                                                                 | Application planning cutoffs, not tropical cyclone classifications or official wind warnings                                                                                    |
| Dryness         | Expected 30-day rain must be ≥30 mm. Deficit ≥25% → Advisory; deficit ≥50% AND trailing dry days ≥7 → Watch; deficit ≥75% AND dry days ≥14 → Warning | Conservative conjunctive planning rules. No Severe level and no meteorological drought declaration. Seasonal expected-rain gate limits false alarms during normally dry periods |
| Water pressure  | Same level as dryness                                                                                                                                | Rainfall proxy only. No river, reservoir, groundwater or water-utility observation                                                                                              |
| Agriculture     | Maximum heat/rain/dryness level, only when all three inputs are usable                                                                               | Weather stress planning proxy; no crop-stage, soil moisture, irrigation, vegetation or loss assessment                                                                          |
| El Niño context | Current NOAA El Niño Watch/Advisory AND local evidence; carries the existing combined level unchanged                                                | ENSO adds contextual explanation, never raises local severity or attributes an individual event                                                                                 |

Heat index follows the [NWS WPC Steadman/Rothfusz algorithm](https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml), including the preliminary estimate and low/high humidity corrections. Inputs are paired temperature/RH at the same sample and hour; the function is not applied to independently averaged extrema. [NWS category guidance](https://www.weather.gov/ama/heatindex) assumes shade/light wind. Sun exposure, occupation, acclimatization, age, duration and night-time recovery change health risk. It is not WBGT. Heat index should not be used alone for work/rest rules or diagnosis. The regression is an approximation, particularly at extreme temperature/humidity.

Rain, wind, dryness, water and agriculture thresholds are explicitly application policy, not thresholds issued by DMH, WMO, WHO or FAO. **No Myanmar forecast-skill/confidence percentage or categorical confidence has been measured.** The UI states this instead of manufacturing “high confidence.” These are useful transparent screens requiring local verification; they must not independently trigger evacuation or crop investment.

Overall attention is the highest available independent heat/rain/dryness/wind or official severity. Unknown modules stay unknown; a Normal screen only means none of the selected usable thresholds was crossed. Rankings can contain ties and reflect sample coverage, not a proven ordering of total regional vulnerability.

## Priority, impacts and updates

1. Active official Warning/Severe bulletin first.
2. Otherwise immediate next-24-hour weather Warning/Severe signal.
3. Otherwise current official El Niño assessment.
4. Otherwise everyday regional overview.

Priority changes presentation, not severity. Historical dryness is labeled historical rather than promoted as an immediate weather event. Sector implications are conditional: health uses heat/rain; agriculture uses its combined weather proxy; water uses rainfall deficit/heavy-rain context; energy uses heat/water/wind. They describe possible stress, not observed damage, illness, shortages, crop losses or outages. Each region card links the input and action.

The curated information feed currently has one authoritative allowlisted publisher: NOAA CPC. Its stable discussion URL and issue date give one deduplicated information card. Original publisher, date, geography, category, validity and source are preserved. The monthly Niño 3.4 SST anomaly series is separate from official ENSO state and must not be confused with RONI/ONI. The optional strength-outlook parser accepts only an explicit “very strong event” percentage and season in the source; unknown wording hides that field. The percentage concerns event strength in the tropical Pacific, not local Myanmar weather or impacts. No full article is republished.

## Official bulletins

The independent `current.json` contract is retained from V1. An eligible bulletin must have `validFrom <= now < validUntil` and `issuedAt <= now`, a recognized publisher, matching HTTPS source host, exact region, bilingual impact/actions and source-provided confidence or `not-provided`. Highest valid severity wins. Expired/replaced items remain archived. Do not invent or extrapolate official coverage from model signals.

A maintainer may add a genuinely verified local official bulletin using `alertSchema`; verify source publication and translation, preserve original severity, explain any taxonomy mapping, and record the revision/change. Mark partial coverage for subsets. Only mark complete after verifying every supported area, with a nonfuture `regionalCheckedAt`; this coverage expires after 24 hours. Current official Myanmar coverage is unavailable. DMH and local instructions remain primary for urgent decisions.

## Freshness and failure

| Dataset            | Expected refresh                      | Stale policy                                                                        |
| ------------------ | ------------------------------------- | ----------------------------------------------------------------------------------- |
| ECMWF forecast     | Four daily jobs                       | ≥18 h since retrieval OR latest modeled hour; any missing valid coverage is unknown |
| ERA5 recent period | Daily                                 | Final local calendar day more than 10 days old; future dates invalid                |
| Baseline           | Missing date cache replenishment      | Fixed 1991–2020 normal; sample/method hash must match                               |
| NOAA discussion    | Monthly publication, checked each job | Valid through stated next-update day; original dates retained                       |
| Monthly Niño 3.4   | Monthly                               | Period more than 100 days old labeled stale                                         |

A failed provider retains its last valid dataset **with its original valid/fetched times**. Pipeline health records attempts, success, and errors. There is no silent substitution with another model or a zero value. Schema, unit, coordinates, lengths, contiguous timestamps and plausible physical ranges are validated. A last-good value can be stale; ingestion success alone cannot make it scientifically current. Device clock affects browser freshness.

## Offline and low data

App shell, route chunks, fonts, preparedness and most recent successful snapshots are cached. Maps are cached after first use rather than prefetched in Low Data Mode. Network-first JSON falls back with an explicit cache marker; localStorage fallback is revalidated. Cached/offline views expose original update dates. Low Data Mode suppresses the map and optional charts, keeping text warnings and regional profiles. No location tracking, analytics, accounts or external client API requests. Service workers and device storage can be evicted; first use needs connectivity.
