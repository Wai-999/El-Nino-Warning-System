import { useApp } from "../app/context";
import { Level, Notice, SourceLink } from "./shared";
import { mmt, weatherFresh, historyFresh } from "../data/operational";
import {
  signalsFor,
  leadingSignal,
  hazardNames,
  actions,
  type Signal,
} from "../risk/signals";
import { regionName } from "../data/regions";
export const value = (
  n: number | undefined | null,
  unit = "",
  signed = false,
) =>
  n === undefined || n === null
    ? "—"
    : `${signed && n > 0 ? "+" : ""}${n.toFixed(unit === "%" || unit === " km/h" ? 0 : 1)}${unit}`;
export function Evidence({
  kind = "all",
}: {
  kind?: "all" | "weather" | "history";
}) {
  const { t, lang, operational: op, now, operationalCached } = useApp();
  return (
    <details className="provenance">
      <summary>
        {t("Source & methodology", "ရင်းမြစ်နှင့် တွက်ချက်နည်း")}
      </summary>
      {kind !== "history" && op.weather && (
        <p>
          <SourceLink href="https://open-meteo.com/en/docs/ecmwf-api">
            ECMWF IFS / Open-Meteo
          </SourceLink>{" "}
          · {t("Forecast • 0.25° (~25 km)", "ခန့်မှန်းချက် • 0.25° (~25 km)")}
          <br />
          {t("Valid modeled hour", "ခန့်မှန်းချက် သက်ဆိုင်ချိန်")}:{" "}
          {mmt(op.weather.validAt, lang)}
          <br />
          {t("Retrieved", "ရယူချိန်")}: {mmt(op.weather.fetchedAt, lang)} ·{" "}
          {operationalCached
            ? t("Cached", "သိမ်းထားသောဒေတာ")
            : weatherFresh(op.weather, now)
              ? t("Current forecast snapshot", "သက်တမ်းရှိ ခန့်မှန်းဒေတာ")
              : t("Stale", "သက်တမ်းကျော်")}
          <br />
          {t(
            "Model run time is not provided by this interface.",
            "ဤဝန်ဆောင်မှုတွင် မော်ဒယ်တွက်ချက်စတင်ချိန် မပါရှိပါ။",
          )}
        </p>
      )}
      {kind !== "weather" && op.history && (
        <p>
          <SourceLink href="https://open-meteo.com/en/docs/historical-weather-api">
            Copernicus / ECMWF ERA5 / Open-Meteo
          </SourceLink>{" "}
          ·{" "}
          {t(
            "Historical reanalysis • 0.25° (~25 km)",
            "သမိုင်းဒေတာ ပြန်လည်ဆန်းစစ်ချက် • 0.25° (~25 km)",
          )}
          <br />
          {op.history.start} → {op.history.end} ·{" "}
          {t("MMT calendar days", "မြန်မာစံတော်ချိန် ပြက္ခဒိန်ရက်များ")}
          <br />
          {t("Baseline", "ရည်ညွှန်းကာလ")}: 1991–2020 ·{" "}
          {t("Retrieved", "ရယူချိန်")}: {mmt(op.history.fetchedAt, lang)} ·{" "}
          {historyFresh(op.history, now)
            ? t(
                "Within expected 6-day publication lag",
                "ပုံမှန် ထုတ်ပြန်နောက်ကျမှု ၆ ရက်ခန့်အတွင်း",
              )
            : t("Stale", "သက်တမ်းကျော်")}
          <br />
          {t(
            "Same ERA5 grid cells and equivalent calendar dates. Percentage hidden when expected rainfall is below 10 mm.",
            "တူညီသော ERA5 ကွက်များနှင့် ပြက္ခဒိန်ရက်များကို နှိုင်းယှဉ်သည်။ ပုံမှန်မိုးရေ 10 mm အောက်တွင် ရာခိုင်နှုန်း မပြပါ။",
          )}
        </p>
      )}
      <p>
        {t(
          "Three spatial sample cells per region, weighted by represented area. Regional values are estimates; local conditions can differ. Hazard screens use the highest sampled forecast value. Forecast skill/confidence has not been calibrated for Myanmar.",
          "ဒေသတစ်ခုလျှင် နေရာကွဲ နမူနာကွက် ၃ ခုကို ကိုယ်စားပြုဧရိယာအလိုက် တွက်ချက်ထားသည်။ ဒေသတွင်း အခြေအနေကွဲနိုင်သည်။ အန္တရာယ်စစ်ဆေးရာတွင် နမူနာအမြင့်ဆုံးတန်ဖိုး သုံးသည်။ မြန်မာနိုင်ငံအတွက် ခန့်မှန်းတိကျမှုနှင့် ယုံကြည်နိုင်နှုန်းကို သီးခြားအတည်မပြုရသေးပါ။",
        )}
      </p>
      <a href="#/data">
        {t("Read thresholds and limitations", "သတ်မှတ်ချက်နှင့် အကန့်အသတ်များ")}
      </a>
    </details>
  );
}
export function SignalCard({
  signal,
  region,
  compact = false,
}: {
  signal: Signal;
  region?: string;
  compact?: boolean;
}) {
  const { t, lang, operational: op } = useApp();
  return (
    <article className="signal-card">
      <div className="row spread">
        <span className="eyebrow">
          {t("SYSTEM RISK SIGNAL", "စနစ်တွက်ချက် အန္တရာယ်ညွှန်းကိန်း")}
        </span>
        <Level level={signal.level} />
      </div>
      <h3>
        {region && (
          <>
            <a href={`#/region/${region}`}>{regionName(region, lang)}</a> ·{" "}
          </>
        )}
        {t(...hazardNames[signal.hazard])}
      </h3>
      <p>{t(...signal.evidence)}</p>
      <p className="signal-action">{t(...actions[signal.hazard])}</p>
      {!compact && (
        <details>
          <summary>
            {t("Why this level?", "ဤအဆင့်ကို ဘာကြောင့် သတ်မှတ်သလဲ။")}
          </summary>
          <p>
            {signal.historical
              ? t(
                  "Based on delayed reanalysis or combined planning evidence; not an immediate official warning.",
                  "နောက်ကျရရှိသော ပြန်လည်ဆန်းစစ်ဒေတာ သို့မဟုတ် ပေါင်းစပ်အထောက်အထားဖြစ်ပြီး ချက်ချင်းထုတ်ပြန်သော တရားဝင်သတိပေးချက် မဟုတ်ပါ။",
                )
              : t(
                  "Based on the next 24 forecast hours at three sampled locations.",
                  "နမူနာနေရာ ၃ ခု၏ လာမည့် ၂၄ နာရီ ခန့်မှန်းချက်ကို သုံးထားသည်။",
                )}
          </p>
          <p>
            {t(
              "Confidence: not calibrated. These transparent screening thresholds are not locally validated official criteria.",
              "ယုံကြည်နိုင်မှု — သီးခြားအတည်မပြုရသေးပါ။ ဤသတ်မှတ်ချက်များသည် ဒေသအလိုက် အတည်ပြုထားသော တရားဝင်စံများ မဟုတ်ပါ။",
            )}
          </p>
          {op.weather && !signal.historical && (
            <p>
              {mmt(op.weather.validAt, lang)} → {mmt(op.weather.through, lang)}
            </p>
          )}
          {op.history && signal.historical && (
            <p>
              {op.history.start} → {op.history.end} (ERA5)
            </p>
          )}
          <Evidence
            kind={
              signal.source === "ecmwf"
                ? "weather"
                : signal.source === "era5"
                  ? "history"
                  : "all"
            }
          />
        </details>
      )}
    </article>
  );
}
export function RegionalProfile({
  id,
  full = false,
}: {
  id: string;
  full?: boolean;
}) {
  const { t, lang, operational: op, data, now, lowData } = useApp();
  const w = op.weather?.regions.find((r) => r.id === id),
    h = op.history?.regions.find((r) => r.id === id);
  const signals = signalsFor(op, data, id, now),
    lead = leadingSignal(signals);
  return (
    <div
      className={`regional-profile ${full ? "full-profile" : "compact-profile"}`}
    >
      <p className="eyebrow">
        {t("REGIONAL WEATHER & CLIMATE", "ဒေသ မိုးလေဝသနှင့် ရာသီဥတု")}
      </p>
      <h2>{regionName(id, lang)}</h2>
      <div className="row">
        <Level level={lead?.level ?? "unknown"} />
        <span>{t("System screening", "စနစ်တွက်ချက်အဆင့်")}</span>
      </div>
      {w ? (
        <>
          <p className="meta">
            {t("Latest modeled hour", "နောက်ဆုံးရ မော်ဒယ်နာရီ")} ·{" "}
            {mmt(op.weather!.validAt, lang)} ·{" "}
            {weatherFresh(op.weather, now)
              ? t("Forecast", "ခန့်မှန်းချက်")
              : t("Stale — not current", "သက်တမ်းကျော် — လက်ရှိမဟုတ်")}
          </p>
          <div className="weather-now">
            <strong>{value(w.now.temperature, "°C")}</strong>
            <span>
              {t("Feels like", "ခံစားရသည့်အပူချိန်")}{" "}
              {value(w.now.apparent, "°C")}
              <br />
              {t("Humidity", "စိုထိုင်းဆ")} {value(w.now.humidity, "%")}
            </span>
          </div>
          <p>
            {t("Sample temperature range", "နမူနာအပူချိန်အကွာအဝေး")}:{" "}
            {value(w.now.min, "°C")} – {value(w.now.max, "°C")}
          </p>
          <dl className="metric-grid">
            <div>
              <dt>{t("Preceding hour rain", "ယခင်တစ်နာရီ မိုးရေ")}</dt>
              <dd>{value(w.now.rain, " mm")}</dd>
            </div>
            <div>
              <dt>{t("Wind / gust", "လေ / လေပြင်း")}</dt>
              <dd>
                {value(w.now.wind)} / {value(w.now.gust, " km/h")}
              </dd>
            </div>
            <div>
              <dt>
                {t("Next 24 h min / max", "လာမည့် ၂၄ နာရီ အနိမ့် / အမြင့်")}
              </dt>
              <dd>
                {value(w.next24.min)} / {value(w.next24.max, "°C")}
              </dd>
            </div>
            <div>
              <dt>{t("Next 24 h rainfall", "လာမည့် ၂၄ နာရီ မိုးရေ")}</dt>
              <dd>{value(w.next24.rain, " mm")}</dd>
            </div>
          </dl>
          <p className="meta">
            {t(
              "Weather code at the largest sample area",
              "ကိုယ်စားပြုဧရိယာအကြီးဆုံး နမူနာ မိုးလေဝသကုဒ်",
            )}
            : {w.now.code} ·{" "}
            {w.now.code <= 3
              ? t("Clear to cloudy", "ကြည်လင်မှ တိမ်ထူ")
              : w.now.code <= 48
                ? t("Fog", "မြူ")
                : w.now.code <= 67
                  ? t("Drizzle / rain", "မိုးဖွဲ / မိုးရွာ")
                  : w.now.code <= 86
                    ? t("Snow / showers", "နှင်း / မိုးပြတ်တောင်း")
                    : t("Thunderstorm", "မိုးကြိုးမုန်တိုင်း")}
          </p>
        </>
      ) : (
        <Notice>
          {t(
            "Weather data currently unavailable.",
            "မိုးလေဝသဒေတာ လောလောဆယ် မရရှိနိုင်ပါ။",
          )}
        </Notice>
      )}
      <h3>{t("Recent climate departure", "မကြာသေးမီ ရာသီဥတုကွာဟချက်")}</h3>
      {h ? (
        <>
          <p className="meta">
            ERA5 · {op.history!.start} → {op.history!.end} ·{" "}
            {historyFresh(op.history, now)
              ? t("Historical reanalysis", "သမိုင်းဒေတာ ပြန်လည်ဆန်းစစ်ချက်")
              : t("Stale", "သက်တမ်းကျော်")}
          </p>
          <dl className="metric-grid">
            <div>
              <dt>
                {t("30-day temperature anomaly", "ရက် ၃၀ အပူချိန်ကွာဟချက်")}
              </dt>
              <dd>
                {value(h.temperatureAnomaly, "°C", true)}
                <br />
                <small>
                  {value(h.temperature, "°C")} / {t("normal", "ပုံမှန်")}{" "}
                  {value(h.temperatureNormal, "°C")}
                </small>
              </dd>
            </div>
            <div>
              <dt>{t("30-day rainfall anomaly", "ရက် ၃၀ မိုးရေကွာဟချက်")}</dt>
              <dd>
                {value(h.rainPercent, "%", true)}
                <br />
                <small>{value(h.rainDifference, " mm", true)}</small>
              </dd>
            </div>
            <div>
              <dt>{t("7-day / 30-day rain", "၇ ရက် / ၃၀ ရက် မိုးရေ")}</dt>
              <dd>
                {value(h.rain7)} / {value(h.rain30, " mm")}
              </dd>
            </div>
            <div>
              <dt>
                {t("Expected rain · 7 / 30 days", "ပုံမှန်မိုးရေ · ၇ / ၃၀ ရက်")}
              </dt>
              <dd>
                {value(h.rainNormal7)} / {value(h.rainNormal30, " mm")}
              </dd>
            </div>
            <div>
              <dt>{t("Trailing dry days", "ဆက်တိုက်မိုးပြတ်ရက်")}</dt>
              <dd>
                {h.dryDays}
                {h.dryDays === 30 ? "+" : ""}
                <br />
                <small>
                  {t(
                    "Sampled mean below 1 mm/day",
                    "နမူနာပျမ်းမျှ တစ်ရက် 1 mm အောက်",
                  )}
                </small>
              </dd>
            </div>
          </dl>
          <p>
            {t(
              "Baseline: 1991–2020. Positive anomalies mean warmer or wetter than the same calendar period; negative means cooler or drier.",
              "ရည်ညွှန်းကာလ ၁၉၉၁–၂၀၂၀။ အပေါင်းက တူညီသောကာလထက် ပိုပူ သို့မဟုတ် မိုးပိုများခြင်း၊ အနုတ်က ပိုအေး သို့မဟုတ် မိုးပိုနည်းခြင်းကို ဆိုလိုသည်။",
            )}
          </p>
        </>
      ) : (
        <Notice>
          {t(
            "Matching historical data currently unavailable.",
            "ကိုက်ညီသော သမိုင်းဒေတာ လောလောဆယ် မရရှိနိုင်ပါ။",
          )}
        </Notice>
      )}
      <Evidence />
      {lead && <SignalCard signal={lead} compact={!full} />}
      {full && (
        <>
          <h3>
            {t(
              "Independent hazard screens",
              "အန္တရာယ်အမျိုးအစားအလိုက် စစ်ဆေးမှု",
            )}
          </h3>
          <div className="hazard-list">
            {signals.map((s) => (
              <details key={s.hazard}>
                <summary>
                  {t(...hazardNames[s.hazard])} <Level level={s.level} />
                </summary>
                <SignalCard signal={s} />
              </details>
            ))}
          </div>
          {w && (
            <>
              <h3>{t("Next 7 days", "လာမည့် ၇ ရက်")}</h3>
              <p>
                {t("First 3 days total rain", "ပထမ ၃ ရက် မိုးရေစုစုပေါင်း")}:{" "}
                {value(
                  w.days.slice(0, 3).reduce((s, d) => s + d.rain, 0),
                  " mm",
                )}
              </p>
              {!lowData && (
                <svg
                  className="trend-chart"
                  viewBox="0 0 420 95"
                  role="img"
                  aria-label={t(
                    "Daily forecast rainfall, with exact values in the table below",
                    "နေ့စဉ်မိုးရေခန့်မှန်းချက်၊ အောက်ပါဇယားတွင် တန်ဖိုးအတိအကျ ပါရှိသည်",
                  )}
                >
                  <title>
                    {t("7-day rainfall forecast", "၇ ရက် မိုးရေခန့်မှန်းချက်")}
                  </title>
                  {w.days.map((d, i) => (
                    <g key={d.date}>
                      <rect
                        x={i * 60 + 12}
                        y={
                          75 -
                          (65 * d.rain) /
                            Math.max(1, ...w.days.map((x) => x.rain))
                        }
                        width="32"
                        height={
                          (65 * d.rain) /
                          Math.max(1, ...w.days.map((x) => x.rain))
                        }
                        fill="#236c62"
                      />
                      <text x={i * 60 + 28} y="91" textAnchor="middle">
                        {d.date.slice(8)}
                      </text>
                    </g>
                  ))}
                </svg>
              )}
              <div className="table-scroll">
                <table>
                  <caption>
                    {t(
                      "Sampled regional daily forecast · MMT",
                      "ဒေသနမူနာ နေ့စဉ်ခန့်မှန်းချက် · မြန်မာစံတော်ချိန်",
                    )}
                  </caption>
                  <thead>
                    <tr>
                      <th>{t("Date", "ရက်")}</th>
                      <th>{t("Min / max °C", "အနိမ့် / အမြင့် °C")}</th>
                      <th>{t("Rain mm", "မိုးရေ mm")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.days.map((d) => (
                      <tr key={d.date}>
                        <td>
                          {d.date ===
                          new Date(now + 23400000).toISOString().slice(0, 10)
                            ? t("Today", "ယနေ့")
                            : d.date.slice(5)}
                        </td>
                        <td>
                          {value(d.min)} / {value(d.max)}
                        </td>
                        <td>{value(d.rain)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p>
            {t(
              "Rain probability, soil moisture and observed water levels: currently unavailable.",
              "မိုးရွာနိုင်နှုန်း၊ မြေအစိုဓာတ်နှင့် တိုင်းတာရေအဆင့် — လောလောဆယ် မရရှိနိုင်ပါ။",
            )}
          </p>
          <a className="button secondary" href="#/impacts">
            {t(
              "Health, agriculture, water & energy implications",
              "ကျန်းမာရေး၊ စိုက်ပျိုးရေး၊ ရေနှင့် စွမ်းအင် သက်ရောက်မှု",
            )}
          </a>
        </>
      )}
      {!full && (
        <a className="button secondary full-width" href={`#/region/${id}`}>
          {t("Full area profile", "ဒေသအချက်အလက် အပြည့်အစုံ")}
        </a>
      )}
    </div>
  );
}
