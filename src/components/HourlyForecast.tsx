import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import {
  detailFields,
  loadWeatherDetails,
  detailsFresh,
  type DetailField,
  type WeatherDetails,
} from "../data/weatherDetails";
import { number, csv, download } from "../data/presentation";
import { mmt } from "../data/operational";
import { localDigits } from "../data/locale";
import { Source, Stale, Unavailable } from "./Service";

export default function HourlyForecast() {
  const { t, lang, selected, now } = useApp();
  const [result, setResult] = useState<{
    data: WeatherDetails;
    cached: boolean;
  } | null>(null);
  const [error, setError] = useState(false),
    [retry, setRetry] = useState(0);
  const [pointId, setPointId] = useState(""),
    [day, setDay] = useState("");
  const [advanced, setAdvanced] = useState(false);
  useEffect(() => {
    let active = true;
    setError(false);
    void loadWeatherDetails()
      .then((value) => {
        if (active) setResult(value);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  if (!result)
    return error ? (
      <Unavailable>
        {t(
          "Detailed forecast could not be loaded. No values are substituted.",
          "အသေးစိတ်ခန့်မှန်းချက် မဖွင့်နိုင်ပါ။ အစားထိုးတန်ဖိုး မသုံးပါ။",
        )}
        <button onClick={() => setRetry((n) => n + 1)}>
          {t("Retry detailed forecast", "အသေးစိတ်ခန့်မှန်းချက် ပြန်ဖွင့်ရန်")}
        </button>
      </Unavailable>
    ) : (
      <p role="status">
        {t("Loading hourly forecast…", "နာရီအလိုက် ခန့်မှန်းချက် ဖွင့်နေသည်…")}
      </p>
    );
  const { data } = result;
  const points = data.points
    .filter((point) => point.regionId === selected)
    .sort((a, b) => b.weight - a.weight);
  const point = points.find((point) => point.id === pointId) || points[0];
  const days = [
    ...new Set(
      data.times.map((time) =>
        new Date(Date.parse(time) + 23400000).toISOString().slice(0, 10),
      ),
    ),
  ];
  const selectedDay = days.includes(day) ? day : days[0];
  const indexes = data.times.flatMap((time, i) =>
    new Date(Date.parse(time) + 23400000).toISOString().startsWith(selectedDay)
      ? [i]
      : [],
  );
  const fields: DetailField[] = advanced
    ? (Object.keys(detailFields).filter(
        (key) => key !== "weather_code",
      ) as DetailField[])
    : [
        "temperature_2m",
        "apparent_temperature",
        "precipitation",
        "precipitation_probability",
        "wind_speed_10m",
        "wind_gusts_10m",
      ];
  const allFields = Object.keys(detailFields) as DetailField[];
  const provenance = {
    source: data.source,
    license: data.license,
    model: data.model,
    probabilityModel: data.probabilityModel,
    issuedAt: data.issueTime,
    retrievedAt: data.fetchedAt,
    referenceHour: data.validAt,
    geographicMeaning:
      "One representative model cell, not a station or city/township measurement",
  };
  function exportCsv() {
    download(
      "hourly-grid-forecast.csv",
      csv([
        [
          "time_MMT",
          ...allFields.map((key) => `${key} [${detailFields[key].unit}]`),
          "region_id",
          "model_latitude",
          "model_longitude",
          "model",
          "probability_model",
          "source_issue_time",
          "retrieved_at",
          "source",
          "license",
          "spatial_meaning",
        ],
        ...data.times.map((time, i) => [
          new Date(Date.parse(time) + 23400000).toISOString().slice(0, 16) +
            "+06:30",
          ...allFields.map((key) => point.values[key]?.[i] ?? ""),
          selected,
          point.modelLat,
          point.modelLon,
          data.model,
          data.probabilityModel,
          "not supplied",
          data.fetchedAt,
          data.source,
          data.license,
          provenance.geographicMeaning,
        ]),
      ]),
      "text/csv",
    );
  }
  return (
    <section
      className="surface padded hourly-forecast"
      aria-labelledby="hourly-title"
    >
      <h2 id="hourly-title">
        {t(
          "Hourly forecast · representative grid point",
          "နာရီအလိုက် ခန့်မှန်းချက် · နမူနာဂရစ်နေရာ",
        )}
      </h2>
      <p>
        {t(
          "Choose one of the three regional samples. Each row is a model forecast, including hours before retrieval; it is not an observation at your selected town or farm. The regional summary above uses all three samples.",
          "ဒေသနမူနာသုံးခုမှ တစ်ခုရွေးပါ။ ရယူချိန်မတိုင်မီ နာရီများအပါအဝင် အတန်းတိုင်းသည် မော်ဒယ်ခန့်မှန်းချက်ဖြစ်သည်။ ရွေးထားသော မြို့ သို့မဟုတ် လယ်ကွင်း၏ တိုင်းတာချက် မဟုတ်ပါ။ အပေါ်ရှိ ဒေသအကျဉ်းချုပ်တွင် နမူနာသုံးခုလုံးကို သုံးသည်။",
        )}
      </p>
      {(!detailsFresh(data, now) || result.cached) && (
        <Stale stamp={data.fetchedAt} />
      )}
      {error && (
        <p role="status">
          {t(
            "Refresh failed. The displayed snapshot keeps its original times.",
            "ဒေတာပြန်ရယူမှု မအောင်မြင်ပါ။ ပြထားသောဒေတာ၏ မူရင်းအချိန်ကို ထိန်းထားသည်။",
          )}
        </p>
      )}
      <div className="hourly-controls">
        <label>
          {t("Grid sample", "ဂရစ်နမူနာ")}
          <select
            value={point.id}
            onChange={(event) => setPointId(event.target.value)}
          >
            {points.map((p, i) => (
              <option key={p.id} value={p.id}>
                {t("Sample", "နမူနာ")} {i + 1} · {p.modelLat}°N, {p.modelLon}°E
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Myanmar calendar day", "မြန်မာပြက္ခဒိန်ရက်")}
          <select
            value={selectedDay}
            onChange={(event) => setDay(event.target.value)}
          >
            {days.map((date) => (
              <option key={date} value={date}>
                {dateLabel(date + "T12:00:00+06:30", lang)}
              </option>
            ))}
          </select>
        </label>
        <button onClick={exportCsv}>
          <Download size={15} />
          {t("Hourly CSV", "နာရီအလိုက် CSV")}
        </button>
        <button
          onClick={() =>
            download("hourly-grid-forecast.json", {
              ...provenance,
              point,
              times: data.times,
              units: Object.fromEntries(
                allFields.map((key) => [key, detailFields[key].unit]),
              ),
            })
          }
        >
          JSON
        </button>
      </div>
      <label className="check-option">
        <input
          type="checkbox"
          checked={advanced}
          onChange={(event) => setAdvanced(event.target.checked)}
        />
        {t(
          "Show humidity, wind direction, pressure, wet-bulb, soil moisture and ET₀",
          "စိုထိုင်းဆ၊ လေဦးတည်ရာ၊ လေဖိအား၊ ရေစိုအပူချိန်၊ မြေဆီလွှာအစိုဓာတ်နှင့် ET₀ ပြရန်",
        )}
      </label>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label={t(
          "Hourly grid forecast table; scroll for more columns",
          "နာရီအလိုက် ဂရစ်ခန့်မှန်းချက်ဇယား၊ ကော်လံများအတွက် ဘေးသို့ရွှေ့ပါ",
        )}
      >
        <table className="data-table forecast-table">
          <caption>
            {selectedDay} · {point.modelLat}°N, {point.modelLon}°E · ECMWF IFS
            0.25°
          </caption>
          <thead>
            <tr>
              <th scope="col">{t("Time (MMT)", "အချိန် (မြန်မာ)")}</th>
              {fields.map((key) => (
                <th scope="col" key={key}>
                  {detailFields[key][lang]}
                  <small>{detailFields[key].unit}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indexes.map((i) => (
              <tr key={data.times[i]}>
                <th scope="row">
                  {localDigits(
                    new Date(Date.parse(data.times[i]) + 23400000)
                      .toISOString()
                      .slice(11, 16),
                    lang,
                  )}
                </th>
                {fields.map((key) => (
                  <td key={key}>
                    {number(
                      point.values[key]?.[i],
                      lang,
                      key.startsWith("soil_moisture")
                        ? 3
                        : key === "precipitation_probability" ||
                            key === "wind_direction_10m"
                          ? 0
                          : 1,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small">
        {t(
          "Probability is the ECMWF ensemble chance of more than 0.1 mm in the preceding hour at this grid point. It is neither a regional chance nor a flooding probability. Amounts and ET₀ cover the preceding hour; gusts are the provider’s preceding-three-hour maximum. Other fields are valid at the stated time. A dash means the provider field failed validation or was missing.",
          "ဖြစ်နိုင်ခြေသည် ဤဂရစ်နေရာ၌ ပြီးခဲ့သည့်တစ်နာရီအတွင်း 0.1 mm ထက်ပို မိုးရွာရန် ECMWF အစုလိုက်မော်ဒယ်၏ ဖြစ်နိုင်ခြေဖြစ်သည်။ ဒေသတစ်ခုလုံး သို့မဟုတ် ရေကြီးရန် ဖြစ်နိုင်ခြေ မဟုတ်ပါ။ မိုးရေနှင့် ET₀ သည် ပြီးခဲ့သည့်တစ်နာရီအတွက်ဖြစ်ပြီး လေပြင်းသည် ပံ့ပိုးသူ၏ ပြီးခဲ့သည့်သုံးနာရီ အမြင့်ဆုံးဖြစ်သည်။ အခြားတန်ဖိုးများသည် ဖော်ပြချိန်အတွက် ဖြစ်သည်။ မျဉ်းတိုသည် ဒေတာမရှိခြင်း သို့မဟုတ် စစ်ဆေးမှုမအောင်ခြင်း ဖြစ်သည်။",
        )}
      </p>
      {advanced && (
        <p className="small">
          {t(
            "Wet-bulb is the provider’s derived estimate, not a physiological limit. Soil moisture is volumetric model water content at the named depths; no local drought threshold or anomaly is inferred. FAO reference ET₀ represents a well-watered reference grass surface, not actual crop water use. Wind direction is where wind comes from; point directions are never averaged as ordinary numbers.",
            "ရေစိုအပူချိန်သည် ပံ့ပိုးသူတွက်ထုတ်သည့် တန်ဖိုးဖြစ်ပြီး လူ့ခံနိုင်ရည်ကန့်သတ်ချက် မဟုတ်ပါ။ မြေဆီလွှာအစိုဓာတ်သည် ဖော်ပြအနက်၌ ထုထည်အလိုက် မော်ဒယ်ရေပါဝင်မှုဖြစ်ပြီး ဒေသမိုးခေါင်အဆင့် သို့မဟုတ် ကွာဟချက် မတွက်ပါ။ FAO ရည်ညွှန်း ET₀ သည် ရေလုံလောက်သော ရည်ညွှန်းမြက်မျက်နှာပြင်အတွက်ဖြစ်ပြီး သီးနှံ၏ အမှန်တကယ်ရေသုံးစွဲမှု မဟုတ်ပါ။ လေဦးတည်ရာသည် လေလာရာဖြစ်ပြီး နေရာများ၏ ထောင့်ကို သာမန်ကိန်းအဖြစ် ပျမ်းမျှမတွက်ပါ။",
          )}
        </p>
      )}
      <p className="small">
        {t("Model reference hour", "မော်ဒယ်ရည်ညွှန်းနာရီ")}:{" "}
        {mmt(data.validAt, lang)} · {t("Retrieved", "ရယူချိန်")}:{" "}
        {mmt(data.fetchedAt, lang)}.{" "}
        {t(
          "Model run issue time is not supplied. Native 3/6-hour steps are interpolated hourly by the provider; uncertainty is not quantified.",
          "မော်ဒယ်စတင်ထုတ်ချိန် မပေးထားပါ။ မူရင်း 3/6 နာရီခြားဒေတာကို ပံ့ပိုးသူက နာရီအလိုက် ကြားဖြည့်ထားပြီး မသေချာမှုကို ကိန်းဂဏန်းဖြင့် မဖော်ပြထားပါ။",
        )}
      </p>
      <Source id="hourly-forecast" />
      <Source id="rain-probability" />
      {advanced && (
        <>
          <Source id="pressure-direction" />
          <Source id="wet-bulb" />
          <Source id="soil-moisture" />
          <Source id="reference-et" />
        </>
      )}
    </section>
  );
}
