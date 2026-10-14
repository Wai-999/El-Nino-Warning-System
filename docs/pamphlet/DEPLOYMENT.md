# DEPLOYMENT — single-QR leaflet hub

**Canonical URL (encoded in the QR):** <https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/>
**Repository:** [Wai-999/El-Nino-Warning-System](https://github.com/Wai-999/El-Nino-Warning-System) · files in
`public/pamphlet/el-nino/` (generated — rebuild instead of hand-editing) · GitHub Pages via the repository's existing
Actions workflow (`.github/workflows/deploy.yml`).

## Why this location

- It is the user's existing El Niño GitHub Pages site; no user site (`wai-999.github.io` repository) exists, and a new
  repository could not be created from this session.
- The path is human-readable and version-free. Editions change files _inside_ it (`pdf/…-2026-10-e1.pdf`, `version.json`);
  the URL never changes. GitHub Pages paths are **case-sensitive** (`/el-nino-warning-system/` returns 404), so the QR uses
  the exact repository case. The trailing slash avoids a redirect.
- **Do not rename the repository, disable Pages, change the Pages source away from Actions, or move `pamphlet/el-nino/`:**
  printed QR codes cannot be updated. GitHub does not redirect Pages URLs after a rename.

## Coexistence with the Mokinn app

The app's service worker (scope `/El-Nino-Warning-System/`) used to answer every navigation in its scope with the app shell.
`scripts/build-offline.mjs` now (1) excludes `dist/pamphlet/` from the app precache and fingerprint and (2) returns early for
`pamphlet/` URLs. `tests/e2e/pamphlet.spec.ts` checks both and opens the hub with the app worker active. The hub has its own
worker (scope `pamphlet/el-nino/`) that never uses Cache Storage, so other sites on `wai-999.github.io` that clear all caches
(e.g. `rexipe/sw.js`) cannot delete a saved leaflet.

**Known limitation:** a reader who opened the _old_ app (≤ 2.2.0) on the same phone still has the old app worker until it
updates; on their very first scan that worker may show the app home page. The worker updates during that visit — reloading
shows the hub. This affects only prior app users and only once.

## CI note (pre-existing problem fixed)

Every scheduled run since 13 Oct 2026 failed at `npm test`, so nothing was being deployed: unit tests read the committed
`public/data/operational.json`, whose ERA5 history became stale when the ERA5 source started failing on 8 Oct. The three
affected tests now evaluate fresh-history rules inside that history's own validity window (staleness is still tested). The
app's behaviour is unchanged; the ERA5 source failure itself still needs attention (see the workflow's ingestion-health job).

## How to publish a new edition

1. Update `content.py` / `sources.py` in the build scripts (delivered in `05_BUILD_SCRIPTS/single-qr-hub/`), re-run
   `make_qr.py` (URL unchanged → identical QR), `make_print_pdf.py`, `build_hub.py`, `test_hub.py`.
2. Copy `build/hub/` to `public/pamphlet/el-nino/`, commit, push to `main`. Run the hub production test
   (`python3 test_hub.py --prod`) after the workflow finishes.
3. Readers with a saved copy see “ဗားရှင်းအသစ် ရှိသည်” and can update; the update is atomic and verified.

## Rollback

Revert the commit that changed `public/pamphlet/el-nino/` and push; the workflow redeploys. Never delete the path.

## Production verification (2026-10-14 23:13 UTC)

| Check                                                             | Result                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| QR URL answers 200 over HTTPS without redirect                    | ✅ HTTP 200, text/html; charset=utf-8, server GitHub.com                  |
| page is the hub (title, h1, four panels, build id)                | ✅ build 32ee4d2ed158 in page: True                                       |
| both Facebook links present and exact                             | ✅ GiHmanHAICT, DaweiUniSU                                                |
| URL without trailing slash redirects to the canonical URL         | ✅ HTTP 301                                                               |
| deployed version.json = local build                               | ✅ 2026-10-e1 / 32ee4d2ed158                                              |
| all 21 offline-set files served byte-identical (size + SHA-256)   | ✅ all match                                                              |
| full print PDF online = the print-ready file                      | ✅ 705964 bytes, application/pdf                                          |
| offline-pamphlet.zip served                                       | ✅ HTTP 200, 1569129 bytes                                                |
| sw.js served                                                      | ✅ HTTP 200, 4941 bytes                                                   |
| manifest.webmanifest served                                       | ✅ HTTP 200, 751 bytes                                                    |
| img/panel-1-2x.webp served                                        | ✅ HTTP 200, 213286 bytes                                                 |
| missing path returns 404                                          | ✅ HTTP 404                                                               |
| app service worker excludes pamphlet/ (no precache, early return) | ✅ 33 app shell entries                                                   |
| app release deployed with the change                              | ✅ {"version":"2.2.1"}                                                    |
| app home still served                                             | ✅ HTTP 200                                                               |
| printed QR decodes to exactly this live URL                       | ✅ ['https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/'] |
| external links reachable (31/31 HTTP 200)                         | ✅ all 200                                                                |

### Browser tests against production (2026-10-14 16:13:42 PDT)

28/28 passed (Chromium, `test_hub.py --prod`):

- ✅ layout 320px no horizontal scroll — overflow=0px
- ✅ no console/CSP errors at 320px
- ✅ layout 360px no horizontal scroll — overflow=0px
- ✅ no console/CSP errors at 360px
- ✅ touch targets >= 24px (outside running text)
- ✅ layout 414px no horizontal scroll — overflow=0px
- ✅ no console/CSP errors at 414px
- ✅ layout 768px no horizontal scroll — overflow=0px
- ✅ no console/CSP errors at 768px
- ✅ layout 1280px no horizontal scroll — overflow=0px
- ✅ no console/CSP errors at 1280px
- ✅ all in-page links (claims, sources) resolve
- ✅ four panels in reading order 1-2-3-4 — ['panel-1', 'panel-2', 'panel-3', 'panel-4']
- ✅ both Facebook links exact — ['https://www.facebook.com/GiHmanHAICT', 'https://www.facebook.com/DaweiUniSU']
- ✅ source search filters — 1 shown
- ✅ category filter (health) — ['health']
- ✅ PDF downloads complete and matches published hash — 705964 bytes
- ✅ missing path returns 404 — 404
- ✅ first-ever scan with no network cannot open the page (expected) — Page.goto: net::ERR_INTERNET_DISCONNECTED at https://wai-999.github.io/El-Nino-Warning-Sys
- ✅ offline without a saved copy shows an honest "not saved" page — 503
- ✅ Save for offline completes only after verification — 3.2 s; သိမ်းပြီးပါပြီ — ၁၄ အောက်တိုဘာ ၂၀၂၆၊ ၁၆:၁၃ (၁၈၀၆ KB၊ ဖိုင် ၂၁ ခု)။ ဤဖုန်း/ဘရောက်
- ✅ offline reload serves the saved HTML — header=1
- ✅ offline indicator + last-saved time shown — အော့ဖ်လိုင်း — အင်တာနက် မရှိပါ။ ၁၄ အောက်တိုဘာ ၂၀၂၆၊ ၁၆:၁၃ က သိမ်းထားသော မိတ္တူကို ပြသနေသည်
- ✅ Burmese web font available offline
- ✅ full PDF readable offline — {'ok': True, 'n': 705964, 'off': '1'}
- ✅ bibliography snapshot readable offline — 12524
- ✅ facsimile images readable offline
- ✅ Facebook is not cached (needs network) — network error

### Local end-to-end tests (same files, local server, 2026-10-14 16:00:10 PDT)

32/32 passed, including the scenarios that cannot be run against production without publishing a new build:
stale copy detected → update prompt; a corrupted file during update is rejected and **the previous copy is kept**; a valid
update replaces the copy atomically; **Remove offline copy** makes the page unavailable offline again.

### Accessibility

- axe-core 4 (WCAG 2.0/2.1/2.2 A+AA rules) at 390 px on production: **0 violations**, 36 rules passed; needs manual review: color-contrast.
- axe-core 4 (WCAG 2.0/2.1/2.2 A+AA rules) at 1280 px on production: **0 violations**, 36 rules passed; needs manual review: color-contrast.
- Text/background pairs used by the page were computed by hand: all ≥ 4.5 : 1 (body 15.9, muted 8.2, teal 6.3, gold-deep 5.5,
  source markers 4.8, white on teal 6.8, yellow on teal 6.0).
- Semantic landmarks, skip link, one h1, section headings, `lang="my"` with English parts marked `lang="en"`, keyboard-reachable
  controls (≥ 44 px), status messages in `aria-live` regions, alt text for every image, print stylesheet, no motion.
- Not tested: a real screen reader with Burmese speech (TalkBack/VoiceOver) and real iOS Safari / WebKit — no devices or
  WebKit engine in this environment. Chromium mobile emulation only. Please test on one iPhone and one Android phone
  (steps in QR_TEST_REPORT.md).

## Editable master (PowerPoint)

The `.pptx` that produced the supplied PDF was not available, so the QR was placed by editing the PDF. To make the same change
in the master (slide 297 × 210 mm; the PDF was printed at 96.6 % with a 4.9 mm / 3.6 mm offset): delete the
`[OFFICIAL_SOURCE_QR]` box and the line under the sources line; insert `single-qr.svg` at x ≈ 114.9 mm, y ≈ 164.1 mm,
22.6 mm square (keep 2.4 mm clear on every side); reduce the Do/Avoid line spacing and the heat-box paragraph gaps by the
amounts in CHANGELOG.md; add the caption and offline note. Or send the `.pptx` and the change can be applied there exactly.
