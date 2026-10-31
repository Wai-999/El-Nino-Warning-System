# Operations and recovery

This independent public information aid has no emergency-delivery SLA. Follow original issuing authorities. Runtime source health and all original dates are under `#/sources`.

## Normal updates

GitHub Actions checks at 04:17, 10:17, 16:17 and 22:17 UTC. These correspond to 10:47, 16:47, 22:47 and 04:47 MMT; the last is on the following Myanmar calendar day. Schedules can delay/drop. Manual `workflow_dispatch` remains available. Forecasts, official ENSO assessment, RONI and probabilities have independent last-good data. ERA5 updates at most once per new completed window and reuses cached 1991–2020 normals. Published data commits must include `public/data/climate.json`; a created daily budget ledger is committed with the baseline cache.

Local refresh needs Node 24 and outbound HTTPS:

```sh
npm ci
npm run data:refresh
npm run data:validate
npm test
npm run build
```

No credentials are needed for data providers. Initial missing baseline construction can take several minutes. Do not run simultaneous local baseline rebuilds: the daily quota file and cache assume serialized ingestion, as the workflow's concurrency group enforces.

## Quotas

- Open-Meteo free noncommercial limits: under 10,000 weighted calls/day, 5,000/hour, 600/minute, and 300,000/month. Long/multi-location requests count more than one HTTP call.
- Baseline reservations persist before each request in `scripts/cache/ingestion-budget.json`, capped at 4,500 weighted calls per UTC day and throttled below 450/minute. Failed attempts consume the reservation. Forecast/recent history require additional headroom. Preserve the ledger across same-day retries; never delete it to bypass quota.
- Four bounded scheduled snapshot commits daily are below Vercel's 100-deployment/day limit. Vercel Hobby is personal/noncommercial, with finite bandwidth/request allowances. Check the dashboard periodically and after unusual traffic. No paid plan, database, cron, notification service or auto-upgrade is enabled by this implementation.
- GitHub schedules may be disabled after inactivity. Check Actions, manual dispatch and source age; do not assume a green hosting deployment means fresh scientific data.

## Incident handling

| Symptom                      | Action                                                                                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forecast delayed/unavailable | Inspect provider health and original `validAt/fetchedAt`. Run one bounded refresh; validate units, cell coordinates, Myanmar calendar range and 168 aligned hours. Do not relax date validation to accept the wrong day.      |
| ERA5 delayed                 | Check endpoint and quota, sample hash and missing baseline dates. Resume after budget resets; keep prior window labeled delayed. Never build SPI/SPEI from this short retained window.                                        |
| NOAA parser fails            | Compare original HTML/ASCII format with pinned fixtures. Preserve previous retrieval and issue dates. Update parser/tests together; do not set invented probabilities.                                                        |
| Unexpected official alert    | Verify original issuer domain, area, issue/validity and original severity. Remove/unverify invalid input through a reviewed correction, retain evidence. ENSO and rainfall estimates cannot become official alerts.           |
| Offline stale warning        | Check device clock and the active/expired predicate. Active validity is recomputed on load, visibility changes and every 30 seconds and at the next warning-validity deadline; expiry at the endpoint is covered by fixtures. |
| PWA upgrade problem          | Inspect hashed `mokinn-*` shell caches; current and immediately prior caches are retained for open tabs' lazy assets. New precache bypasses HTTP cache. Do not remove the pamphlet worker or intercept its QR path.           |
| Vercel deployment issue      | Inspect build/deployment status; verify the public production URL. Promote a prior successful deployment or revert the faulty source commit, preserving valid dated data and Git history.                                     |

## Privacy and subscription boundary

Browser storage contains only language/area/map choices, checklists, dated snapshots and an in-site warning filter. No account, analytics, subscriber contact store or messaging integration is present. Approximate coordinates are processed locally after a deliberate action and browser permission. Do not add push/Telegram switches until consent, secure storage, unsubscribe/retention, deduplication, retries, rate limits and real delivery have been implemented and tested with a verified warning feed.

## Review and limitations

Review guidance/source terms at least every 90 days and on provider changes. Fluent Burmese editorial, assistive-technology user testing and Myanmar meteorological/agricultural review remain human review tasks; automated checks do not certify these. Do not describe uncalibrated screens as an authoritative national warning system.
