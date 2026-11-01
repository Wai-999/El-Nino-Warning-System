import { useEffect, useState } from "react";
import { useApp } from "../app/context";
import {
  emptyEnsoIndices,
  indexDefinitions,
  indexIds,
  indexFresh,
  loadEnsoIndices,
  type EnsoIndexId,
} from "../data/ensoIndices";
import { number, download } from "../data/presentation";
import { mmt } from "../data/operational";
import { Source, Stale, Unavailable } from "./Service";

export default function EnsoIndices() {
  const { t, lang, now } = useApp();
  const [result, setResult] = useState({
      data: emptyEnsoIndices,
      cached: false,
    }),
    [error, setError] = useState(false),
    [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<EnsoIndexId>("oni"),
    [full, setFull] = useState(false);
  useEffect(() => {
    let active = true;
    void loadEnsoIndices()
      .then((value) => {
        if (active) setResult(value);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const series = result.data.series[selected],
    definition = indexDefinitions[selected];
  if (!loaded)
    return (
      <p role="status">
        {t(
          "Loading published ENSO indices…",
          "ထုတ်ပြန်ပြီး ENSO ညွှန်းကိန်းများ ဖွင့်နေသည်…",
        )}
      </p>
    );
  if (error)
    return (
      <Unavailable>
        {t(
          "Published ENSO indices could not be loaded. The NOAA assessment and RONI above remain independent.",
          "ထုတ်ပြန်ပြီး ENSO ညွှန်းကိန်းများ မဖွင့်နိုင်ပါ။ အပေါ်ရှိ NOAA သုံးသပ်ချက်နှင့် RONI သည် သီးခြားဖြစ်သည်။",
        )}
      </Unavailable>
    );
  return (
    <section
      className="published-indices"
      aria-labelledby="published-indices-title"
    >
      <h3 id="published-indices-title">
        {t(
          "Published Pacific indices · separate methods",
          "ထုတ်ပြန်ပြီး ပစိဖိတ်ညွှန်းကိန်းများ · သီးခြားနည်းလမ်းများ",
        )}
      </h3>
      <p>
        {t(
          "These indices describe different ocean–atmosphere signals and periods. They are not averaged, converted into local Myanmar warnings, or used to override NOAA’s official assessment.",
          "ဤညွှန်းကိန်းများသည် သမုဒ္ဒရာ–လေထုအချက်များနှင့် ကာလများ ကွာသည်။ ၎င်းတို့ကို ပျမ်းမျှတွက်ခြင်း၊ မြန်မာဒေသသတိပေးချက်အဖြစ် ပြောင်းခြင်း သို့မဟုတ် NOAA တရားဝင်သုံးသပ်ချက်ကို အစားထိုးခြင်း မပြုပါ။",
        )}
      </p>
      <div
        className="range-tabs"
        role="group"
        aria-label={t("Published index", "ထုတ်ပြန်ပြီး ညွှန်းကိန်း")}
      >
        {indexIds.map((id) => (
          <button
            key={id}
            aria-pressed={selected === id}
            onClick={() => setSelected(id)}
          >
            {indexDefinitions[id].name}
          </button>
        ))}
      </div>
      <p>{definition[lang]}</p>
      {series ? (
        <>
          <p className="index-latest">
            <strong>
              {series.points.at(-1)!.label} ·{" "}
              {number(series.points.at(-1)!.value, lang, 2)}
            </strong>{" "}
            {definition.unit === "°C"
              ? "°C"
              : t("standardized index", "စံပြုညွှန်းကိန်း")}
          </p>
          {!indexFresh(series, now) && <Stale stamp={series.retrievedAt} />}
          {result.cached && (
            <p className="small">
              {t(
                "Previously cached source snapshot; original periods apply.",
                "ယခင်သိမ်းထားသော ရင်းမြစ်ဒေတာဖြစ်ပြီး မူရင်းကာလကို အသုံးပြုသည်။",
              )}
            </p>
          )}
          <p className="small">
            {t("Retrieved", "ရယူချိန်")} {mmt(series.retrievedAt, lang)} ·{" "}
            {t(
              "Source issue clock time is not supplied. Dates below are the published index periods, not retrieval dates.",
              "ရင်းမြစ်ထုတ်နာရီ မပေးထားပါ။ အောက်ပါရက်များသည် ထုတ်ပြန်ပြီး ညွှန်းကိန်းကာလဖြစ်ပြီး ရယူရက် မဟုတ်ပါ။",
            )}
          </p>
          <p className="small">
            {result.data.health[selected]?.ok
              ? t(
                  "Last source check succeeded",
                  "နောက်ဆုံးရင်းမြစ်စစ်ဆေးမှု အောင်မြင်",
                )
              : t(
                  "Last source check failed; retained source periods",
                  "နောက်ဆုံးရင်းမြစ်စစ်ဆေးမှု မအောင်မြင်၍ မူရင်းကာလကို ထိန်းထားသည်",
                )}
          </p>
          <label className="check-option">
            <input
              type="checkbox"
              checked={full}
              onChange={(event) => setFull(event.target.checked)}
            />
            {t(
              "Show complete source history instead of the latest 24 periods",
              "နောက်ဆုံးကာလ 24 ခုအစား ရင်းမြစ်သမိုင်းအားလုံး ပြရန်",
            )}
          </label>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label={t(
              "Published index history table",
              "ထုတ်ပြန်ပြီး ညွှန်းကိန်းသမိုင်းဇယား",
            )}
          >
            <table className="data-table">
              <caption>
                {definition.name} ·{" "}
                {t("Period labels as published", "မူရင်းကာလအညွှန်းများ")}
              </caption>
              <thead>
                <tr>
                  <th>{t("Period", "ကာလ")}</th>
                  <th>
                    {definition.unit === "°C"
                      ? "°C"
                      : t("Standardized index", "စံပြုညွှန်းကိန်း")}
                  </th>
                  <th>{t("Start → end month", "စလ → ဆုံးလ")}</th>
                </tr>
              </thead>
              <tbody>
                {(full ? series.points : series.points.slice(-24)).map(
                  (point) => (
                    <tr key={point.completedAt}>
                      <th scope="row">{point.label}</th>
                      <td>{number(point.value, lang, 2)}</td>
                      <td>
                        {point.startMonth} → {point.endMonth}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          <button
            onClick={() =>
              download(`noaa-${selected}-with-provenance.json`, {
                ...series,
                unit: definition.unit,
                method: definition.en,
                license: "NOAA public information; attribution",
                limitation:
                  "Pacific context, not Myanmar warning; issue time unknown",
              })
            }
          >
            {t(
              "Export index with provenance",
              "ညွှန်းကိန်းကို ရင်းမြစ်နှင့် ထုတ်ယူရန်",
            )}
          </button>
        </>
      ) : (
        <Unavailable>
          {t(
            "This index source is unavailable. No value is substituted.",
            "ဤညွှန်းကိန်းရင်းမြစ် မရရှိပါ။ အစားထိုးတန်ဖိုး မသုံးပါ။",
          )}
        </Unavailable>
      )}
      <Source id={selected} />
    </section>
  );
}
