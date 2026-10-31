# Geography source research — 31 October 2026

## Recommended pinned source

Use the original MIMU-derived [Myanmar COD-AB dataset published by OCHA/HDX](https://data.humdata.org/dataset/cod-ab-mmr). Its [CKAN metadata API](https://data.humdata.org/api/3/action/package_show?id=cod-ab-mmr) was retrieved successfully and saved as `el-nino-v3-geo/hdx.json`. License: [CC BY 3.0 IGO](https://creativecommons.org/licenses/by/3.0/igo/legalcode), requiring attribution, a license link and disclosure of modifications; do not imply endorsement. Source validity is 15 February 2024; accuracy/completeness review 30 October 2025; downloadable resources last updated 14 August 2026. Preserve all three dates. A newer upload is not evidence of current administrative boundaries.

Direct names workbook: https://data.humdata.org/dataset/3ac9b527-dff2-4b9f-a16e-476aa821896a/resource/70867a74-910a-4476-8451-7ddabfe888c7/download/mmr_admin_boundaries.xlsx

Direct geometry archive: https://data.humdata.org/dataset/3ac9b527-dff2-4b9f-a16e-476aa821896a/resource/ad536327-6196-4cc4-9ee9-1b2f20457087/download/mmr_admin_boundaries.geojson.zip

## Actual file validation

Files are under `/private/tmp/el-nino-v3-geo/`:

- `verified-admin0123.json`: country, 18 source admin1 units, 80 districts, 330 townships. Every record has original English/Burmese names, original PCode, original parent code and source center coordinates. All 330 township codes are unique, and every township parent resolves. Bago East/West and three Shan subdivisions explain 18 source admin1 units versus the app's 15 canonical regions. Map these through an explicit reviewed crosswalk, retaining source parent labels.
- `mmr_admin_boundaries.xlsx`: 4,243,146 bytes; SHA256 `ce7d5002d198844ee239c637c05f318eaaa82f034d681063cf518dcc8cb375aa`.
- `mmr_admin3.geojson`: 330 township features; 12,598,513 bytes; SHA256 `3f913719f320656104ec993ee5c8fabd8ba4eeb4ca9d397d159b21186173390f`. Same English/Burmese fields and PCode hierarchy as workbook. Original geometry archive SHA256 `58e751855056cc382070fd10575d68f2f2a6420187e389f5f02036e9958d4fd3`.
- `admin-workbook-extracted.json`: all raw workbook levels. Admin4: 14,174 rows, only 14,168 coded, 14,160 unique codes, 13,500 Burmese names. Admin5: 1,999 rows, only 1,964 coded, 1,946 unique codes, 1,965 Burmese names. These are explicitly partial coverage, with missing and duplicate codes. Do not expose them as a complete national village gazetteer or silently invent IDs/names.
- **Type-qualify internal IDs**: source district and township codes can be identical! Example both Myitkyina district and Myitkyina township have `MMR001001`. A `(level,pcode)` key avoids collisions.
- Duplicate township names `Htantabin` and `Minhla` require parent labels and exact PCode selection; do not select first matching name.

## Aliases and historical names

The HDX workbook's optional `name2/name3` fields are all empty at levels 0–3. Do not claim comprehensive historical-name coverage. `reviewed-alias-evidence.json` supplies nine short, individually checked alias records for seven townships: Pyay/Prome, Dawei/Tavoy, Myeik/Mergui, Mawlamyine/Moulmein/Mawlamyaing, Pathein/Bassein, Pyin Oo Lwin/Maymyo/Maymo, Sittwe/Akyab. They are separately attributed to [GeoNames' public country dump](https://download.geonames.org/export/dump/MM.zip) under [CC BY 4.0](https://www.geonames.org/about.html). Each record includes the exact GeoNames evidence URL, modification date and matching MIMU township PCode. These are search aids, not boundary or official-name changes. [GeoNames' format/license documentation](https://download.geonames.org/export/dump/readme.txt) warns its data has no accuracy/completeness guarantee and may be user edited.

Do **not** bulk import GeoNames aliases: only 328 of its 330 ADM3 PCodes match the pinned HDX 330, and it contains malformed Burmese names and at least one clearly wrong alias (`Myawaddy Township` on Dekkhina Thiri). HDX Yangon codes `MMR013046/MMR013047` differ from older GeoNames `MMR013045/MMR013008`.

Optional additional reviewed alternate spelling: source name `Tabayin`, Burmese `ဒီပဲယင်း`, PCode `MMR005010`; [Myanmar Department of Population's own census profile](https://www.dop.gov.mm/sites/dop.gov.mm/files/publication_docs/depayin_0.pdf) calls this Depayin Township. Store `Depayin` as a separately sourced search alias only, retaining canonical source name and code.

## Version/change workflow and limits

[MIMU's GIS resources](https://www.themimu.info/gis-resources) and [PCode page](https://www.themimu.info/place-codes) are indexed with PCode release 9.7, January 2026 and a change-history workbook; direct HTML and GeoNode WFS requests returned HTTP403 in this environment. Therefore the verified recommended payload is HDX COD-AB v01 with its stated 2024/2025 dates, **not** a claim to be the latest PCode9.7 release. Record URL/checksum/vintage, diff new downloads by typed PCode, review moved/renamed/retired codes and aliases, and retain migration history before updating saved locations.

Source center coordinates are administrative geometry centers, not weather stations, verified town centers, flood measurements or guaranteed in-polygon safe locations. Township selection must keep region-aggregated weather/reanalysis labeled as parent-region fallback unless independently validated township data exists. Do not promote regional rain/ENSO into township official alerts. A source layer is at approximately 1:250,000 scale ([MIMU GIS description](https://www.themimu.info/gis-resources)); avoid implying village/parcel precision.
