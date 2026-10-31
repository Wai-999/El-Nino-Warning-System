# V3 official health update source research

Verified 31 October 2026. Research only; no application or Git changes made.

## Recommended bounded implementation

Implement a **WHO Disease Outbreak News (DON) publication monitor**, separate from weather/ENSO warnings. It can provide real, dynamically refreshed official health bulletin metadata at zero API cost. It cannot establish complete Myanmar health-advisory coverage or current local disease status. Never call an unexpired-looking DON an active township warning: the source API provides no expiry, warning-severity taxonomy, or structured township applicability.

WHO's original overview explicitly says DON coverage is not exhaustive: https://www.who.int/emergencies/disease-outbreak-news . It describes selected confirmed/potential acute public-health events, rather than a complete national advisory service.

### Exact verified endpoints

1. Official API documentation (HTTP 200): https://www.who.int/api/news/diseaseoutbreaknews/sfhelp . Documents `GET /api/news/diseaseoutbreaknews`, original public fields, and related content. No authentication was required in actual calls.
2. Myanmar country taxonomy (HTTP 200): https://www.who.int/api/default/hierarchy-taxa(a0e5642e-870d-4764-ae64-c53e63267f4a) . Response identifies `Title: Myanmar`, `Name: mmr`, `FullUrl: /searo/myanmar`. Country ID: `a0e5642e-870d-4764-ae64-c53e63267f4a`.
3. Bounded, exact-country query (HTTP 200):

   https://www.who.int/api/news/diseaseoutbreaknews?sf_culture=en&%24filter=regionscountries%2Fany%28x%3Ax%20eq%20a0e5642e-870d-4764-ae64-c53e63267f4a%29&%24select=Id%2CTitle%2CPublicationDateAndTime%2Cregionscountries%2CItemDefaultUrl%2CLastModified&%24orderby=PublicationDateAndTime%20desc&%24top=10

   Returned **three** Myanmar-tagged records with original issue dates in **2019, 2015, and 2007**. A corresponding filter `and PublicationDateAndTime ge 2026-01-01T00:00:00Z` returned HTTP 200 with `value: []`.

4. Original newest Myanmar-specific DON (HTTP 200): https://www.who.int/emergencies/disease-outbreak-news/item/2019-DON183 . Page explicitly dates it **22 August 2019**.

### Important observed pitfalls

- **Do not filter geography by `contains(Title,'Myanmar')` alone.** That query also returns a Bangladesh bulletin mentioning displaced Myanmar nationals. Exact source country tags excluded it correctly. Require the Myanmar ID in every accepted row even when the server is asked to filter.
- **Use `PublicationDateAndTime` for the source issue date.** The 2019 record has `PublicationDate: 2022-07-28` and `LastModified: 2022-07-28`, reflecting later CMS activity. The original page and `PublicationDateAndTime` agree on 2019-08-22. Never rejuvenate an old medical notice with CMS or retrieval dates.
- API `ItemDefaultUrl` is a relative item slug (e.g. `/2019-DON183`). Resolve it beneath `https://www.who.int/emergencies/disease-outbreak-news/item/`, enforce the exact HTTPS host and safe single slug, and reject embedded/foreign URLs.
- No structured expiry, severity, observed-period precision, or local township coverage exists in the selected response. Preserve these as unknown. Do not infer them from title, weather, retrieval date, or country tagging.
- Original bulletin language is English (`sf_culture=en`); no Myanmar translation was verified. Keep the original title labeled English, with Burmese/English interface explanations. Do not invent translated clinical advice or claim expert Burmese review.

### Safe display and data contract

Suggested semantic fields: source ID `who-don`, source record ID, original title, source URL, `issuedAt` from `PublicationDateAndTime`, `sourceModifiedAt`, `retrievedAt`, country tag `MM`, `expiresAt: null`, `kind: official-health-bulletin`, `status: published` (or historical), and `coverage: limited`.

Poll in the existing bounded four-daily ingestion job; cache only validated metadata, with independent source health and dated last-good fallback. A successful empty recent response is a healthy fetch with limited coverage. UI wording must say that this source returned no recent Myanmar notices and that current local health-advisory status is unknown. It must never say no health risks/no active national advisories. A display recency cutoff (e.g. 30 days) is an application visibility policy, **not bulletin expiry**. Keep historical items behind an explicitly historical expander or link directly to WHO.

No documented public API numerical quota, delivery guarantee, or uptime SLA was found. A few cached requests per day is a conservative implementation choice, not an official quota. Use short timeouts, bounded retry/backoff, no client polling storm, independent failure retention, and clear last-check dates.

Critical tests: foreign country tag despite Myanmar title, CMS migration date vs source issue date, unknown expiry never active, future/malformed dates, duplicate IDs, unsafe URL slug, empty successful feed, failed refresh preserving original issue/retrieval dates, and no health data entering meteorological risk calculations.

## Licensing and scope

- WHO linking guidelines explicitly permit informational links to complete WHO pages, without WHO logo or implication of endorsement: https://www.who.int/about/policies/publishing/copyright/linking . Prefer bibliographic metadata plus direct original-page links. Do not copy full article summaries, case tables, images, clinical recommendations or logos into this app.
- WHO copyright policy: https://www.who.int/about/policies/publishing/copyright . WHO publications generally use CC BY-NC-SA 3.0 IGO where specified; this does **not** establish a blanket licence for every website/API field or third-party contribution. Translations/adaptations of licensed works need attribution, licence compatibility, and the stated WHO disclaimer. Avoid claiming the API itself is universally CC-licensed.
- Official Myanmar MOH homepage probes timed out/failed via the web tool. No reliable public, documented, machine-readable Myanmar MOH advisory feed was verified in this bounded research. This monitor therefore cannot claim full national coverage.
- Broader official contextual sources, for external links only: WHO Myanmar emergencies https://www.who.int/myanmar/emergencies and Myanmar Health Cluster https://healthcluster.who.int/countries-and-regions/myanmar . They contain useful bulletin/resource links, but no equally verified current machine-readable advisory contract was established here. The Health Cluster page itself states quarterly update reference; it is not an immediate alert feed.

## Downloaded verification evidence

Files under `/private/tmp/el-nino-v3-health/`:

- `who-country-tagged-don.json`: three original Myanmar-tagged metadata records.
- `who-country-tagged-recent-don.json`: successful 2026+ empty query.
- `who-myanmar-hierarchy-taxon.json`: official country-code label.
- `who-don-myanmar-geography.json`: demonstrates Bangladesh false-positive exclusion and source issue dates.
- `who-2019-DON183.html`: original source page, 22 August 2019.

Older raw exploratory files are research evidence only and must not be copied wholesale into public app data. Test fixtures should retain the minimal necessary source metadata.

## Additional bounded check: emergency contacts (V3 decision 35)

Checked 31 October 2026. These original official pages are accessible and give service-scope qualifications. They verify published contact information, not that calls connect or that a service can reach a user's location. No call was placed.

### Recommended ambulance contact with limited coverage

Official source: ICRC, _Frequently asked questions about the ICRC's work in Myanmar_, dated 30 June 2026:

https://www.icrc.org/en/article/FAQ-icrc-work-myanmar

Published contact: **MRCS Ambulance +95 9 669 958 858**. Normalized telephone URI: `tel:+959669958858`.

Its ambulance section says services operate **“in some locations”**. Expose the number only with a plain service-availability caveat and direct source link. Do not label it national guaranteed coverage, a 24/7 dispatch service, or location-matched assistance. This is an official humanitarian organization's directory entry for its national-society partner, not a station-verified availability feed. The same page links to MRCS for nearest-branch information.

The FAQ also gives ICRC's own general Myanmar contact **+95 977 666 2555**, with Monday–Friday 08:00–16:30 hours. That is a general humanitarian contact, not an ambulance substitute. It need not be added to a compact hazard-preparedness panel.

### MRCS emergency coordination contact

Original service provider:

https://www.redcross.org.mm/our-work/emergency-operations-center/

Published EOC hotline: **(+95) 9 940 078 898**. Telephone URI: `tel:+959940078898`.

Scope: official emergency coordination and EOC-related communication. The provider qualifies availability as **“24/7 during emergency activation.”** This is a coordination contact, **not a published ambulance dispatch number**; do not strip that service-purpose or activation qualification. Address is MRCS EOC at Strand Road, Botahtaung Township, Yangon. The page describes a national coordination network, which does not establish public response coverage in every township.

### National directory fallback

https://myanmar.gov.mm/ (Myanmar National Portal) and https://www.myanmar.gov.mm/en/web/guest/home list emergency contacts, including 192 against named Nay Pyi Taw hospitals plus Yangon/Mandalay entries. However, direct verification attempts timed out/returned a gateway error while search had cached text. Recommend a directory link only rather than elevating this to a newly verified nationwide ambulance-availability claim. The same caution applies to cached generic 191/192/199 lists. MRCS's first-aid/training page contains staff training contacts; those must not be repurposed as emergency hotlines.

Downloaded original pages are `mrcs-eoc.html` and `icrc-faq.html` in the research folder. Source publication/review dates should remain separate from this project's checked date.
