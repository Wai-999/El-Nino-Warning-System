import { useState } from "react";
import { useApp } from "../app/context";
import { lessons, sources } from "../data/content";
import { PageTitle, SourceLink } from "../components/shared";
export default function Learn() {
  const { t } = useApp();
  const [phase, setPhase] = useState(1);
  const names = [
    t("La Niña", "လာနီညာ"),
    t("Neutral", "ပုံမှန်အဆင့်"),
    t("El Niño", "အယ်လ်နီညို"),
  ];
  return (
    <>
      <PageTitle
        eyebrow={t("LEARN EL NIÑO", "အယ်လ်နီညိုကို လေ့လာမည်")}
        title={t(
          "One ocean. Connected weather.",
          "သမုဒ္ဒရာမှ ဆက်နွယ်နေသော ရာသီဥတု",
        )}
        description={t(
          "Explore the Pacific pattern behind ENSO, one step at a time.",
          "ENSO ၏ နောက်ခံ ပစိဖိတ်ဖြစ်စဉ်ကို တစ်ဆင့်ချင်း လေ့လာပါ။",
        )}
      />
      <section className="panel learning-panel">
        <div className="row spread">
          <h2>{t("The Pacific, in three phases", "ပစိဖိတ်၏ အဆင့်သုံးဆင့်")}</h2>
          <span className="badge level-unknown">
            {t(
              "Illustration · not live data",
              "ရှင်းလင်းပုံ · လက်ရှိဒေတာ မဟုတ်",
            )}
          </span>
        </div>
        <div className="segmented">
          {names.map((n, i) => (
            <button
              key={i}
              aria-pressed={phase === i}
              onClick={() => setPhase(i)}
            >
              {n}
            </button>
          ))}
        </div>
        <div
          className={`enso-diagram phase-${phase}`}
          role="img"
          aria-label={t(
            `${names[phase]}: ${phase === 2 ? "weaker trade winds and warm water extending east" : phase === 0 ? "stronger trade winds and cooler eastern Pacific" : "trade winds push warm water west"}. Schematic cross-section of the equatorial Pacific.`,
            `${names[phase]} — ${phase === 2 ? "လေအားနည်းပြီး ရေနွေး အရှေ့သို့ပြန့်သည်" : phase === 0 ? "လေအားကောင်း၍ အရှေ့ပစိဖိတ် ပိုအေးသည်" : "လေက ရေနွေးကို အနောက်သို့ တွန်းပို့သည်"}။ အီကွေတာ ပစိဖိတ်သမုဒ္ဒရာ ဖြတ်ပိုင်းရှင်းလင်းပုံ။`,
          )}
        >
          <div className="diagram-sky">
            <span>
              {t("WEST · ASIA / AUSTRALIA", "အနောက် · အာရှ / ဩစတြေးလျ")}
            </span>
            <span>{t("EAST · SOUTH AMERICA", "အရှေ့ · တောင်အမေရိက")}</span>
          </div>
          <div className="wind-label">
            {phase === 2
              ? t("Weaker trade winds", "ကုန်သွယ်လေ အားနည်း")
              : phase === 0
                ? t("Stronger trade winds", "ကုန်သွယ်လေ အားကောင်း")
                : t("Trade winds", "ကုန်သွယ်လေ")}
          </div>
          <div className="wind-arrows" aria-hidden="true">
            {phase === 2 ? "←   ←" : "⟵   ⟵   ⟵"}
          </div>
          <div className="ocean-cross-section">
            <div className="warm-pool">
              {t("Warmer surface water", "ပိုပူနွေးသော မျက်နှာပြင်ရေ")}
            </div>
            <span className="cool-pool">
              {t("Cooler water below", "အောက်ပိုင်း ရေအေး")}
            </span>
            <span className="upwelling" aria-hidden="true">
              {phase === 2 ? "↑" : "↑ ↑ ↑"}
            </span>
          </div>
        </div>
        <p className="diagram-caption" aria-live="polite">
          {phase === 2
            ? t(
                "As trade winds weaken, warm water spreads eastward and upwelling weakens. The atmosphere responds, shifting rainfall patterns.",
                "ကုန်သွယ်လေ အားနည်းလာလျှင် ရေနွေး အရှေ့သို့ပြန့်၍ ရေအေးတက်မှု လျော့သည်။ လေထုတုံ့ပြန်မှုကြောင့် မိုးရွာမှုပုံစံ ပြောင်းလဲသည်။",
              )
            : phase === 0
              ? t(
                  "Stronger trade winds move more warm water westward. Upwelling helps make the eastern Pacific cooler than usual.",
                  "ကုန်သွယ်လေ အားကောင်းသဖြင့် ရေနွေးကို အနောက်သို့ ပိုတွန်းပို့သည်။ ရေအေးတက်လာမှုကြောင့် အရှေ့ပစိဖိတ် ပုံမှန်ထက် ပိုအေးလာသည်။",
                )
              : t(
                  "Trade winds push warm water westward. Cooler water rises in the eastern Pacific. These ocean and wind patterns are linked.",
                  "ကုန်သွယ်လေက ရေနွေးကို အနောက်သို့ တွန်းပို့သည်။ အရှေ့ပစိဖိတ်တွင် ရေအေးတက်လာသည်။ သမုဒ္ဒရာနှင့် လေဖြစ်စဉ်တို့ ဆက်နွယ်နေသည်။",
                )}
        </p>
        <SourceLink href={sources.learn}>
          NOAA · {t("ENSO explained", "ENSO ရှင်းလင်းချက်")}
        </SourceLink>
      </section>
      <div className="lesson-list">
        {lessons.map((l, i) => (
          <details className="panel" key={i}>
            <summary>
              <span className="lesson-number">0{i + 1}</span>
              {t(...l.q)}
            </summary>
            <div className="lesson-body">
              <p>{t(...l.a)}</p>
              <SourceLink href={l.source}>
                {t("Explore the evidence", "အထောက်အထား လေ့လာရန်")}
              </SourceLink>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
