import { useApp } from "../app/context";
import { decisionKpis } from "../risk/kpis";
import { Concern } from "./Intelligence";
import { regionName } from "../data/regions";
import { mmt } from "../data/operational";
import type { Severity } from "../data/schema";
export function DecisionKpis() {
  const { t, lang, operational, data, now } = useApp();
  return (
    <section
      className="national-strip"
      aria-label={t("National snapshot", "နိုင်ငံအကျဉ်းချုပ်")}
    >
      {decisionKpis(operational, data, now).map((k) => (
        <div key={k.id} data-kpi={k.id}>
          <span>{t(...k.label)}</span>
          {k.id === "concern" ? (
            <Concern level={(k.value as Severity) ?? "unknown"} />
          ) : (
            <strong>{k.value ?? t("Unavailable", "မရရှိနိုင်")}</strong>
          )}
          {k.region && <small>{regionName(k.region, lang)}</small>}
          <small>{t(...k.unit)}</small>
          <details className="kpi-provenance">
            <summary>
              {t("Why this matters & source", "အရေးပါပုံနှင့် ရင်းမြစ်")}
            </summary>
            <p>{t(...k.why)}</p>
            <p>
              <strong>{t("Calculation", "တွက်ချက်နည်း")}: </strong>
              {t(...k.method)}
            </p>
            <p>
              {t("Period / assessment time", "ကာလ / သုံးသပ်ချိန်")}:{" "}
              {k.period ?? t("Unavailable", "မရရှိနိုင်")}
            </p>
            <p>
              {t("Baseline", "ရည်ညွှန်းကာလ")}:{" "}
              {t(
                "Not applicable to counts or screening levels; ERA5 input compares matching days in 1991–2020.",
                "အရေအတွက်၊ စစ်ဆေးအဆင့်အတွက် မသက်ဆိုင်။ ERA5 ဒေတာတွင် ၁၉၉၁–၂၀၂၀ တူညီရက်များကို နှိုင်းယှဉ်သည်။",
              )}
            </p>
            <p>
              {t("Source", "ရင်းမြစ်")}: {t(...k.source)}
            </p>
            <p>
              {t(
                "Latest contributing retrieval / review",
                "ပါဝင်ရင်းမြစ် နောက်ဆုံးရယူ / ပြန်စစ်",
              )}
              :{" "}
              {k.updatedAt
                ? mmt(k.updatedAt, lang)
                : t("Unavailable", "မရရှိနိုင်")}
            </p>
            <a href={k.href}>
              {t(
                "Inspect dated inputs and limitations",
                "ရက်စွဲပါ ဒေတာနှင့် အကန့်အသတ် ကြည့်ရန်",
              )}
            </a>
          </details>
        </div>
      ))}
    </section>
  );
}
