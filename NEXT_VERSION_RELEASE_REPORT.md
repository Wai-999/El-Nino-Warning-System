# 2.2.0 release report

Status: **Local implementation and release verification passed; GitHub Pages deployment and production verification pending.** This minor release extends 2.1.0 with compatible Health/media features and preserves the existing Pages URL, hash routing, bilingual content, operational pipeline and offline behavior. Release date: 7 October 2026 (America/Los_Angeles). Research and editorial guidance review occurred on 4 October; later builds do not refresh those dates.

## Verified problems and final behavior

The [before/after content audit](CONTENT_AND_FEATURE_AUDIT.md) records the deployed 2.1.0 baseline: Impacts began with repeated ENSO content and Mandalay selected; there was no Health route or video library; full source matrices and health/history content were repeated across pages. No fake AI percentage or fabricated numerical KPI was found. Existing KPI tiles needed inspectable provenance and clearer incomplete-data wording.

Impacts now opens on **Potential impacts for Myanmar**, with canonical country/State/Region selection before substantive evidence. Regional selection retains source-dated forecast/reanalysis and conditional health/agriculture/water/energy pathways. Country cards are explicit ranges across sampled regional estimates, not unweighted national averages. Unsupported drought, inundation, fire/air quality, food-security, livelihoods and ecosystem outcomes carry explicit evidence gaps. Temperature and rainfall are supported environmental inputs, not measured harm. No unsupported township selector, incidence, yield loss, river flood probability or outage estimate was added.

Full current ENSO belongs to Summary, the coverage matrix to Data, historical evidence to Records, symptoms/first aid to Health, seasonal explanation and media to Learn, checklists to Prepare, and the spatial view to Map. Other pages retain brief useful summaries and links. The official-warning page and source hierarchy remain distinct from platform screening.

## Health and evidence

Nine bilingual topics implement exposure pathway → signs → safe immediate action → care threshold → urgent red flags → prevention → source. [Health methodology](HEALTH_GUIDANCE_METHODOLOGY.md) maps each topic to WHO, CDC or NHS clinical references and official Burmese materials. Heatstroke is immediate emergency care plus cooling, with unsafe-swallowing protection and no wait-for-temperature instruction. No individualized diagnosis or medication dose is offered.

The geographically qualified WHO/UN August 2026 Health Cluster bulletin is separately labeled **DISEASE SURVEILLANCE · DATED REPORT**, with publication-based freshness and explicit reporting incompleteness. Sittwe/Shwebo references do not imply entire-state incidence. No-report means unknown, not zero; weather never changes this report or predicts disease. All guidance remains accessible without weather data and offline. Independent clinical and native Burmese review remain unresolved limitations.

## KPIs, sources and media

The four real Summary KPIs now expose value, unit, method, period, baseline applicability, contributing source/update and decision meaning. Unknown official totals stay unavailable; incomplete watch-region counts use a lower-bound sign. Coverage remains 120 expected cells with monitoring and guidance distinguished. No decorative KPI was invented or falsely claimed removed. Niño 3.4 freshness now matches the registry's 62/93-day policy; official RONI is linked and distinguished from the existing monthly SST anomaly feed.

Two BBC News မြန်မာ videos are included: [4 June 2026, 4:07](https://www.youtube.com/watch?v=2gZIJYf7y0c) and [20 December 2023 UTC, 4:10](https://www.youtube.com/watch?v=ukmjwAJBGmE). Channel identity, titles, dates, durations, URLs and thumbnails were checked against publisher channel/player/oEmbed metadata. Dated-news framing and informal event nicknames are qualified. Full transcripts were unavailable; no line-by-line scientific endorsement is claimed. YouTube never supplies hazard, climate or medical values. Thumbnails load only on request, pause in Low Data mode, and fail gracefully; playback stays on YouTube.

[Data gaps](DATA_GAPS.md) records Myanmar → ASEAN → international source research, temporal/geographic/access/license gates and rejected substitutes. WMO ENSO/GSCU, NOAA diagnostics/strength/RONI, ASMC, DMH, GloFAS, FAO ASIS and NASA FIRMS were evaluated. No reliable structured DMH warning feed was recovered. Real datasets needing access keys, catchment/crop processing or local validation remain integration gaps. RONI remains a direct official link pending a validated parser/revision contract. Next manual research target is 4 November; no new automation was created.

## Validation, accessibility and performance

- Formatting, lint, TypeScript/build, source schemas and **68 unit tests passed**.
- Full Playwright suite: **70 passed, 8 intentionally skipped** duplicate viewport/lifecycle cases across desktop/mobile/tablet.
- [Local release verifier](docs/health-2.2-local-verification.json): **10 routes, 64 viewport/route/language combinations**, no detected automated WCAG A/AA violations or page overflow, 15 regions, 19 archived summaries, all Health topics and content ownership, and offline reload/navigation across seven routes. No page/console, failed request or asset HTTP errors.
- [Link verification](docs/health-2.2-link-verification.json): 11 clinical sources, four Burmese WHO resources and both thumbnails returned HTTP 200; both BBC oEmbed identities matched the registry. Link availability is point-in-time, not an uptime guarantee.
- Visual review inspected Burmese Health at 390 px, English emergency actions, phone Impacts and desktop Learn. Video preview space was reduced to a 16:9 crop after inspection; the subsequent release verification includes its responsive/accessibility checks.
- Initial app execution on Health/Learn requests neither the map stack/geometry nor archive JSON or external video images. Archive requests are deferred to Summary/Records. Health and media are lazy route chunks. The service worker intentionally precaches local chunks for offline use; it does not preload remote video media.
- The local bundle is approximately 113 kB gzip for entry JavaScript; the Health route is 4.9 kB gzip plus 7.3 kB clinical data; Learn is 5.5 kB gzip. The local offline shell is about 1.13 MB including local fonts, geometry and source snapshots. These are build measurements, not a measured Core Web Vitals score.

The first expanded release-verifier attempt incorrectly treated the cumulative resource timeline after hash navigation as a fresh Health load. The verifier now reloads Health/Learn before checking their initial resources; the corrected full run passed. The earlier code-index approval review failed due to usage limits; indexing subsequently succeeded. Neither was an application defect or a bypassed safety check.

## Deployment and production verification

The initial CI run was intentionally superseded before deployment to place sector controls after top pressures and metrics, matching the requested mobile order. Six focused Impacts browser tests passed after this adjustment. Final deployment pending. Completion requires the existing GitHub Pages workflow to succeed and independent checks of the real deployed version, all primary routes, source dates, mobile/Burmese rendering, source/media links and offline behavior. This report will be updated with the actual workflow/commit and production evidence before the task is reported complete.
