import { lazy, Suspense, useState } from "react";
import { Download, ArrowUpRight, Globe2 } from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import { freshness } from "../risk/engine";
import { roniFresh, probabilitiesFresh } from "../data/climate";
import { number, download } from "../data/presentation";
import { ninoFresh } from "../data/operational";
import {
  Source,
  Unavailable,
  Stale,
  SectionHeading,
} from "../components/Service";
const RoniHistory = lazy(() => import("../components/RoniHistory"));
export default function Climate() {
  const { t, lang, data, climate, now, operational: op, lowData } = useApp(),
    [season, setSeason] = useState(0),
    [history, setHistory] = useState(false);
  const b = data.enso,
    r = climate.roni?.points.at(-1),
    p = climate.probabilities,
    row = p?.rows[season];
  const status = b && freshness(b.issuedAt, b.validUntil, now) === "current";
  const labels: Record<string, string> = {
    "El Niño Advisory": "အယ်လ်နီညို အသိပေးချက်",
    "La Niña Advisory": "လာနီညာ အသိပေးချက်",
    "El Niño Watch": "အယ်လ်နီညို စောင့်ကြည့်ချက်",
    "La Niña Watch": "လာနီညာ စောင့်ကြည့်ချက်",
    "Not Active": "ENSO အသိပေးချက် မရှိ",
  };
  return (
    <>
      <header className="page-title">
        <p className="eyebrow">
          {t("THE SEASONAL PICTURE", "ရာသီအလိုက် အခြေအနေ")}
        </p>
        <h1>{t("Climate & ENSO", "ရာသီဥတုနှင့် ENSO")}</h1>
        <p>
          {t(
            "A changing Pacific, a wider context. Explore what we know—and where uncertainty remains.",
            "ပြောင်းလဲနေသော ပစိဖိတ်အခြေအနေကို နောက်ခံအဖြစ် နားလည်ပါ။ သိရှိထားသောအချက်နှင့် မသေချာမှုများကို လေ့လာပါ။",
          )}
        </p>
      </header>
      <div className="climate-overview">
        <section className="surface padded assessment">
          <div className="row spread">
            <p className="eyebrow">
              {t("OFFICIAL ENSO ASSESSMENT", "တရားဝင် ENSO သုံးသပ်ချက်")}
            </p>
            <Globe2 size={25} />
          </div>
          <h2>
            {b
              ? lang === "en"
                ? b.status
                : labels[b.status]
              : t("Assessment unavailable", "သုံးသပ်ချက် မရရှိပါ")}
          </h2>
          {b ? (
            <>
              <p className={`status-pill ${status ? "modelled" : "delayed"}`}>
                {status
                  ? t("Within bulletin validity", "ကြေညာချက် သက်တမ်းအတွင်း")
                  : t("Expired assessment", "သက်တမ်းကုန် သုံးသပ်ချက်")}
              </p>
              <p>
                NOAA CPC · {t("Issued", "ထုတ်ပြန်ရက်")}{" "}
                {dateLabel(b.issuedAt, lang)}
                <br />
                {t("Next discussion", "နောက်ကြေညာချက်")}{" "}
                {dateLabel(b.validUntil.slice(0, 10) + "T12:00:00+06:30", lang)}
              </p>
              <p className="small">
                {t(
                  "The original source specifies a date, not a precise issue clock time. This is a Pacific assessment, not a Myanmar hazard warning.",
                  "မူရင်းရင်းမြစ်တွင် ရက်စွဲသာ ဖော်ပြပြီး တိကျသော နာရီမဖော်ပြပါ။ ပစိဖိတ် သုံးသပ်ချက်ဖြစ်ပြီး မြန်မာဘေးအန္တရာယ် သတိပေးချက် မဟုတ်ပါ။",
                )}
              </p>
            </>
          ) : (
            <Unavailable>
              {t(
                "No verified bulletin is loaded.",
                "အတည်ပြုကြေညာချက် မရရှိပါ။",
              )}
            </Unavailable>
          )}
          <Source id="enso-status" />
        </section>
        <section className="roni-card">
          <p className="eyebrow">
            {t(
              "RELATIVE OCEANIC NIÑO INDEX",
              "နှိုင်းရ သမုဒ္ဒရာ အယ်လ်နီညိုညွှန်းကိန်း",
            )}
          </p>
          <div className="roni-number">
            {r
              ? `${r.anomaly > 0 ? "+" : ""}${number(r.anomaly, lang, 2)}`
              : "—"}
            <small>°C</small>
          </div>
          <p>
            {r
              ? `${r.season} ${r.year} · ${roniFresh(climate.roni, now) ? t("Provisional", "ပြင်ဆင်နိုင်သေး") : t("Delayed series", "နောက်ကျဒေတာ")}`
              : t("RONI unavailable", "RONI မရရှိပါ")}
          </p>
          <p>
            {t(
              "A three-month relative Pacific temperature index. NOAA removes tropical-mean warming and adjusts variance; RONI is different from ONI and monthly Niño 3.4.",
              "ပစိဖိတ်၏ သုံးလပျမ်းမျှ နှိုင်းရအပူချိန်ညွှန်းကိန်းဖြစ်သည်။ NOAA က အပူပိုင်းပျမ်းမျှပူနွေးမှုကို နုတ်ပြီး ကွဲပြားမှုပမာဏ ချိန်ညှိသည်။ RONI သည် ONI နှင့် လစဉ် Niño 3.4 တို့နှင့် ကွာခြားသည်။",
            )}
          </p>
          <Source id="roni" />
        </section>
      </div>
      <section className="outlook-section">
        <SectionHeading
          title={t(
            "What could the coming seasons bring?",
            "လာမည့်ရာသီများတွင် ဘာဖြစ်နိုင်သလဲ။",
          )}
        />
        <p className="section-description">
          {t(
            "Official NOAA phase probabilities for overlapping three-month seasons. These describe the Pacific, not the chance of rain in Myanmar.",
            "ထပ်နေသော သုံးလကာလများအတွက် NOAA ၏ အဆင့်ဖြစ်နိုင်ခြေများဖြစ်သည်။ ပစိဖိတ်အခြေအနေအတွက်ဖြစ်ပြီး မြန်မာနိုင်ငံ မိုးရွာနိုင်ခြေ မဟုတ်ပါ။",
          )}
        </p>
        {p && row ? (
          <div className="surface padded">
            <div className="row spread">
              <span className="small">
                {t("Issue month", "ထုတ်ပြန်လ")} {p.issueMonth} ·{" "}
                {t("NOAA CPC consensus", "NOAA CPC သဘောတူမျှော်မှန်းချက်")}
              </span>
              {!probabilitiesFresh(p, now) && <Stale />}
            </div>
            <label className="season-control">
              {t("Forecast season", "ခန့်မှန်းကာလ")}
              <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
              >
                {p.rows.map((r, i) => (
                  <option key={r.season} value={i}>
                    {r.season}
                  </option>
                ))}
              </select>
            </label>
            <div className="probability-bars">
              {[
                ["La Niña", "လာနီညာ", row.laNina, "cool"],
                ["Neutral", "ကြားနေ", row.neutral, "neutral"],
                ["El Niño", "အယ်လ်နီညို", row.elNino, "warm"],
              ].map(([en, my, value, style]) => (
                <div key={String(en)}>
                  <div className="row spread">
                    <strong>{t(String(en), String(my))}</strong>
                    <span>{number(Number(value), lang, 0)}%</span>
                  </div>
                  <progress
                    className={`probability-progress ${style}`}
                    max={100}
                    value={Number(value)}
                    aria-label={`${en} ${row.season}`}
                  />
                </div>
              ))}
            </div>
            <p className="small">
              {t(
                "Rounded probabilities; a reported 0% is approximate. Adjacent seasons overlap, so the rows are not independent trials.",
                "ပတ်လည်ထားသော ဖြစ်နိုင်ခြေဖြစ်ပြီး ၀% ဟု ဖော်ပြခြင်းသည် အနီးစပ်ဆုံးဖြစ်သည်။ အနီးကပ်ကာလများ ထပ်နေသဖြင့် သီးခြားလွတ်လပ်သော ဖြစ်ရပ်များ မဟုတ်ပါ။",
              )}
            </p>
            <details className="inner-details">
              <summary>
                {t(
                  "View all nine seasons as a table",
                  "ကာလ ၉ ခုလုံး ဇယားဖြင့် ကြည့်ရန်",
                )}
              </summary>
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label={t("ENSO probabilities", "ENSO ဖြစ်နိုင်ခြေများ")}
              >
                <table className="data-table">
                  <caption>
                    {t(
                      "NOAA phase probabilities (%)",
                      "NOAA အဆင့်ဖြစ်နိုင်ခြေ (%)",
                    )}{" "}
                    · {p.issueMonth}
                  </caption>
                  <thead>
                    <tr>
                      <th>{t("Season", "ကာလ")}</th>
                      <th>La Niña</th>
                      <th>{t("Neutral", "ကြားနေ")}</th>
                      <th>El Niño</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.rows.map((r) => (
                      <tr key={r.season}>
                        <th scope="row">{r.season}</th>
                        <td>{number(r.laNina, lang, 0)}</td>
                        <td>{number(r.neutral, lang, 0)}</td>
                        <td>{number(r.elNino, lang, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
            <Source id="enso-probabilities" />
          </div>
        ) : (
          <Unavailable>
            {t(
              "Official phase probability data is unavailable. No probabilities are inferred from the ENSO advisory or event-strength statement.",
              "တရားဝင် အဆင့်ဖြစ်နိုင်ခြေဒေတာ မရရှိပါ။ ENSO အသိပေးချက် သို့မဟုတ် ဖြစ်ရပ်ပြင်းထန်မှုမှ ဖြစ်နိုင်ခြေကို မခန့်မှန်းပါ။",
            )}
          </Unavailable>
        )}
      </section>
      <section className="climate-context">
        <h2>
          {t(
            "What does this mean for Myanmar?",
            "မြန်မာနိုင်ငံအတွက် ဘာဆိုလိုသလဲ။",
          )}
        </h2>
        <p>
          {t(
            "ENSO can shift seasonal odds across the region. Monsoon circulation, the Indian Ocean, storms and terrain also matter. An El Niño does not determine how much rain will fall in your township, and a stronger index does not mean proportionally greater local harm.",
            "ENSO သည် ဒေသတွင်း ရာသီအလိုက် ဖြစ်နိုင်ခြေများကို ပြောင်းလဲစေနိုင်သည်။ မုတ်သုံ၊ အိန္ဒိယသမုဒ္ဒရာ၊ မုန်တိုင်းနှင့် မြေမျက်နှာသွင်ပြင်တို့လည်း အရေးပါသည်။ အယ်လ်နီညိုက သင့်မြို့နယ် မိုးရေပမာဏကို မသတ်မှတ်နိုင်သကဲ့သို့ ညွှန်းကိန်းမြင့်ခြင်းက ဒေသထိခိုက်မှု အချိုးကျမြင့်မည်ဟု မဆိုလိုပါ။",
          )}
        </p>
        <a href="#/learn">
          {t(
            "Explore a simple ENSO simulation",
            "ရိုးရှင်းသော ENSO စမ်းသပ်မှု လေ့လာရန်",
          )}{" "}
          →
        </a>
      </section>
      <details
        className="disclosure"
        onToggle={(e) => {
          if (e.currentTarget.open) setHistory(true);
        }}
      >
        <summary>
          {t(
            "Explore 30 years of RONI history",
            "နှစ် ၃၀ RONI သမိုင်း လေ့လာရန်",
          )}
        </summary>
        <div>
          {history && (
            <Suspense
              fallback={
                <p>{t("Loading history…", "သမိုင်းဒေတာ ဖွင့်နေသည်…")}</p>
              }
            >
              <RoniHistory textOnly={lowData} />
            </Suspense>
          )}
        </div>
      </details>
      <details className="disclosure">
        <summary>
          {t(
            "Drought, seasonal outlooks & advanced indicators",
            "မိုးခေါင်မှု၊ ရာသီမျှော်မှန်းချက်နှင့် အသေးစိတ်ညွှန်းကိန်းများ",
          )}
        </summary>
        <div>
          <h3>
            {t(
              "Official event-strength statement",
              "တရားဝင် ဖြစ်ရပ်ပြင်းထန်မှု ဖော်ပြချက်",
            )}
          </h3>
          <p className="strength-statement">
            {b?.outlook ? (
              <>
                {b.outlook.greaterThan ? ">" : ""}
                {number(b.outlook.percent, lang, 0)}% ·{" "}
                {b.outlook.eventStrength === "strong-to-very-strong"
                  ? t(
                      "Strong to very strong El Niño",
                      "အားကောင်းမှ အလွန်အားကောင်းအဆင့်ရှိ အယ်လ်နီညို",
                    )
                  : b.outlook.eventStrength === "very-strong"
                    ? t("Very strong El Niño", "အလွန်အားကောင်းသော အယ်လ်နီညို")
                    : t(
                        "Source event-strength statement",
                        "မူရင်း ဖြစ်ရပ်ပြင်းထန်မှု ဖော်ပြချက်",
                      )}{" "}
                ·{" "}
                {b.outlook.periodRelation === "through"
                  ? t("Through", "ကာလအထိ")
                  : t("During", "ကာလအတွင်း")}{" "}
                {b.outlook.period}
              </>
            ) : (
              t(
                "Seasonal strength outlook unavailable",
                "ရာသီအလိုက် ပြင်းထန်မှုမျှော်မှန်းချက် မရရှိပါ",
              )
            )}
          </p>
          <p className="small">
            {t(
              "Probability of Pacific event strength, not a phase probability or Myanmar weather probability. The original assessment's date and expiry apply.",
              "ပစိဖိတ် ဖြစ်ရပ်ပြင်းထန်မှု ဖြစ်နိုင်ခြေဖြစ်ပြီး အဆင့်ဖြစ်နိုင်ခြေ သို့မဟုတ် မြန်မာမိုးလေဝသ ဖြစ်နိုင်ခြေ မဟုတ်ပါ။ မူရင်းသုံးသပ်ချက် ရက်စွဲနှင့် သက်တမ်းကို အသုံးပြုသည်။",
            )}
          </p>
          <Source id="enso-strength" />
          <h3>{t("Drought information", "မိုးခေါင်မှု အချက်အလက်")}</h3>
          <Unavailable>
            {t(
              "SPI-1/3/6, SPEI, soil moisture, evapotranspiration and vegetation stress are not integrated. A rainfall deficit alone is not a drought classification.",
              "SPI-1/3/6၊ SPEI၊ မြေဆီလွှာအစိုဓာတ်၊ ရေငွေ့ပျံမှုနှင့် အပင်ဖိအားဒေတာ မချိတ်ဆက်ရသေးပါ။ မိုးရေလိုငွေတစ်ခုတည်းက မိုးခေါင်မှုအဆင့် မဟုတ်ပါ။",
            )}
          </Unavailable>
          <p>
            <a
              href="https://drought.emergency.copernicus.eu/"
              target="_blank"
              rel="noreferrer"
            >
              Copernicus Global Drought Observatory <ArrowUpRight size={14} />
            </a>{" "}
            ·{" "}
            {t(
              "External context; not a Myanmar official warning",
              "ပြင်ပနောက်ခံအချက်အလက်၊ မြန်မာ တရားဝင်သတိပေးချက် မဟုတ်ပါ",
            )}
          </p>
          <p>
            <a
              href="https://asmc.asean.org/asmc-seasonal-outlook/"
              target="_blank"
              rel="noreferrer"
            >
              ASEAN seasonal outlook <ArrowUpRight size={14} />
            </a>
          </p>
          <h3>{t("Other ENSO indices", "အခြား ENSO ညွှန်းကိန်းများ")}</h3>
          <p>
            {op.nino
              ? `${op.nino.months.at(-1)!.month} · Niño 3.4 ${number(op.nino.months.at(-1)!.anomaly, lang)}°C. `
              : ""}
            {op.nino && !ninoFresh(op.nino, now) && (
              <strong>
                {t("Delayed monthly index. ", "နောက်ကျနေသော လစဉ်ညွှန်းကိန်း။ ")}
              </strong>
            )}
            {t(
              "Monthly Niño 3.4 is separate from RONI. ONI, SOI, MEI, trade-wind and subsurface indicators have no validated adapter here.",
              "လစဉ် Niño 3.4 သည် RONI နှင့် ကွာသည်။ ONI၊ SOI၊ MEI၊ ကုန်သွယ်လေနှင့် ရေအောက်ညွှန်းကိန်းများအတွက် အတည်ပြုချိတ်ဆက်မှု မရှိပါ။",
            )}
          </p>
          <Source id="nino34" />
          <Source id="advanced-enso" />
        </div>
      </details>
      <button
        className="export-button"
        disabled={!climate.roni && !p}
        onClick={() =>
          download("noaa-climate-with-provenance.json", {
            exportedAt: new Date().toISOString(),
            unit: { roni: "°C", probabilities: "%" },
            license: "US government public information; NOAA attribution",
            limitation: "Tropical Pacific; not a Myanmar local forecast",
            snapshot: climate,
          })
        }
      >
        <Download size={16} />
        {t(
          "Export NOAA data with provenance",
          "NOAA ဒေတာကို ရင်းမြစ်နှင့် ထုတ်ယူရန်",
        )}
      </button>
    </>
  );
}
