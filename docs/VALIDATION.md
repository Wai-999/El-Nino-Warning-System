# Release validation

Tested September 30, 2026 against the production build under the actual GitHub Pages base path.

- TypeScript production build, ESLint, Prettier, data validation: pass.
- 16 unit tests: pass. Includes warning eligibility, expiry, coverage, source validation, confidence validation, NOAA parsing and geometry bounds.
- 30 Playwright checks: pass across desktop (1440 px), Android-sized mobile (Pixel 7), and tablet (768 px).
- Automated axe WCAG A/AA checks: no violations on the Burmese overview and the English prepare, learn, map, warnings, impacts, and data screens.
- Offline restart: checklist state, lazy routes, fonts, map geometry, and a clearly dated snapshot remain available after the initial cache installation.
- Invalid snapshot, stale ENSO, inaccessible map: explicit failure states; manual region selection remains usable.
- Additional manual browser checks: 320 px routes have no document-level horizontal overflow; 200% text on the map remains within the viewport. The mobile navigation was exercised.
- Dependency audit after patching Vitest: zero reported vulnerabilities at validation time.

Local Lighthouse mobile emulation: performance **89**, accessibility **100**, best practices **100**, SEO **100**. First contentful paint 1.6 s; largest contentful paint 2.1 s; total blocking time 0 ms; layout shift 0.032. These are local lab results, not real-user network measurements or accessibility certification. Slow Myanmar networks and low-memory devices still require field testing. Initial JavaScript is approximately 99 KB gzip; route/map chunks are lazy. The entire precached offline resource set is approximately 0.8 MB uncompressed.

Visual inspection covered the Burmese and English desktop overview and the Burmese mobile overview. Screenshots are included beside this file. The production pipeline repeats validation before deployment. Live route/asset verification is performed after publication.

Outstanding operational validation: fluent Burmese editorial review, clinical/local agricultural review of public guidance, assistive-technology testing with real users, a reliable regional data partner, current licensed boundaries, and local scientific calibration before activating any numerical warning rule. These are explicitly stated limitations of the release, not passed tests.
