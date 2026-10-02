import { useState } from "react";
import { useApp } from "../app/context";
import { PageTitle, Notice, AlertCard } from "../components/shared";
import {
  Concern,
  StateLabel,
  OfficialStatus,
  RegionFilter,
  DataQuality,
} from "../components/Intelligence";
import { regionalRows, sortRows, type RegionRow } from "../risk/intelligence";
import {
  coverageCurrent,
  warningHistory,
  activeAlerts,
  rank,
} from "../risk/engine";
import { regionName } from "../data/regions";
import { hazardNames } from "../risk/signals";
import { mmt } from "../data/operational";
const hazards = ["heat", "rain", "dryness", "wind", "agriculture"] as const;
export default function Warnings() {
  const { t, lang, operational: op, data, now, archive } = useApp();
  const [area, setArea] = useState("all"),
    [concern, setConcern] = useState("all"),
    [hazard, setHazard] = useState("all"),
    [fresh, setFresh] = useState("all"),
    [sort, setSort] = useState("concern"),
    [onlyOfficial, setOnlyOfficial] = useState(false),
    [mode, setMode] = useState("system");
  const rows = sortRows(
    regionalRows(op, data, now).filter(
      (r) =>
        (area === "all" || r.id === area) &&
        (concern === "all" || r.level === concern) &&
        (fresh === "all" || r.state === fresh) &&
        (!onlyOfficial || !!r.official.length) &&
        (hazard === "all" ||
          r.signals.some(
            (s) =>
              s.hazard === hazard && s.level !== "unknown" && rank[s.level] > 0,
          )),
    ),
    sort,
  );
  const allOfficial =
    mode === "history"
      ? warningHistory(
          {
            ...data,
            history: [
              ...data.history,
              ...archive.bulletins.filter(
                (a) => Date.parse(a.validUntil) <= now,
              ),
            ],
          },
          now,
        )
      : activeAlerts(data, now);
  const official = allOfficial.filter(
    (a) =>
      (area === "all" || a.regionId === area) &&
      (concern === "all" || a.severity === concern),
  );
  const header = [
    t("State / Region", "ပြည်နယ် / တိုင်း"),
    t("Overall screening", "စုစုပေါင်း စစ်ဆေးမှု"),
    ...hazards.map((h) => t(...hazardNames[h])),
    t("Official alert", "တရားဝင် သတိပေးချက်"),
    t("Data freshness", "ဒေတာသက်တမ်း"),
  ];
  const details = (r: RegionRow) => (
    <>
      <StateLabel state={r.state} />
      <small>
        {r.evidenceCount}/4 {t("independent inputs", "သီးခြားဒေတာ")}
      </small>
      <small>
        {r.updatedAt
          ? mmt(r.updatedAt, lang)
          : t("No update available", "မွမ်းမံချိန် မရရှိ")}
      </small>
    </>
  );
  return (
    <>
      <PageTitle
        eyebrow={t("MYANMAR · EARLY WARNING", "မြန်မာ · ကြိုတင်သတိပေး")}
        title={t("Warnings & updates", "သတိပေးချက်နှင့် နောက်ဆုံးသတင်း")}
        description={t(
          "Every state and region, with official advisories and independent platform screening clearly separated.",
          "ပြည်နယ်နှင့် တိုင်းအားလုံးအတွက် တရားဝင်သတိပေးချက်နှင့် လွတ်လပ်သော စနစ်စစ်ဆေးမှုကို သီးခြားပြသသည်။",
        )}
      />
      <Notice>
        {t(
          "Independent preparedness information. Official Myanmar advisories take precedence. An unavailable official feed is not an all-clear.",
          "လွတ်လပ်သော ပြင်ဆင်ရေးအချက်အလက်ဖြစ်သည်။ မြန်မာတရားဝင်သတိပေးချက်ကို ဦးစားပေးပါ။ တရားဝင်ဒေတာ မရရှိခြင်းသည် ဘေးကင်းဟု မဆိုလိုပါ။",
        )}{" "}
        <a href="https://www.dmh.gov.mm/">Myanmar DMH</a>
      </Notice>
      <div className="warning-filters filter-row">
        <RegionFilter value={area} onChange={setArea} all />
        <label>
          {t("Severity", "အဆင့်")}
          <select
            aria-label={t("Severity", "အဆင့်")}
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
          >
            <option value="all">{t("All levels", "အဆင့်အားလုံး")}</option>
            {(
              [
                "normal",
                "advisory",
                "watch",
                "warning",
                "severe",
                "unknown",
              ] as const
            ).map((s, i) => (
              <option key={s} value={s}>
                {t(
                  [
                    "Low platform risk",
                    "Attention",
                    "Elevated",
                    "High",
                    "Very high",
                    "Insufficient data",
                  ][i],
                  [
                    "စနစ်အန္တရာယ် နိမ့်",
                    "သတိပြုရန်",
                    "မြင့်တက်",
                    "မြင့်",
                    "အလွန်မြင့်",
                    "ဒေတာ မလုံလောက်",
                  ][i],
                )}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Elevated hazard", "မြင့်တက်သော အန္တရာယ်")}
          <select
            aria-label={t("Elevated hazard", "မြင့်တက်သော အန္တရာယ်")}
            disabled={mode !== "system"}
            value={hazard}
            onChange={(e) => setHazard(e.target.value)}
          >
            <option value="all">{t("All hazards", "အန္တရာယ်အားလုံး")}</option>
            {hazards.map((h) => (
              <option value={h} key={h}>
                {t(...hazardNames[h])}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Freshness", "သက်တမ်း")}
          <select
            aria-label={t("Freshness", "သက်တမ်း")}
            disabled={mode !== "system"}
            value={fresh}
            onChange={(e) => setFresh(e.target.value)}
          >
            <option value="all">
              {t("All freshness states", "သက်တမ်းအားလုံး")}
            </option>
            {["current", "aging", "stale", "unavailable"].map((s, i) => (
              <option value={s} key={s}>
                {t(
                  ["Current", "Aging", "Stale", "Unavailable"][i],
                  ["လက်ရှိ", "သက်တမ်းဟောင်းလာ", "သက်တမ်းကျော်", "မရရှိ"][i],
                )}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Sort by", "အစီအစဉ်")}
          <select
            aria-label={t("Sort by", "အစီအစဉ်")}
            disabled={mode !== "system"}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="concern">
              {t("Highest concern", "အဆင့်အမြင့်ဆုံး")}
            </option>
            <option value="newest">
              {t("Newest official warning", "နောက်ဆုံးတရားဝင်သတိပေးချက်")}
            </option>
            <option value="az">
              {t("A–Z (English name)", "A–Z (အင်္ဂလိပ်အမည်)")}
            </option>
          </select>
        </label>
        <label className="checkbox-filter">
          <input
            type="checkbox"
            disabled={mode !== "system"}
            checked={onlyOfficial}
            onChange={(e) => setOnlyOfficial(e.target.checked)}
          />
          {t("Official warnings only", "တရားဝင်သတိပေးချက်သာ")}
        </label>
      </div>
      <div className="segmented">
        {[
          ["system", "System risk signals", "စနစ်အန္တရာယ်ညွှန်းကိန်း"],
          ["official", "Official warnings", "တရားဝင်သတိပေးချက်"],
          ["history", "History", "မှတ်တမ်း"],
        ].map(([key, en, my]) => (
          <button
            key={key}
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
          >
            {t(en, my)}
          </button>
        ))}
      </div>
      {mode === "system" ? (
        <>
          <div className="row spread">
            <h2>
              {t("State / Region matrix", "ပြည်နယ် / တိုင်း အခြေအနေဇယား")}
            </h2>
            <p role="status">
              {rows.length}/15 {t("regions shown", "ဒေသ ပြထားသည်")}
            </p>
          </div>
          <p className="meta">
            {t(
              "PLATFORM RISK SIGNALS · Heat/rain/wind: next 24 h forecast. Deficit: completed 30-day reanalysis. Agriculture: climate screening only. Health guidance and missing drought/flood data are in each detail and coverage panel.",
              "စနစ်အန္တရာယ်ညွှန်းကိန်း · အပူ/မိုး/လေ — လာမည့် ၂၄ နာရီခန့်မှန်းချက်။ မိုးရေလျော့နည်းမှု — ပြီးဆုံးရက် ၃၀ ပြန်လည်ဆန်းစစ်။ စိုက်ပျိုးရေး — ရာသီဥတုစစ်ဆေးမှုသာ။ ကျန်းမာရေးလမ်းညွှန်နှင့် မရရှိသော မိုးခေါင်/ရေကြီးဒေတာကို အသေးစိတ်နှင့် လွှမ်းခြုံမှုတွင် ကြည့်ပါ။",
            )}
          </p>
          <div className="warning-desktop panel table-scroll">
            <table className="warning-matrix">
              <caption className="sr-only">
                {t(
                  "All Myanmar regions and platform screening",
                  "မြန်မာဒေသအားလုံး၏ စနစ်စစ်ဆေးမှု",
                )}
              </caption>
              <thead>
                <tr>
                  {header.map((h) => (
                    <th scope="col" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} data-region={r.id}>
                    <th scope="row">
                      <a href={`#/region/${r.id}`}>{regionName(r.id, lang)}</a>
                    </th>
                    <td>
                      {r.official.length > 0 && (
                        <strong className="official-status">
                          {t("Official warning", "တရားဝင်သတိပေးချက်")}
                        </strong>
                      )}
                      <Concern level={r.level} />
                      {r.partial && (
                        <small>{t("Partial evidence", "ဒေတာ မပြည့်စုံ")}</small>
                      )}
                    </td>
                    {hazards.map((h) => (
                      <td key={h}>
                        <Concern
                          level={
                            r.signals.find((s) => s.hazard === h)?.level ??
                            "unknown"
                          }
                        />
                      </td>
                    ))}
                    <td>
                      <OfficialStatus count={r.official.length} />
                    </td>
                    <td>{details(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="warning-mobile">
            {rows.map((r) => (
              <article className="panel padded" key={r.id} data-region={r.id}>
                <h3>
                  <a href={`#/region/${r.id}`}>{regionName(r.id, lang)}</a>
                </h3>
                <Concern level={r.level} />
                {r.partial && <p>{t("Partial evidence", "ဒေတာ မပြည့်စုံ")}</p>}
                <dl className="coverage-list">
                  {hazards.map((h) => (
                    <div key={h}>
                      <dt>{t(...hazardNames[h])}</dt>
                      <dd>
                        <Concern
                          level={
                            r.signals.find((s) => s.hazard === h)?.level ??
                            "unknown"
                          }
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
                <p>
                  <OfficialStatus count={r.official.length} />
                </p>
                <div className="meta">{details(r)}</div>
                <a className="button" href={`#/region/${r.id}`}>
                  {t("View evidence & actions", "အထောက်အထားနှင့် လုပ်ဆောင်ရန်")}
                </a>
              </article>
            ))}
          </div>
          {!rows.length && (
            <Notice>
              {t(
                "No regions match these filters. Reset filters to see all 15 regions, including missing data.",
                "ဤစစ်ထုတ်မှုနှင့် ကိုက်ညီသောဒေသ မရှိပါ။ ဒေတာမရှိသောဒေသအပါအဝင် ၁၅ ခုလုံးကြည့်ရန် စစ်ထုတ်မှု ပြန်ရွေးပါ။",
              )}
            </Notice>
          )}
          <details className="panel padded">
            <summary>
              {t(
                "How overall screening is ordered",
                "စုစုပေါင်းစစ်ဆေးမှု အစီအစဉ်",
              )}
            </summary>
            <p>
              {t(
                "Official bulletins first, then the highest independent heat/rain/deficit/wind level, then canonical region ID for ties. Missing inputs remain unknown; low requires all four inputs. Flood, drought and disease are not assessed by this score. Forecasts are representative samples, not township forecasts.",
                "တရားဝင်ကြေညာချက် ဦးစွာ၊ ထို့နောက် အပူ/မိုး/မိုးလျော့/လေ အမြင့်ဆုံးအဆင့်၊ တူပါက ဒေသကုဒ်အစီအစဉ်။ ဒေတာမရှိမှုကို မသိဟုထားပြီး နိမ့်ဟုဆိုရန် ဒေတာ လေးမျိုးလုံးလိုသည်။ ရေကြီး၊ မိုးခေါင်၊ ရောဂါကို ဤအဆင့်ဖြင့် မသတ်မှတ်ပါ။ နမူနာခန့်မှန်းချက်ဖြစ်၍ မြို့နယ်ခန့်မှန်းချက် မဟုတ်ပါ။",
              )}
            </p>
            <a href="#/data">
              {t("Methods & source periods", "နည်းလမ်းနှင့် ရင်းမြစ်ကာလ")}
            </a>
          </details>
          <DataQuality />
        </>
      ) : official.length ? (
        official.map((a) => (
          <div key={a.id}>
            {mode === "history" && (
              <p className="eyebrow">
                {t(
                  "HISTORICAL EVIDENCE — not an active warning",
                  "သမိုင်းအထောက်အထား — လက်ရှိသတိပေးချက် မဟုတ်ပါ",
                )}
              </p>
            )}
            <AlertCard alert={a} />
          </div>
        ))
      ) : (
        <section className="panel padded">
          <h2>
            {mode === "history"
              ? t("No archived bulletins", "ကြေညာချက်မှတ်တမ်း မရှိသေး")
              : coverageCurrent(data, now)
                ? t(
                    "No active official warning found",
                    "သက်တမ်းရှိ တရားဝင်သတိပေးချက် မတွေ့",
                  )
                : t(
                    "Regional warning status is unavailable",
                    "ဒေသသတိပေးအခြေအနေ မရရှိနိုင်သေး",
                  )}
          </h2>
          <a href="#/records">
            {t(
              "Historical records & snapshots",
              "သမိုင်းမှတ်တမ်းနှင့် သိမ်းဒေတာ",
            )}
          </a>
        </section>
      )}
    </>
  );
}
