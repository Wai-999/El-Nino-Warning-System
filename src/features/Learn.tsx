import { VideoLibrary } from "../components/VideoLibrary";
import { RegionalContext } from "../components/Intelligence";
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
      <VideoLibrary />
      <section className="panel padded">
        <h2>
          {t(
            "ENSO is one driver, not a local outcome",
            "ENSO သည် အကြောင်းရင်းတစ်ခုဖြစ်ပြီး ဒေသရလဒ် မဟုတ်ပါ",
          )}
        </h2>
        <p>
          {t(
            "A stronger El Niño does not imply proportionally stronger impacts everywhere in Myanmar. Season, monsoon circulation, Indian Ocean conditions, tropical systems, terrain and exposure also matter.",
            "အယ်လ်နီညို ပိုပြင်းခြင်းသည် မြန်မာနေရာတိုင်း သက်ရောက်မှု အချိုးကျပိုပြင်းမည်ဟု မဆိုလိုပါ။ ရာသီ၊ မုတ်သုံ၊ အိန္ဒိယသမုဒ္ဒရာအခြေအနေ၊ အပူပိုင်းမုန်တိုင်း၊ မြေပြင်နှင့် ဘေးထိတွေ့မှုတို့လည်း အရေးပါသည်။",
          )}
        </p>
        <p>
          <SourceLink href="https://wmo.int/resources/publication-series/el-ninola-nina-updates/august-2026">
            WMO · El Niño / La Niña Update
          </SourceLink>
        </p>
        <p>
          <a href="#/">
            {t(
              "Current dated ENSO assessment → Overview",
              "လက်ရှိရက်စွဲပါ ENSO သုံးသပ်ချက် → အကျဉ်းချုပ်",
            )}
          </a>
        </p>
      </section>
      <RegionalContext />
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
      <section className="panel padded">
        <h2>
          {t("Terms in English & Burmese", "အင်္ဂလိပ်နှင့် မြန်မာ ဝေါဟာရများ")}
        </h2>
        <dl className="glossary-list">
          {[
            [
              "Forecast · ခန့်မှန်းချက်",
              "An estimate of future conditions, with uncertainty.",
              "မသေချာမှုပါသော အနာဂတ်အခြေအနေ ခန့်မှန်းတန်ဖိုး။",
            ],
            [
              "Reanalysis · ပြန်လည်ဆန်းစစ်ဒေတာ",
              "Past observations combined with a model; not a local station reading.",
              "အတိတ်တိုင်းတာချက်ကို မော်ဒယ်နှင့် ပေါင်းထားခြင်း၊ ဒေသစခန်းတိုင်းတာချက် မဟုတ်။",
            ],
            [
              "Anomaly · ပုံမှန်နှင့် ကွာဟချက်",
              "Difference from a stated reference period; the baseline must be named.",
              "ဖော်ပြထားသော ရည်ညွှန်းကာလနှင့် ကွာခြားမှု။ အခြေခံကာလ ဖော်ပြရမည်။",
            ],
            [
              "Niño 3.4 / RONI",
              "Niño 3.4 is a Pacific sea-temperature region. RONI removes tropical-mean warming and rescales variability before a three-month average; it is not the monthly SST anomaly shown in Overview.",
              "Niño 3.4 သည် ပစိဖိတ်ပင်လယ်အပူချိန်ဒေသဖြစ်သည်။ RONI သည် အပူပိုင်းပျမ်းမျှပူနွေးမှုကို နုတ်၍ ကွဲပြားမှုပမာဏ ပြန်ချိန်ညှိသော သုံးလပျမ်းမျှဖြစ်ပြီး အကျဉ်းချုပ်ရှိ လစဉ်အပူချိန်ကွာဟချက် မဟုတ်ပါ။",
            ],
            [
              "Exposure / vulnerability · ထိတွေ့မှု / ထိခိုက်လွယ်မှု",
              "Who is in a hazard’s path and how susceptible they are to harm.",
              "ဘေးလမ်းကြောင်းရှိသူနှင့် ထိခိုက်မှုခံရလွယ်ပုံ။",
            ],
            [
              "Heatstroke / ORS · အပူလျှပ်ခြင်း / ဓာတ်ဆားရည်",
              "Heatstroke is an emergency. Oral rehydration solution replaces fluid lost through diarrhoea; follow the packet directions.",
              "အပူလျှပ်ခြင်းသည် အရေးပေါ်ဖြစ်သည်။ ORS သည် ဝမ်းလျှောမှ ဆုံးရှုံးသောအရည် ပြန်ဖြည့်ရန်ဖြစ်ပြီး ထုပ်ညွှန်ကြားချက် လိုက်နာရမည်။",
            ],
          ].map(([term, en, my]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{t(en, my)}</dd>
            </div>
          ))}
        </dl>
        <p>
          <SourceLink href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/">
            NOAA CPC · RONI definition and index
          </SourceLink>
        </p>
        <p>
          <a href="#/health">
            {t(
              "Medical terms and safe actions → Health",
              "ဆေးဘက်ဝေါဟာရနှင့် ဘေးကင်းလုပ်ဆောင်မှု → ကျန်းမာရေး",
            )}
          </a>
        </p>
      </section>
    </>
  );
}
