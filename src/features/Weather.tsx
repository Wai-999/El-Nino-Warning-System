import { lazy, Suspense, useState } from "react";
import { Download, ArrowUpRight } from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import { regionName } from "../data/regions";
import { weatherFresh, historyFresh, mmt } from "../data/operational";
import { number, download, csv } from "../data/presentation";
import { heatIndex, rainfallAccumulation } from "../climate/calculations";
import {
  WeatherSummary,
  Source,
  Stale,
  Unavailable,
  SectionHeading,
} from "../components/Service";
const HourlyForecast = lazy(() => import("../components/HourlyForecast"));
export default function Weather() {
  const { t, lang, selected, operational: op, now } = useApp();
  const [range, setRange] = useState("daily");
  const w = op.weather?.regions.find((r) => r.id === selected),
    h = op.history?.regions.find((r) => r.id === selected);
  function exportCsv() {
    if (!w || !op.weather) return;
    download(
      "weather-with-provenance.csv",
      csv([
        [
          "region_id",
          "date_MMT",
          "min_C",
          "max_C",
          "rain_mm",
          "gust_km_h",
          "model",
          "valid_at",
          "retrieved_at",
          "source",
          "license",
          "precision",
        ],
        ...w.days.map((d) => [
          selected,
          d.date,
          d.min,
          d.max,
          d.rain,
          d.gust,
          op.weather!.model,
          op.weather!.validAt,
          op.weather!.fetchedAt,
          "https://open-meteo.com/en/docs/ecmwf-api",
          "CC BY 4.0; noncommercial API",
          "Three representative 0.25 degree cells, not township observations",
        ]),
      ]),
      "text/csv",
    );
  }
  return (
    <>
      <header className="page-title">
        <p className="eyebrow">
          {t("YOUR AREA, IN DETAIL", "သင့်ဒေသ အခြေအနေ အသေးစိတ်")}
        </p>
        <h1>{t("Weather", "မိုးလေဝသ")}</h1>
        <p>
          {regionName(selected, lang)} ·{" "}
          {t(
            "Regional model samples, with their original dates.",
            "ဒေသ မော်ဒယ်နမူနာများကို မူရင်းရက်စွဲနှင့် ဖော်ပြထားသည်။",
          )}
        </p>
      </header>
      <div className="weather-page-grid">
        <WeatherSummary compact />
        <div className="weather-explainer">
          <h2>{t("A forecast, with context", "ခန့်မှန်းချက်ကို နားလည်ရန်")}</h2>
          <p>
            {t(
              "These are ECMWF model estimates across three representative cells in your region. Conditions at your home or farm may differ.",
              "ဤဒေတာသည် သင့်ဒေသအတွင်း နမူနာနေရာသုံးခု၏ ECMWF မော်ဒယ်ခန့်မှန်းချက်ဖြစ်သည်။ သင့်အိမ် သို့မဟုတ် လယ်ကွင်းတွင် ကွာခြားနိုင်ပါသည်။",
            )}
          </p>
          <p>
            {t(
              "Rainfall amount is not the chance of rain, and it does not establish flood risk.",
              "မိုးရေပမာဏသည် မိုးရွာနိုင်ခြေ မဟုတ်သကဲ့သို့ ရေကြီးအန္တရာယ်ကိုလည်း မသတ်မှတ်ပေးနိုင်ပါ။",
            )}
          </p>
          <Source id="rain-forecast" />
          {op.weather && (
            <dl className="facts">
              <div>
                <dt>{t("Model hour", "မော်ဒယ်နာရီ")}</dt>
                <dd>{mmt(op.weather.validAt, lang)}</dd>
              </div>
              <div>
                <dt>{t("Retrieved", "ရယူချိန်")}</dt>
                <dd>{mmt(op.weather.fetchedAt, lang)}</dd>
              </div>
              <div>
                <dt>{t("Freshness", "ဒေတာသက်တမ်း")}</dt>
                <dd>
                  {weatherFresh(op.weather, now)
                    ? t("Within 18-hour policy", "၁၈ နာရီ သက်တမ်းအတွင်း")
                    : t(
                        "Delayed; not current weather",
                        "နောက်ကျဒေတာ၊ လက်ရှိမိုးလေဝသ မဟုတ်",
                      )}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
      <div className="section-heading forecast-heading">
        <h2>{t("Explore the forecast", "ခန့်မှန်းချက် ကြည့်ရန်")}</h2>
        <button onClick={exportCsv} disabled={!w}>
          <Download size={15} />
          {t("Export CSV", "CSV ထုတ်ယူရန်")}
        </button>
      </div>
      <div
        className="range-tabs"
        role="group"
        aria-label={t("Weather time range", "မိုးလေဝသ ကာလရွေးရန်")}
      >
        {[
          ["hourly", "Hourly", "နာရီအလိုက်"],
          ["daily", "Daily", "နေ့စဉ်"],
          ["weekly", "7-day summary", "၇ ရက် အကျဉ်းချုပ်"],
          ["history", "Past 30 days", "ပြီးခဲ့သည့် ရက် ၃၀"],
          ["outlook", "Longer outlook", "ရှေ့လာမည့်ရာသီ"],
        ].map(([id, en, my]) => (
          <button
            key={id}
            aria-pressed={range === id}
            onClick={() => setRange(id)}
          >
            {t(en, my)}
          </button>
        ))}
      </div>
      {range === "hourly" && (
        <Suspense
          fallback={
            <p role="status">
              {t("Loading hourly view…", "နာရီအလိုက်မြင်ကွင်း ဖွင့်နေသည်…")}
            </p>
          }
        >
          <HourlyForecast />
        </Suspense>
      )}
      {range === "daily" &&
        (w ? (
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label={t(
              "Seven-day forecast table",
              "၇ ရက် ခန့်မှန်းချက် ဇယား",
            )}
          >
            <table className="data-table forecast-table">
              <caption>
                {t(
                  "Seven daily model forecasts · Myanmar calendar days",
                  "နေ့စဉ် မော်ဒယ်ခန့်မှန်းချက် ၇ ရက် · မြန်မာပြက္ခဒိန်ရက်",
                )}
              </caption>
              <thead>
                <tr>
                  <th>{t("Day", "ရက်")}</th>
                  <th>{t("High / low", "အမြင့် / အနိမ့်")}</th>
                  <th>{t("Rainfall", "မိုးရေ")}</th>
                  <th>
                    {t("Peak heat index", "အမြင့်ဆုံး အပူဒဏ်ညွှန်းကိန်း")}
                  </th>
                  <th>{t("Gust", "လေပြင်း")}</th>
                </tr>
              </thead>
              <tbody>
                {w.days.map((d) => (
                  <tr key={d.date}>
                    <th scope="row">
                      {dateLabel(d.date + "T12:00:00+06:30", lang)}
                    </th>
                    <td>
                      <strong>{number(d.max, lang)}°</strong> /{" "}
                      {number(d.min, lang)}°C
                    </td>
                    <td>{number(d.rain, lang)} mm</td>
                    <td>{number(d.heat, lang)}°C</td>
                    <td>{number(d.gust, lang)} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Source id="rain-forecast" />
          </div>
        ) : (
          <Unavailable>
            {t("Daily forecast unavailable.", "နေ့စဉ် ခန့်မှန်းချက် မရရှိပါ။")}
          </Unavailable>
        ))}
      {range === "weekly" &&
        (w ? (
          <section className="surface padded">
            <h2>
              {t(
                "Seven-day forecast summary",
                "၇ ရက် ခန့်မှန်းချက် အကျဉ်းချုပ်",
              )}
            </h2>
            <p>
              {w.days[0].date} → {w.days.at(-1)!.date}
            </p>
            <div className="metric-grid">
              <div>
                <span>
                  {t("Total forecast rain", "စုစုပေါင်း ခန့်မှန်းမိုးရေ")}
                </span>
                <strong>
                  {number(
                    w.days.reduce((s, d) => s + d.rain, 0),
                    lang,
                  )}{" "}
                  mm
                </strong>
              </div>
              <div>
                <span>
                  {t("Highest daily maximum", "အမြင့်ဆုံးနေ့ အပူချိန်")}
                </span>
                <strong>
                  {number(Math.max(...w.days.map((d) => d.max)), lang)}°C
                </strong>
              </div>
              <div>
                <span>{t("Lowest daily minimum", "အနိမ့်ဆုံးည အပူချိန်")}</span>
                <strong>
                  {number(Math.min(...w.days.map((d) => d.min)), lang)}°C
                </strong>
              </div>
            </div>
            <p>
              {t(
                "Simple sums and extrema of the dated seven-day model forecast. Forecast confidence is not supplied.",
                "ရက်စွဲပါ ၇ ရက် မော်ဒယ်ခန့်မှန်းချက်၏ ပေါင်းလဒ်နှင့် အမြင့်ဆုံး/အနိမ့်ဆုံးဖြစ်သည်။ ယုံကြည်စိတ်ချရမှု မဖော်ပြထားပါ။",
              )}
            </p>
            <Source id="rain-forecast" />
          </section>
        ) : (
          <Unavailable>
            {t("Weekly summary unavailable.", "အပတ်စဉ် အကျဉ်းချုပ် မရရှိပါ။")}
          </Unavailable>
        ))}
      {range === "history" && (
        <section className="surface padded">
          <h2>
            {t(
              "Compared with the usual season",
              "ပုံမှန်ရာသီနှင့် နှိုင်းယှဉ်ရန်",
            )}
          </h2>
          {h && op.history ? (
            <>
              <p>
                {op.history.start} → {op.history.end} · ERA5 ·{" "}
                {t("Baseline", "အခြေခံကာလ")} 1991–2020
              </p>
              {!historyFresh(op.history, now) && (
                <Stale stamp={op.history.fetchedAt} />
              )}
              <div className="metric-grid">
                <div>
                  <span>
                    {t("30-day mean temperature", "ရက် ၃၀ ပျမ်းမျှအပူချိန်")}
                  </span>
                  <strong>{number(h.temperature, lang)}°C</strong>
                  <small>
                    {t("Normal", "ပုံမှန်")} {number(h.temperatureNormal, lang)}
                    °C · Δ {number(h.temperatureAnomaly, lang)}°C
                  </small>
                  <Source id="temperature-anomaly" />
                </div>
                <div>
                  <span>{t("30-day rain", "ရက် ၃၀ မိုးရေ")}</span>
                  <strong>{number(h.rain30, lang)} mm</strong>
                  <small>
                    {t("Normal", "ပုံမှန်")} {number(h.rainNormal30, lang)} mm ·
                    Δ {number(h.rainDifference, lang)} mm (
                    {number(h.rainPercent, lang)}%)
                  </small>
                  <Source id="rain-anomaly" />
                </div>
                <div>
                  <span>
                    {t(
                      "3 / 7-day rain and dry spell",
                      "3 / 7 ရက် မိုးရေနှင့် မိုးမရွာရက်ဆက်",
                    )}
                  </span>
                  <strong>
                    {number(rainfallAccumulation(h.rainDaily, 3), lang)} /{" "}
                    {number(h.rain7, lang)} mm
                  </strong>
                  <small>
                    {number(h.dryDays, lang, 0)}{" "}
                    {t("consecutive days below 1 mm", "ရက်ဆက် ၁ မီလီမီတာအောက်")}
                  </small>
                  <div className="row">
                    <Source id="rain-history" />
                    <Source id="dry-days" />
                  </div>
                </div>
              </div>
              <p className="small">
                {t(
                  "A positive temperature anomaly means warmer than the matched baseline. A rainfall deficit is not a standardized drought index.",
                  "အပူချိန်ကွာဟချက် အပေါင်းဖြစ်လျှင် သက်ဆိုင်ရာအခြေခံကာလထက် ပိုပူသည်။ မိုးရေလိုငွေသည် စံပြုမိုးခေါင်ညွှန်းကိန်း မဟုတ်ပါ။",
                )}
              </p>
            </>
          ) : (
            <Unavailable>
              {t(
                "Historical comparison unavailable. No reference values are invented.",
                "သမိုင်းနှိုင်းယှဉ်ဒေတာ မရရှိပါ။ ရည်ညွှန်းတန်ဖိုး မတီထွင်ပါ။",
              )}
            </Unavailable>
          )}
        </section>
      )}
      {range === "outlook" && (
        <section className="surface padded">
          <h2>
            {t(
              "Weeks and seasons are different from daily forecasts",
              "ပတ်နှင့် ရာသီအလိုက် မျှော်မှန်းချက်သည် နေ့စဉ်ခန့်မှန်းချက်နှင့် ကွာသည်",
            )}
          </h2>
          <Unavailable>
            {t(
              "Local 2–4-week and 1–3-month calibrated outlooks are not integrated. A matching hindcast baseline and Myanmar validation are needed. ENSO probabilities describe Pacific conditions, not local rainfall.",
              "ဒေသအတွက် ၂–၄ ပတ်နှင့် ၁–၃ လ ချိန်ညှိမျှော်မှန်းချက် မချိတ်ဆက်ရသေးပါ။ သင့်လျော်သော သမိုင်းခန့်မှန်းအခြေခံကာလနှင့် မြန်မာဒေသအတည်ပြုမှု လိုသည်။ ENSO ဖြစ်နိုင်ခြေသည် ပစိဖိတ်အခြေအနေအတွက်ဖြစ်ပြီး ဒေသမိုးရေ မဟုတ်ပါ။",
            )}
          </Unavailable>
          <a
            href="https://asmc.asean.org/asmc-seasonal-outlook/"
            target="_blank"
            rel="noreferrer"
          >
            {t("ASEAN seasonal outlook", "အာဆီယံ ရာသီအလိုက် မျှော်မှန်းချက်")}{" "}
            <ArrowUpRight size={15} />
          </a>
          <Source id="long-outlook" />
        </section>
      )}
      <details className="disclosure">
        <summary>
          {t(
            "Advanced measurements & data gaps",
            "အသေးစိတ်တိုင်းတာချက်နှင့် ဒေတာကွာဟချက်များ",
          )}
        </summary>
        <div>
          <SectionHeading
            title={t(
              "Heat index estimate",
              "အပူဒဏ်ညွှန်းကိန်း ခန့်မှန်းတန်ဖိုး",
            )}
          />
          <p>
            {w
              ? `${number(heatIndex(w.now.temperature, w.now.humidity), lang)}°C · `
              : ""}
            {t(
              "Derived from model temperature and humidity for shade and light wind. Sun, activity and individual health can change heat stress. This is not an official warning.",
              "အရိပ်နှင့် လေအေးအေးအတွက် မော်ဒယ်အပူချိန်၊ စိုထိုင်းဆမှ တွက်ထားသည်။ နေရောင်၊ လှုပ်ရှားမှုနှင့် ကျန်းမာရေးက အပူဒဏ်ကို ပြောင်းလဲစေနိုင်သည်။ တရားဝင်သတိပေးချက် မဟုတ်ပါ။",
            )}
          </p>
          <Source id="heat-index" />
          <Unavailable>
            {t(
              "Calibrated heatwave duration, soil-moisture anomalies, rainfall percentiles and monthly/seasonal anomalies remain unavailable. View supported point measurements in the Hourly tab.",
              "ချိန်ညှိအပူလှိုင်းကြာချိန်၊ မြေဆီလွှာအစိုဓာတ်ကွာဟချက်၊ မိုးရေ ရာခိုင်နှုန်းအဆင့်နှင့် လ/ရာသီကွာဟချက်များ မရရှိသေးပါ။ ပံ့ပိုးထားသော နမူနာနေရာဒေတာကို နာရီအလိုက်ကဏ္ဍတွင် ကြည့်ပါ။",
            )}
          </Unavailable>
          <a href="#/sources?indicator=hourly-forecast">
            {t(
              "See each limitation and its reason",
              "ကန့်သတ်ချက်နှင့် အကြောင်းရင်းများ ကြည့်ရန်",
            )}
          </a>
        </div>
      </details>
    </>
  );
}
