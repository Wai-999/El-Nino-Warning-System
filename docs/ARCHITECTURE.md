# Architecture decision: static, source-backed public information

Accepted 31 October 2026, before implementation. User target: Vercel Hobby; retain GitHub Pages and printed QR paths.

## Decision

Retain React/TypeScript/Vite and the existing reviewed snapshot ingestion. A public static app loads small same-origin JSON snapshots with Zod validation. GitHub Actions performs bounded source refreshes four times daily; ERA5 is daily and baseline cache is reused. Add a separate, validated NOAA climate snapshot for RONI and phase probabilities. Partial failures preserve independently dated last-good inputs. The browser performs no provider polling and no private API calls.

Vercel builds the same source with `VITE_BASE_PATH=/`; Pages keeps `/El-Nino-Warning-System/`. Use hash navigation to avoid server routing dependencies. Do not configure Vercel cron. Merging new snapshot commits can trigger a Vercel rebuild, at most the existing four scheduled refreshes daily; no rebuild-per-weather-reading design. A future object store can separate data publication if usage warrants it.

## Contracts and semantics

- Preserve `Snapshot` official assessment/warning and `Operational` forecast/reanalysis contracts. Add `ClimateSnapshot` with independent issue/retrieval/expiry, checked status and source URLs per dataset.
- `src/data/indicators.json` (exported to `data/indicator-registry.json` during build) is the machine-readable contract for every public metric and unavailable capability. The Sources page renders this registry and provider metadata.
- Data classes: modeled forecast, reanalysis, derived estimate, official assessment, official warning, educational guidance. They are labeled separately.
- Warning active status is recomputed against the device clock on load, visibility change and every 30 seconds and at the next warning-validity deadline, including offline. Future, expired and invalid dates cannot be active. Retain issuer taxonomy verbatim.
- Stale forecasts remain dated historical snapshots, never current weather. Missing values display an em dash and a reason. ENSO never determines local warning severity.
- No standalone live health-risk engine. The V3.1 owner decision replaces the static clinical panel with independent official WHO publication metadata, with unknown expiry/current advisory status. Agriculture guidance is general, with crop/stage assumptions.

## Interface

Six core routes: Home, Weather, Climate, Map, Safety, Sources. Learn is a secondary route. Desktop top navigation, five mobile bottom destinations with Sources/Learn in the menu. Shared location and language persist locally; geolocation only after a deliberate permission action. Selection describes a state/region representative sample, not a station or township observation. Lazy-load the map, history charts and education.

## Cost, privacy and delivery boundaries

Static hosting, scheduled GitHub Actions and public noncommercial APIs require no added paid service. Source terms and current quota evidence belong in `DESIGN_RESEARCH.md` and `SOURCE_MATRIX.md`. No account, analytics, server subscriber store or secret is needed to read the app. Push/Telegram delivery is unshipped until a verified warning feed, secure subscription backend, unsubscribe/retention policy and bounded delivery worker are in place. A local saved-interest filter is allowed only when explicitly labeled as a device preference, never a subscription.

## Rollback

Keep base commit and current Pages deployment. Review a pull request before main integration. Vercel can promote a prior successful deployment; revert the merge commit to roll back source. Printed hub and its own service worker are outside the redesign scope. Preserve last-good snapshot timestamps during recovery.

## V3.1 architecture amendment

Approved owner decisions on 31 October 2026 add a validated static administrative-reference module and a separate `HealthAdvisories` snapshot. Typed hierarchy/PCodes and saved places do not change regional weather sampling. WHO is queried once per existing scheduled run, independently validated and atomically written with last-good fallback, then checked after safe deployment. Its records never enter meteorological risk calculations. Bibliographic metadata and links avoid clinical generation and unreviewed critical translation.

The main weather/map interface stays source-backed and lightweight. The homepage map reuses the existing lazy regional map; township geometry is not loaded. Numerals, motion and saved-place/preparedness/crop preferences are local only. No hosting migration, server backend, paid service or notification store is introduced. The owner’s updated decisions authorize multiple saved places and international numerals by default, superseding the earlier single-location/number-format choices.

## V3.2 audit amendment

Retain the existing hosting, scheduling, regional risk inputs and QR destination. Add a statically validated, typed GeoNames settlement reference alongside township geography. A named point supplies identity and a disclosed reference-parent lookup; it does not change regional meteorological resolution. Saved unavailable references persist without reassignment.

The same bounded ECMWF request produces an independent `weather-details.json` snapshot containing original point arrays; core data remains small and independent. `enso-indices.json` carries three independently validated NOAA index histories. Load both only on demand and exclude them from initial offline precache; after first use use the same network-first dated-fallback policy. Do not duplicate the larger forecast in localStorage. Three extra NOAA requests per scheduled run and the expanded 15-variable ECMWF request require no account, paid service or new backend. The static delivery/subscriber limitation is unchanged. See the source/quota audit for exact units, provenance and open gates.
