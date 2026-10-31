import { useState } from "react";
import { useApp } from "../app/context";
import { seasons } from "../data/climate";
import { number } from "../data/presentation";
import { Source, Unavailable } from "./Service";
export default function RoniHistory({
  textOnly = false,
}: {
  textOnly?: boolean;
}) {
  const { climate, t, lang } = useApp();
  const [season, setSeason] = useState(
    climate.roni?.points.at(-1)?.season || "DJF",
  );
  const points =
    climate.roni?.points.filter((p) => p.season === season).slice(-30) || [];
  if (!points.length)
    return (
      <Unavailable>
        {t("Historical RONI unavailable.", "RONI သမိုင်း မရရှိပါ။")}
      </Unavailable>
    );
  const x = (i: number) => 45 + (i * 650) / Math.max(points.length - 1, 1),
    y = (v: number) => 145 - v * 35;
  return (
    <>
      <label className="season-control">
        {t(
          "Compare the same season across years",
          "နှစ်အလိုက် တူညီသောကာလ နှိုင်းယှဉ်ရန်",
        )}
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value as typeof season)}
        >
          {seasons.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <p className="small">
        {points[0].year}–{points.at(-1)!.year} ·{" "}
        {t(
          "Latest 30 available years for this season. Official full history is retained in the export. Newest values can be revised.",
          "ဤကာလအတွက် နောက်ဆုံးရရှိသည့် နှစ် ၃၀ ဖြစ်သည်။ မူရင်းသမိုင်းအပြည့်ကို ထုတ်ယူဒေတာတွင် ထိန်းထားသည်။ နောက်ဆုံးတန်ဖိုးများ ပြင်ဆင်နိုင်သေးသည်။",
        )}
      </p>
      {!textOnly && (
        <svg
          className="history-chart"
          viewBox="0 0 740 300"
          role="img"
          aria-label={t(
            "RONI in degrees Celsius by year; exact values follow in the table.",
            "နှစ်အလိုက် RONI ဒီဂရီဆဲလ်စီးယပ်၊ အတိအကျတန်ဖိုးများကို အောက်ဇယားတွင် ကြည့်ပါ။",
          )}
        >
          <line
            x1="45"
            y1="145"
            x2="695"
            y2="145"
            stroke="#9aafb5"
            strokeDasharray="4 4"
          />
          {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
            <text key={v} x="10" y={y(v) + 4} fill="#51646e" fontSize="12">
              {v}°
            </text>
          ))}
          <polyline
            points={points.map((p, i) => `${x(i)},${y(p.anomaly)}`).join(" ")}
            fill="none"
            stroke="#24708e"
            strokeWidth="2.5"
          />
          {points.map((p, i) => (
            <circle
              key={p.year}
              cx={x(i)}
              cy={y(p.anomaly)}
              r="3"
              fill={p.anomaly > 0 ? "#a65a23" : "#24708e"}
            />
          ))}
          <text x="45" y="285" fill="#51646e" fontSize="13">
            {points[0].year}
          </text>
          <text x="660" y="285" fill="#51646e" fontSize="13">
            {points.at(-1)!.year}
          </text>
        </svg>
      )}
      <details className="inner-details" open={textOnly}>
        <summary>
          {t("Exact historical values", "သမိုင်းတန်ဖိုး အတိအကျ")}
        </summary>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label={t("Historical RONI values", "သမိုင်း RONI တန်ဖိုးများ")}
        >
          <table className="data-table">
            <caption>RONI · {season} · °C</caption>
            <thead>
              <tr>
                <th>{t("Year", "နှစ်")}</th>
                <th>{t("Anomaly", "ကွာဟချက်")}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.year}>
                  <th scope="row">{number(p.year, lang, 0)}</th>
                  <td>{number(p.anomaly, lang, 2)}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <Source id="roni" />
    </>
  );
}
