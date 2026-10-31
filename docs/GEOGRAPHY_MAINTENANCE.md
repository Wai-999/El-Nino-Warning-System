# Township geography, versions and corrections

## Pinned source and provenance

The app extracts names, source centers and typed parent codes from MIMU-derived OCHA/HDX Myanmar COD-AB v01, not a claim to the latest MIMU PCode release.

- [Dataset and metadata](https://data.humdata.org/dataset/cod-ab-mmr); [metadata API](https://data.humdata.org/api/3/action/package_show?id=cod-ab-mmr).
- [Original names workbook](https://data.humdata.org/dataset/3ac9b527-dff2-4b9f-a16e-476aa821896a/resource/70867a74-910a-4476-8451-7ddabfe888c7/download/mmr_admin_boundaries.xlsx), SHA256 `ce7d5002d198844ee239c637c05f318eaaa82f034d681063cf518dcc8cb375aa`.
- Geography valid 2024-02-15; source review 2025-10-30; resource updated 2026-08-14. These dates describe different things. Retrieval does not update geography.
- [CC BY 3.0 IGO](https://creativecommons.org/licenses/by/3.0/igo/). Attribution: MIMU / OCHA / HDX. App modifications: extraction of levels 0–3, normalization into JSON, explicit crosswalk to the existing 15 regional weather units. No endorsement is implied.
- Internal payload: `src/data/admin-2024.json`; 1 country, 18 source admin1 units, 80 districts, 330 townships. Source Bago East/West and Shan East/North/South remain in the hierarchy; the explicit geometry crosswalk provides the 15-unit weather parent.
- District self-administered-zone codes contain `S` (for example `MMR005S001`); they must not be discarded by a digits-only parser. District and township codes can overlap. Always use `(level, PCode)`, such as `district:MMR001001` and `township:MMR001001`.

Source centers are reference geometry centers, not stations, safe locations or township weather samples. No township geometry or 12.6 MB download is needed for the simple search. The existing accessible regional map remains separate from township lookup.

## Names, search and exclusions

Both original English and Burmese names are retained. Search normalizes Unicode compatibility forms, invisible joiners, spaces/punctuation, code casing and Myanmar digits. Latin names tolerate one edit only as candidate search results. A user must select an exact code; duplicate names such as Htantabin and Minhla never resolve by taking the first match. Unicode Burmese is supported; unvalidated legacy Zawgyi conversion is not claimed.

The source workbook's extra alias fields are empty. Nine individually reviewed historical/alternate search aids are recorded with evidence in `src/data/township-aliases.json`: Prome, Tavoy, Mergui, Moulmein, Mawlamyaing, Bassein, Maymyo, Maymo and Akyab. Attribution: [GeoNames](https://www.geonames.org/about.html), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). They are search aids associated with named townships, not authoritative boundary renames. We do not bulk-import GeoNames: two older codes conflict with the pinned HDX version, and unreviewed alternate names contain errors.

The workbook has only partial lower-level coverage: 14,174 admin4 rows and 1,999 admin5 rows, with missing/duplicate codes and Burmese names. These are deliberately excluded from the complete-township selector. Do not advertise nationwide village coverage. Direct MIMU PCode 9.7 / GeoNode requests returned 403 during review; this does not invalidate the downloadable pinned HDX source or justify calling it the latest release.

## Reviewed correction workflow

1. Use the repository's Geography correction issue template, specifying dataset version, administrative level, exact PCode, names in both languages, proposed change, original-source URL and issue/validity date.
2. Obtain the original authoritative dataset and record its URL, license, actual geographic validity, review/upload dates and SHA256. Preserve the old payload in Git.
3. Diff typed PCodes for additions, retirements, renamed and moved parents. Review code reuse, source subdivisions and all alias evidence. Do not update saved places through an ambiguous name or a nearest-center guess.
4. Update the explicit crosswalk and schema/count tests only after reviewing evidence. Unknown/retired saved codes must be marked unresolved; never silently move a saved location or broaden a bulletin.
5. Run formatting, lint, unit tests, source validation, production build and township/search/offline/accessibility browser tests. Record the reviewed version and migration in this file and the changelog before publishing.

No public submission automatically changes geography or warnings. `npm run data:validate` verifies every unique code and parent on every scheduled build. Corrections are repository review work; there is no moderation or community damage system.

## Data fallback and saved-place privacy

Township weather/reanalysis use the existing explicitly named parent-region ECMWF/ERA5 samples. ENSO remains Pacific context. Gauges, township flood extent and direct township official-warning coverage remain unavailable. The overview shows the method separately for each indicator, original periods and delayed states. A finer administrative label does not create finer meteorological data.

Up to 12 validated typed place IDs are stored locally. Crop/stage choices and preparedness progress are stored per place. On first upgrade, the old unscoped checklist is migrated once to the then-selected place; its original storage is retained. These preferences do not register a browser/Telegram subscriber or guarantee delivery.

## Changelog

- 2026-10-31 / app 3.1.0: first pinned bilingual 330-township hierarchy, reviewed aliases, typed IDs, bounded saved places and correction workflow. No boundary or warning-data precision increase claimed.
