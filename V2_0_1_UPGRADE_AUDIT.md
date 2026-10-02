# v2.0.1 upgrade audit

Audited 2 October 2026 UTC, before implementation. Repository baseline: `1c47af7`. Production inspected with Chromium at the existing GitHub Pages URL with `?release=2.0.1`.

## Verified findings

| Area              | Evidence                                                                                                                                      | Consequence / planned repair                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Warnings          | Production shows 32 elevated signals; `WarningsPage` filters out `normal` and `unknown` before rendering. No regional table.                  | Missing/normal regions can disappear. Render all 15 canonical units with explicit evidence and missing-data states.     |
| Overview          | Production repeats the same map layers, region selector and regional profile found on Map; source imports `MyanmarMap`.                       | Remove duplicate map; retain dedicated Map. Replace with coverage, priority queue, change comparison and source health. |
| Records           | Production `#/records` returns “Page not found”. Existing warnings History only contains expired bulletins.                                   | Add sourced historical records and validated operational snapshot history as distinct evidence types.                   |
| Official priority | `priority()` promotes an official bulletin only at rank >=3.                                                                                  | Every active, validated Myanmar official bulletin takes precedence.                                                     |
| Geographic guard  | Alert schema checks canonical ID and publisher hostname, but has no explicit country, issuing authority registry ID or stated location scope. | Require Myanmar country and explicit source location evidence; international/regional reports remain context.           |
| Coverage          | ERA5 and forecast schemas require 15 unique regions. Official coverage explicitly unavailable. No combined eight-category coverage KPI.       | Add 15 × 8 coverage matrix, keeping missing drought/flood/advisory feeds visible.                                       |
| Joins             | Existing gridded-data and boundary joins use stable IDs. No broken geographic join observed. Canonical names have no source alias registry.   | Preserve ID joins; validate aliases and all boundaries, including Bago/Shan source subdivisions.                        |
| Freshness         | Forecast and ERA5 have different current/aging/stale rules; valid times survive fetch failures.                                               | Preserve these rules; add source-specific context review and source-health summaries.                                   |
| History           | Git retains full data snapshots; app has no versioned snapshot archive or actual change detector.                                             | Add bounded, schema-validated, dated summaries; avoid invented retrospective updates.                                   |
| Offline           | Existing version-hashed service worker and validated local-storage fallback.                                                                  | Include new compact archive and preserve its original timestamps on failure.                                            |
| Deployment        | Existing Pages base path, hash routing, scheduled four-times-daily data refresh and production verification work.                             | Extend existing workflow and verification; retain hosting.                                                              |

## Source and scope checks

The official Myanmar embassy administrative listing confirms seven states, seven regions and Nay Pyi Taw Union Territory (15 displayed units). Existing MIMU/OCHA/HDX source contains 18 features before Bago and Shan subdivisions are dissolved. These are intentional source subdivisions, not additional top-level dashboard units. Boundary metadata, sample geography and validation are retained.

DMH root URLs did not return usable content in the research browser. This is an access observation, not proof that DMH has no warnings or no feed. No current Myanmar bulletin feed has been verified for ingestion. An empty list cannot mean an all-clear.

No actual foreign-country warning was found mislabeled in production (the alert list is empty). The stronger schema is preventive, not a claim of an observed incident. No fabricated impact percentages, scores or crop losses were found in the audited pages.

Sources and implementation decisions are recorded in WARNING_SYSTEM_RESEARCH.md. New scientific/coverage rules require independent model tests before deployment.
