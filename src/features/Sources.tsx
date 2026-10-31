import { useEffect, useState } from "react";
import {
  Search,
  Download,
  ArrowUpRight,
  Database,
  LockKeyhole,
} from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import registry from "../data/indicators.json";
import {
  weatherFresh,
  historyFresh,
  ninoFresh,
  mmt,
} from "../data/operational";
import { roniFresh, probabilitiesFresh } from "../data/climate";
import { freshness } from "../risk/engine";
import { download } from "../data/presentation";
import { terminology } from "../data/terminology";
import OfficialHealth from "../components/OfficialHealth";
import { geography } from "../data/locations";
import aliasEvidence from "../data/township-aliases.json" with { type: "json" };
const bibliography = [
  [
    "NOAA CPC",
    "ENSO discussion / official assessment",
    "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
    "US government public information; attribution. Pacific assessment, not Myanmar warning.",
  ],
  [
    "NOAA CPC",
    "RONI method, ERSSTv6 and 1991–2020 baseline",
    "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/",
    "Three-month relative SST index. Provisional newest values; monthly updates by day 5.",
  ],
  [
    "NOAA CPC",
    "RONI raw history, 1950 onward",
    "https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt",
    "SEAS / YR / ANOM. Full source history retained. Retrieval time is not publication time.",
  ],
  [
    "NOAA CPC",
    "Official ENSO phase probability table",
    "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities/",
    "Nine overlapping seasons. Source gives issue month only; rounded 0% approximate.",
  ],
  [
    "NOAA / NWS",
    "Operational RONI transition, 1 February 2026",
    "https://www.weather.gov/media/notification/pdf_2026/pns26-05_Relative_ONI.pdf",
    "RONI and monthly relative Niño 3.4 are distinct products.",
  ],
  [
    "NOAA CPC",
    "Monthly Niño 3.4 anomalies",
    "https://www.cpc.ncep.noaa.gov/data/indices/sstoi.indices",
    "Published monthly anomalies, not RONI or ONI. Baseline not asserted by this app.",
  ],
  [
    "ECMWF / Open-Meteo",
    "IFS forecast API",
    "https://open-meteo.com/en/docs/ecmwf-api",
    "0.25°; three representative cells per Myanmar region. Current conditions are model estimates.",
  ],
  [
    "Copernicus / Open-Meteo",
    "ERA5 historical weather API",
    "https://open-meteo.com/en/docs/historical-weather-api",
    "0.25°; 1940 onward; around five-day source delay. App uses six-day lag and 1991–2020 baseline.",
  ],
  [
    "Open-Meteo",
    "Terms, attribution and noncommercial API",
    "https://open-meteo.com/en/terms",
    "CC BY 4.0 data; free API noncommercial. No uptime guarantee. Provider attribution required on exports.",
  ],
  [
    "Open-Meteo",
    "Pricing and API limits",
    "https://open-meteo.com/en/pricing",
    "Free tier: under 10,000 calls/day, 5,000/hour, 600/minute; 300,000/month. Large requests use weighted calls.",
  ],
  [
    "Open-Meteo",
    "EC46 / SEAS5 seasonal API (not integrated)",
    "https://open-meteo.com/en/docs/seasonal-forecast-api",
    "36 km, 51 members; not bias-corrected. Local calibrated outlook requires matching hindcast validation.",
  ],
  [
    "Myanmar DMH",
    "Official cyclone warnings",
    "https://www.moezala.gov.mm/en/cyclone-warning",
    "External issuing-authority page. No verified automated feed or redistribution license. Item dates matter, not site ticker dates.",
  ],
  [
    "Myanmar DMH",
    "Official flood bulletins",
    "https://www.moezala.gov.mm/en/flood-bulletin",
    "Original notices only. An absent bulletin is not a nationwide all-clear.",
  ],
  [
    "MIMU / OCHA / HDX",
    "Myanmar administrative boundaries",
    "https://data.humdata.org/dataset/cod-ab-mmr",
    "CC BY 3.0 IGO. Simplified 2024 boundaries, merged to 15 regions; no township measurement claim.",
  ],
  [
    "NOAA / NWS",
    "Heat-index equation and limitations",
    "https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml",
    "Shade and light wind. Derived from model temperature/humidity; no individual medical interpretation.",
  ],
  [
    "WHO",
    "Heat and health",
    "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
    "Static educational paraphrase; not weather-triggered medical advice or diagnosis.",
  ],
  [
    "WHO",
    "Heatwaves: how to stay cool",
    "https://www.who.int/news-room/questions-and-answers/item/heatwaves-how-to-stay-cool",
    "General prevention and support for people at risk. WHO terms; link and short paraphrase only.",
  ],
  [
    "WHO",
    "Floods: protecting your health",
    "https://www.who.int/news-room/questions-and-answers/item/how-do-i-protect-my-health-in-a-flood",
    "Safe water, food and standing-water precautions. Weather does not establish disease transmission.",
  ],
  [
    "NWS",
    "Flood safety",
    "https://www.weather.gov/safety/flood-during",
    "Avoid walking/driving through floodwater; follow local official instructions.",
  ],
  [
    "NWS",
    "Wind safety",
    "https://www.weather.gov/safety/wind-during",
    "Secure loose objects before winds and shelter away from trees/windows/power lines.",
  ],
  [
    "FAO GIEWS",
    "Myanmar country brief / crop context",
    "https://www.fao.org/giews/countrybrief/country.jsp?code=MMR",
    "National seasonal context; field moisture, crop stage and water adequacy not established.",
  ],
  [
    "FAO",
    "Crop water needs",
    "https://www.fao.org/4/S2022E/s2022e07.htm",
    "Needs vary by crop and growing conditions. General considerations, no precise sowing date or yield promise.",
  ],
  [
    "FAOLEX",
    "Myanmar agriculture context / pulses",
    "https://faolex.fao.org/docs/pdf/mya190978.pdf",
    "Documented crop groups; species-specific requirements still need local validation.",
  ],
  [
    "ASMC",
    "Regional seasonal outlook",
    "https://asmc.asean.org/asmc-seasonal-outlook/",
    "External Southeast Asia outlook; not assigned to individual townships.",
  ],
  [
    "Copernicus GDO",
    "Published drought products (not integrated)",
    "https://drought.emergency.copernicus.eu/",
    "Published SPI, moisture/vegetation context; not a national official early warning. Product terms apply.",
  ],
  [
    "Copernicus GDO",
    "Terms and limitations",
    "https://drought.emergency.copernicus.eu/terms&conditions",
    "External products require dataset/version/baseline validation before integration.",
  ],
  [
    "WMO",
    "Common Alerting Protocol",
    "https://wmo.int/site/wmo-common-alerting-protocol",
    "Warning semantics: issuer, event, geography, severity, certainty, validity and protective actions.",
  ],
];
const targetId = () =>
  new URLSearchParams(location.hash.split("?")[1] || "").get("indicator") || "";
export default function Sources() {
  const { t, lang, operational: op, climate, data, now } = useApp(),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [target, setTarget] = useState(targetId);
  useEffect(() => {
    const change = () => {
      setTarget(targetId());
      setQuery("");
      setFilter("all");
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (target) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`indicator-${target}`);
        element?.scrollIntoView({ block: "start" });
        element?.querySelector("summary")?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [target]);
  const items = registry.indicators.filter(
    (i) =>
      (filter === "all" ||
        (filter === "connected"
          ? i.status === "implemented"
          : i.status !== "implemented")) &&
      `${i.name.en} ${i.name.my} ${i.id} ${i.definition} ${i.primarySource} ${i.summaryMy}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  const health = [
    {
      name: "NOAA monthly Niño 3.4",
      ok: ninoFresh(op.nino, now),
      present: !!op.nino,
      sourceOk: op.health.nino34?.ok,
      date: op.nino?.months.at(-1)?.month,
      retrieved: op.nino?.fetchedAt,
    },
    {
      name: "ECMWF IFS",
      ok: weatherFresh(op.weather, now),
      present: !!op.weather,
      sourceOk: op.health.ecmwf?.ok,
      date: op.weather?.validAt,
      retrieved: op.weather?.fetchedAt,
    },
    {
      name: "ERA5",
      ok: historyFresh(op.history, now),
      present: !!op.history,
      sourceOk: op.health.era5?.ok,
      date: op.history?.end,
      retrieved: op.history?.fetchedAt,
    },
    {
      name: "NOAA ENSO",
      ok:
        !!data.enso &&
        freshness(data.enso.issuedAt, data.enso.validUntil, now) === "current",
      present: !!data.enso,
      sourceOk: data.ensoFetch === "ok",
      date: data.enso?.issuedAt,
      retrieved: data.enso?.source.retrievedAt,
    },
    {
      name: "NOAA RONI",
      ok: roniFresh(climate.roni, now),
      present: !!climate.roni,
      sourceOk: climate.health.roni?.ok,
      date: climate.roni
        ? `${climate.roni.points.at(-1)!.season} ${climate.roni.points.at(-1)!.year}`
        : undefined,
      retrieved: climate.roni?.retrievedAt,
    },
    {
      name: "NOAA probabilities",
      ok: probabilitiesFresh(climate.probabilities, now),
      present: !!climate.probabilities,
      sourceOk: climate.health.probabilities?.ok,
      date: climate.probabilities?.issueMonth,
      retrieved: climate.probabilities?.retrievedAt,
    },
  ];
  const kindLabels: Record<string, string> = {
    modelled: "မော်ဒယ်တန်ဖိုး",
    forecast: "ခန့်မှန်းချက်",
    reanalysis: "ပြန်လည်ဆန်းစစ်ဒေတာ",
    derived: "တွက်ချက်ညွှန်းကိန်း",
    "official assessment": "တရားဝင်သုံးသပ်ချက်",
    "official warning": "တရားဝင်သတိပေးချက်",
    "educational guidance": "ပညာပေးလမ်းညွှန်",
    reference: "ရည်ညွှန်း",
    unavailable: "မရရှိပါ",
  };
  return (
    <>
      <header className="page-title">
        <p className="eyebrow">
          {t("TRANSPARENCY, BY DESIGN", "ရင်းမြစ်ကို ရှင်းလင်းစွာ ဖော်ပြခြင်း")}
        </p>
        <h1>{t("Sources & methodology", "ရင်းမြစ်နှင့် နည်းလမ်း")}</h1>
        <p>
          {t(
            "Every indicator has a source, a definition and a limit. This is the single reference for the information in this app.",
            "ညွှန်းကိန်းတိုင်းတွင် ရင်းမြစ်၊ အဓိပ္ပာယ်နှင့် ကန့်သတ်ချက် ရှိသည်။ ဤစာမျက်နှာသည် အက်ပ်အချက်အလက်အားလုံး၏ စုစည်းရည်ညွှန်းဖြစ်သည်။",
          )}
        </p>
      </header>
      <section className="source-health surface padded">
        <h2>
          <Database size={22} />
          {t("Source status", "ဒေတာရင်းမြစ် အခြေအနေ")}
        </h2>
        <p className="small muted">
          {t(
            "Data validity and last retrieval are separate. A successful page refresh does not make old observations current.",
            "ဒေတာသက်တမ်းနှင့် နောက်ဆုံးရယူချိန်သည် သီးခြားဖြစ်သည်။ စာမျက်နှာပြန်ဖွင့်ခြင်းက ဒေတာဟောင်းကို အသစ်မဖြစ်စေပါ။",
          )}
        </p>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label={t("Source status table", "ရင်းမြစ်အခြေအနေ ဇယား")}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Source", "ရင်းမြစ်")}</th>
                <th>{t("Data state", "ဒေတာအခြေအနေ")}</th>
                <th>
                  {t("Source period / issue", "ရင်းမြစ်ကာလ / ထုတ်ပြန်ရက်")}
                </th>
                <th>{t("Last retrieval", "နောက်ဆုံးရယူချိန်")}</th>
                <th>{t("Last check", "နောက်ဆုံး စစ်ဆေးမှု")}</th>
              </tr>
            </thead>
            <tbody>
              {health.map((s) => (
                <tr key={s.name}>
                  <th scope="row">{s.name}</th>
                  <td>
                    <span
                      className={`status-pill ${s.ok ? "modelled" : "delayed"}`}
                    >
                      {s.ok
                        ? t("Within policy", "သက်တမ်းအတွင်း")
                        : s.present
                          ? t("Delayed / expired", "နောက်ကျ / သက်တမ်းကုန်")
                          : t("Unavailable", "မရရှိပါ")}
                    </span>
                  </td>
                  <td>
                    {s.date?.includes("T")
                      ? s.name === "NOAA ENSO"
                        ? dateLabel(s.date, lang)
                        : mmt(s.date, lang)
                      : s.date || "—"}
                  </td>
                  <td>{s.retrieved ? mmt(s.retrieved, lang) : "—"}</td>
                  <td>
                    {s.sourceOk === undefined
                      ? "—"
                      : s.sourceOk
                        ? t("Succeeded", "အောင်မြင်")
                        : t(
                            "Failed; retained dates",
                            "မအောင်မြင်၊ ရက်စွဲထိန်းထား",
                          )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small">
          {t(
            "Myanmar official warning feed: unconnected. No provider is silently substituted or averaged with an incompatible dataset.",
            "မြန်မာတရားဝင် သတိပေးဒေတာ မချိတ်ဆက်ရသေးပါ။ မကိုက်ညီသောဒေတာကို တိတ်တဆိတ် အစားထိုး သို့မဟုတ် ပျမ်းမျှမတွက်ပါ။",
          )}
        </p>
      </section>
      <section className="surface padded terminology">
        <h2>{t("Plain-language glossary", "လွယ်ကူသော ဝေါဟာရအဓိပ္ပာယ်များ")}</h2>
        <p>
          {t(
            "Editorial terminology for consistent explanations. Critical warning translations require qualified Burmese and subject-matter review; automated tests do not provide that approval.",
            "ရှင်းပြချက် တစ်သမတ်တည်းဖြစ်ရန် ရေးသားထားသော ဝေါဟာရများဖြစ်သည်။ အရေးကြီးသတိပေးဘာသာပြန်ကို ကျွမ်းကျင်မြန်မာဘာသာနှင့် ဘာသာရပ်ပညာရှင် စစ်ဆေးရန် လိုသည်။ အလိုအလျောက်စမ်းသပ်မှုက ထိုအတည်ပြုချက် မပေးပါ။",
          )}
        </p>
        <dl>
          {terminology
            .filter(
              (row) =>
                !query ||
                row
                  .join(" ")
                  .toLocaleLowerCase()
                  .includes(query.toLocaleLowerCase()),
            )
            .map(([en, my, definition, definitionMy]) => (
              <div key={en}>
                <dt>{t(en, my)}</dt>
                <dd>{t(definition, definitionMy)}</dd>
              </div>
            ))}
        </dl>
      </section>
      <details className="disclosure">
        <summary>
          {t(
            "Township geography: version, aliases and corrections",
            "မြို့နယ်နယ်နိမိတ်၊ ဗားရှင်း၊ အမည်ကွဲနှင့် ပြင်ဆင်မှု",
          )}
        </summary>
        <div>
          <p>
            {t(
              "MIMU-derived OCHA/HDX COD-AB: 330 townships, 80 districts, 18 source admin1 units mapped to 15 app regions. Source validity, review and resource-upload dates are distinct. This is a pinned version, not a claim to current boundaries.",
              "MIMU အခြေခံ OCHA/HDX COD-AB မှ မြို့နယ် 330၊ ခရိုင် 80၊ ရင်းမြစ် ပြည်နယ်/တိုင်းခွဲ 18 ကို အက်ပ်ဒေသ 15 ခုနှင့် ချိတ်ထားသည်။ နယ်နိမိတ်အကျုံးဝင်ရက်၊ စစ်ဆေးရက်နှင့် ဖိုင်မွမ်းမံရက် မတူပါ။ သတ်မှတ်ဗားရှင်းဖြစ်ပြီး လက်ရှိနယ်နိမိတ်ဟု မဆိုလိုပါ။",
            )}
          </p>
          <p>
            {geography.validOn} / {geography.reviewedOn} /{" "}
            {geography.resourceUpdatedAt} ·{" "}
            <a href={geography.source} target="_blank" rel="noreferrer">
              MIMU / OCHA / HDX
            </a>{" "}
            ·{" "}
            <a
              href="https://creativecommons.org/licenses/by/3.0/igo/"
              target="_blank"
              rel="noreferrer"
            >
              {geography.license}
            </a>
          </p>
          <p>
            {t(
              "Changes require original-source evidence and review of renamed, moved and retired typed PCodes. No user submission changes live warnings automatically. Partial village records are excluded from search.",
              "ပြောင်းလဲမှုတွင် မူရင်းအထောက်အထားနှင့် အဆင့်ပါ PCode ၏ အမည်၊ ပြောင်းရွှေ့၊ ပယ်ဖျက်မှု စစ်ဆေးရန် လိုသည်။ အသုံးပြုသူတင်ပြချက်မှ တိုက်ရိုက်သတိပေးချက် မပြောင်းပါ။ မပြည့်စုံသော ကျေးရွာစာရင်းကို ရှာဖွေမှုမှ ဖယ်ထားသည်။",
            )}
          </p>
          <ul>
            {aliasEvidence.map((a) => (
              <li key={`${a.pcode}:${a.alias}`}>
                {a.alias} → {a.sourceName} · {a.pcode} ·{" "}
                <a href={a.sourceUrl} target="_blank" rel="noreferrer">
                  GeoNames
                </a>{" "}
                · CC BY 4.0
              </li>
            ))}
          </ul>
          <a
            href="https://github.com/Wai-999/El-Nino-Warning-System/blob/main/docs/GEOGRAPHY_MAINTENANCE.md"
            target="_blank"
            rel="noreferrer"
          >
            {t("Reviewed correction workflow", "စစ်ဆေးပြင်ဆင်ရေး လုပ်ငန်းစဉ်")}
          </a>
        </div>
      </details>
      <OfficialHealth />
      <section className="registry-section">
        <div className="section-heading">
          <h2>{t("Indicator registry", "ညွှန်းကိန်း စာရင်း")}</h2>
          <button onClick={() => download("indicator-registry.json", registry)}>
            <Download size={15} />
            {t("Export registry", "စာရင်း ထုတ်ယူရန်")}
          </button>
        </div>
        <div className="registry-controls">
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">
              {t(
                "Search indicators and sources",
                "ညွှန်းကိန်းနှင့် ရင်းမြစ် ရှာရန်",
              )}
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                "Search indicators, providers, methods…",
                "ညွှန်းကိန်း၊ ရင်းမြစ်၊ နည်းလမ်း ရှာပါ…",
              )}
            />
          </label>
          <label>
            <span className="sr-only">
              {t("Filter registry", "စာရင်း စစ်ထုတ်ရန်")}
            </span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">
                {t("All capabilities", "စွမ်းဆောင်ရည် အားလုံး")}
              </option>
              <option value="connected">
                {t("Implemented", "အကောင်အထည်ဖော်ပြီး")}
              </option>
              <option value="unavailable">
                {t("Unavailable / unconnected", "မရရှိ / မချိတ်ဆက်ရသေး")}
              </option>
            </select>
          </label>
        </div>
        <p className="small muted" aria-live="polite">
          {items.length} {t("matching entries", "ခု ကိုက်ညီ")}
        </p>
        <div className="indicator-list">
          {items.map((i) => (
            <details
              key={i.id}
              id={`indicator-${i.id}`}
              className="indicator-entry"
              open={target === i.id || undefined}
            >
              <summary>
                <span>
                  <strong>{i.name[lang]}</strong>
                  <small>
                    {i.primarySource} · {i.unit}
                  </small>
                </span>
                <span
                  className={`status-pill ${i.status === "implemented" ? "modelled" : "delayed"}`}
                >
                  {i.status === "implemented"
                    ? t("Implemented", "အကောင်အထည်ဖော်ပြီး")
                    : t("Unavailable / unconnected", "မရရှိ / မချိတ်ဆက်ရသေး")}
                </span>
              </summary>
              <div className="indicator-body">
                <p>{lang === "my" ? i.summaryMy : i.definition}</p>
                <span className="status-pill">
                  {lang === "my" ? kindLabels[i.kind] : i.kind}
                </span>
                <dl className="facts">
                  <div>
                    <dt>{t("Question answered", "ဖြေရှင်းပေးသော မေးခွန်း")}</dt>
                    <dd lang="en">{i.question}</dd>
                  </div>
                  <div>
                    <dt>
                      {t(
                        "Technical method (English)",
                        "နည်းပညာနည်းလမ်း (အင်္ဂလိပ်)",
                      )}
                    </dt>
                    <dd lang="en">{i.definition}</dd>
                  </div>
                  {[
                    [t("Spatial precision", "နေရာတိကျမှု"), i.spatial],
                    [t("Time resolution", "အချိန်တိကျမှု"), i.temporal],
                    [
                      t("Refresh / freshness", "ရယူနှုန်း / သက်တမ်း"),
                      `${i.refresh}; ${i.freshnessTTL}`,
                    ],
                    [
                      t("Baseline", "အခြေခံကာလ"),
                      i.historicalBaseline ||
                        t(
                          "Not applicable / not asserted",
                          "မသက်ဆိုင် / မသတ်မှတ်",
                        ),
                    ],
                    [t("Licensing", "အသုံးပြုခွင့်"), i.license],
                    [t("Uncertainty", "မသေချာမှု"), i.uncertainty],
                    [t("QA checks", "အရည်အသွေးစစ်ဆေးမှု"), i.qa.join("; ")],
                    [
                      t("Warning use", "သတိပေးအသုံးပြုမှု"),
                      i.warningApplicability,
                    ],
                    [
                      t("Backup / fallback", "အရန် / မရရှိလျှင်"),
                      `${t("No silent alternate provider", "တိတ်တဆိတ် အစားထိုးရင်းမြစ် မရှိ")}; ${i.fallback}`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <a href={i.sourceUrl} target="_blank" rel="noreferrer">
                  {t(
                    "Original source / API documentation",
                    "မူရင်းရင်းမြစ် / API စာတမ်း",
                  )}
                  <ArrowUpRight size={14} />
                </a>
                <a className="copy-link" href={`#/sources?indicator=${i.id}`}>
                  {t("Link to this entry", "ဤအချက်သို့ လင့်ခ်")}
                </a>
              </div>
            </details>
          ))}
        </div>
        {items.length === 0 && (
          <p role="status">
            {t(
              "No entries match. Try a provider or a shorter term.",
              "ကိုက်ညီသည့်အချက် မရှိပါ။ ရင်းမြစ်အမည် သို့မဟုတ် စာလုံးတိုဖြင့် စမ်းပါ။",
            )}
          </p>
        )}
      </section>
      <details className="disclosure">
        <summary>
          {t(
            "Full bibliography & provider terms",
            "ရင်းမြစ်စာရင်းအပြည့်နှင့် အသုံးပြုခွင့်",
          )}
        </summary>
        <div>
          <p>
            {t(
              "References checked 31 October 2026. Brief paraphrases and links are used; provider branding and graphics are not copied. Technical notes below are retained in English.",
              "ရည်ညွှန်းများကို ၂၀၂၆ အောက်တိုဘာ ၃၁ တွင် စစ်ဆေးထားသည်။ အကျဉ်းပြန်ဆိုချက်နှင့် လင့်ခ်များကိုသာ သုံးထားသည်။ ရင်းမြစ်အမှတ်တံဆိပ်နှင့် ရုပ်ပုံ မကူးယူပါ။ အောက်ပါနည်းပညာမှတ်စုများကို အင်္ဂလိပ်ဖြင့် ထားရှိသည်။",
            )}
          </p>
          <ol className="bibliography">
            {bibliography.map(([org, title, url, note]) => (
              <li key={url}>
                <strong>{org}</strong>
                <a href={url} target="_blank" rel="noreferrer" lang="en">
                  {title}
                  <ArrowUpRight size={13} />
                </a>
                <p lang="en">{note}</p>
              </li>
            ))}
          </ol>
        </div>
      </details>
      <section className="privacy-section surface padded">
        <h2>
          <LockKeyhole size={21} />
          {t(
            "Privacy, offline & reliability",
            "ကိုယ်ရေးအချက်အလက်၊ အော့ဖ်လိုင်းနှင့် ယုံကြည်ရမှု",
          )}
        </h2>
        <p>
          {t(
            "Language, area, map layer, checklists and in-site warning filters stay in browser storage. No analytics, account or subscriber contact database is used. Optional geolocation runs only after your action and browser permission; coordinates are not sent to a server.",
            "ဘာသာစကား၊ ဒေသ၊ မြေပုံအလွှာ၊ ပြင်ဆင်ရေးစာရင်းနှင့် စစ်ထုတ်မှုကို ဘရောက်ဇာတွင်သာ သိမ်းသည်။ အသုံးပြုမှုခြေရာခံခြင်း၊ အကောင့်နှင့် စာရင်းသွင်းဆက်သွယ်ဒေတာ မရှိပါ။ သင်နှိပ်ပြီး ဘရောက်ဇာခွင့်ပြုမှ တည်နေရာရှာသည်။ တည်နေရာကို ဆာဗာသို့ မပို့ပါ။",
          )}
        </p>
        <p>
          {t(
            "After a connected first visit, the PWA stores its shell and dated snapshots. Offline warnings expire against the device clock. Storage may be evicted; this app cannot guarantee immediate warning delivery or source availability.",
            "ပထမအကြိမ် အင်တာနက်ဖြင့် ဖွင့်ပြီးနောက် အက်ပ်နှင့် ရက်စွဲပါဒေတာကို သိမ်းသည်။ အော့ဖ်လိုင်းတွင်လည်း စက်နာရီအရ သတိပေးသက်တမ်း ကုန်သည်။ သိမ်းဒေတာ ပျောက်နိုင်ပြီး ချက်ချင်းသတိပေးပေးပို့မှု သို့မဟုတ် ရင်းမြစ်ရရှိမှု မအာမခံနိုင်ပါ။",
          )}
        </p>
        <p>
          {t(
            "Data ingestion is scheduled four times daily, with ERA5 checked daily and cached baselines reused. Scheduled jobs may be delayed. There is no high-frequency Vercel Hobby cron.",
            "ဒေတာရယူမှုကို တစ်နေ့လေးကြိမ် စီစဉ်ထားပြီး ERA5 ကို နေ့စဉ်စစ်၍ အခြေခံကာလဒေတာ ပြန်သုံးသည်။ အချိန်ဇယားအလုပ် နောက်ကျနိုင်သည်။ Vercel Hobby တွင် မကြာခဏ cron မသုံးပါ။",
          )}
        </p>
      </section>
    </>
  );
}
