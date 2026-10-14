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

## Production verification

PENDING — not yet verified.
