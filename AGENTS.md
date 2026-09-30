# Project instructions

Use codebase-memory-mcp tools for code discovery when available: `search_graph`, `trace_path`, `get_code_snippet`, `query_graph`, then `get_architecture`. Fall back to ripgrep for literals/configuration or insufficient graph results. The development index name is `myanmar-el-nino`; reindex after substantive changes.

## Safety-critical implementation rules

- Never invent regional warnings, numerical observations, confidence values, or forecast probabilities.
- ENSO assessment and local warning status are different domains. Missing data is unknown, not normal.
- Preserve source and issue/validity timestamps. Retrieval and build times do not refresh a bulletin's scientific validity.
- Update both Burmese and English for user-facing changes.
- Keep numerical/scientific rules out of UI components. Document policy changes in `docs/METHODOLOGY.md` and cover them with critical tests.
- Keep the GitHub Pages base path and offline resource generation working. Source fixtures belong in tests, not public data.

Use `npm run format`, `npm run lint`, `npm test`, `npm run data:validate`, `npm run build`, and relevant Playwright checks before release. Preserve explicit unavailable states until validated, source-backed capabilities exist.
