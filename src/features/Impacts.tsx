import { useState } from "react";
import { CloudSun, HeartPulse, Sprout, Droplets, Zap } from "lucide-react";
import { useApp } from "../app/context";
import { sectors } from "../data/content";
import { PageTitle, Notice, SourceLink } from "../components/shared";
export default function Impacts() {
  const { t } = useApp();
  const [sector, setSector] = useState("weather");
  const [scenario, setScenario] = useState(0);
  const item = sectors.find((x) => x.id === sector)!;
  const icons = [CloudSun, HeartPulse, Sprout, Droplets, Zap];
  const scenarios = [
    {
      name: t("Lower impact", "သက်ရောက်မှု နည်း"),
      assumption: t(
        "Local rainfall remains adequate and heat is manageable, even if Pacific El Niño persists.",
        "ပစိဖိတ်တွင် အယ်လ်နီညို ဆက်ရှိသော်လည်း ဒေသမိုးရေ လုံလောက်ပြီး အပူဒဏ်ကို စီမံနိုင်သည်ဟု ယူဆသည်။",
      ),
      impact: t(
        "Limited disruption; routine water and heat preparations remain useful.",
        "အနှောင့်အယှက် အနည်းငယ်သာရှိနိုင်ပြီး ပုံမှန် ရေနှင့် အပူဒဏ်ပြင်ဆင်မှုက အသုံးဝင်သည်။",
      ),
      action: t(
        "Maintain supplies and monitor local updates.",
        "လိုအပ်သောပစ္စည်းများ ထားရှိပြီး ဒေသသတင်းကို စောင့်ကြည့်ပါ။",
      ),
    },
    {
      name: t("Moderate impact", "သက်ရောက်မှု အလယ်အလတ်"),
      assumption: t(
        "Several local hot spells or rainfall gaps affect water and crops.",
        "ဒေသတွင် အပူပြင်းကာလ သို့မဟုတ် မိုးပြတ်ကာလများကြောင့် ရေနှင့် သီးနှံ ထိခိုက်သည်ဟု ယူဆသည်။",
      ),
      impact: t(
        "Higher irrigation and cooling needs; some work or planting schedules may need adjustment.",
        "ဆည်ရေနှင့် အအေးပေးရန် လိုအပ်မှုတိုးပြီး အလုပ်ချိန် သို့မဟုတ် စိုက်ချိန် ချိန်ညှိရနိုင်သည်။",
      ),
      action: t(
        "Review water supplies, work schedules, and local agricultural advice.",
        "ရေပမာဏ၊ အလုပ်ချိန်နှင့် ဒေသစိုက်ပျိုးရေး အကြံပြုချက်ကို ပြန်လည်စစ်ဆေးပါ။",
      ),
    },
    {
      name: t("Higher impact", "သက်ရောက်မှု များ"),
      assumption: t(
        "Persistent heat combines with rainfall deficit, low water availability, and limited capacity to respond.",
        "အပူကြာရှည်ခြင်း၊ မိုးနည်းခြင်း၊ ရေရှားခြင်းနှင့် တုံ့ပြန်နိုင်စွမ်းနည်းခြင်းတို့ တစ်ပြိုင်နက် ဖြစ်သည်ဟု ယူဆသည်။",
      ),
      impact: t(
        "Compounding pressure on health, livelihoods, water, and essential services is plausible. No magnitude or timing is predicted here.",
        "ကျန်းမာရေး၊ အသက်မွေးဝမ်းကျောင်း၊ ရေနှင့် အခြေခံဝန်ဆောင်မှုများအပေါ် ဖိအားတိုးနိုင်သည်။ ပမာဏနှင့် ဖြစ်မည့်အချိန်ကို ဤနေရာတွင် မခန့်မှန်းပါ။",
      ),
      action: t(
        "Coordinate community support and follow official, location-specific instructions.",
        "ရပ်ရွာအကူအညီ ညှိနှိုင်းပြီး ဒေသအတွက် တရားဝင်ညွှန်ကြားချက်ကို လိုက်နာပါ။",
      ),
    },
  ];
  const s = scenarios[scenario];
  return (
    <>
      <PageTitle
        eyebrow={t("SECTOR IMPACTS", "ကဏ္ဍအလိုက် သက်ရောက်မှု")}
        title={t(
          "Understand what could change.",
          "ဖြစ်နိုင်သော ပြောင်းလဲမှုကို နားလည်ပါ။",
        )}
        description={t(
          "Possible pathways to prepare for—not a prediction that they will occur.",
          "ကြိုတင်ပြင်ဆင်ရန် ဖြစ်နိုင်ခြေများဖြစ်ပြီး သေချာဖြစ်မည်ဟု ခန့်မှန်းခြင်း မဟုတ်ပါ။",
        )}
      />
      <nav className="sector-tabs" aria-label={t("Sectors", "ကဏ္ဍများ")}>
        {sectors.map((x, i) => {
          const Icon = icons[i];
          return (
            <button
              key={x.id}
              aria-pressed={sector === x.id}
              onClick={() => setSector(x.id)}
            >
              <Icon size={22} />
              {t(...x.name)}
            </button>
          );
        })}
      </nav>
      <section className="panel sector-detail">
        <p className="eyebrow">
          {t(
            "GENERAL EVIDENCE · LOCAL OUTCOME UNCERTAIN",
            "အထွေထွေအထောက်အထား · ဒေသရလဒ် မသေချာ",
          )}
        </p>
        <h2>{t(...item.name)}</h2>
        <p className="lead">{t(...item.summary)}</p>
        {item.risks.map((r, i) => (
          <p key={i}>{t(...r)}</p>
        ))}
        <div className="action-strip">
          <h3>{t("What you can do", "သင်လုပ်ဆောင်နိုင်သည်များ")}</h3>
          <p>{t(...item.action)}</p>
        </div>
        {sector === "health" && (
          <a className="text-link" href="#/prepare">
            {t(
              "Heatstroke signs and urgent action",
              "အပူလျှပ်လက္ခဏာနှင့် အရေးပေါ်လုပ်ဆောင်ရန်",
            )}
          </a>
        )}
        <SourceLink href={item.source}>
          {t("Read the source guidance", "မူရင်းလမ်းညွှန်ချက် ဖတ်ရန်")}
        </SourceLink>
      </section>
      <section className="scenario-section">
        <div className="section-heading">
          <p className="eyebrow">
            {t("PLANNING SCENARIOS", "ပြင်ဆင်ရေးအတွက် အခြေအနေများ")}
          </p>
          <h2>
            {t(
              "Prepare for a range of outcomes",
              "အခြေအနေအမျိုးမျိုးအတွက် ပြင်ဆင်ပါ",
            )}
          </h2>
          <p>
            {t(
              "Qualitative scenarios based on general mechanisms. No probabilities or current regional forecasts are assigned.",
              "အထွေထွေဖြစ်စဉ်များအပေါ် အခြေခံသော အခြေအနေများဖြစ်သည်။ ဖြစ်နိုင်နှုန်း သို့မဟုတ် လက်ရှိဒေသခန့်မှန်းချက် မသတ်မှတ်ထားပါ။",
            )}
          </p>
        </div>
        <div className="segmented">
          {scenarios.map((x, i) => (
            <button
              key={i}
              aria-pressed={i === scenario}
              onClick={() => setScenario(i)}
            >
              {x.name}
            </button>
          ))}
        </div>
        <div className="panel scenario-content">
          <h3>{s.name}</h3>
          <dl>
            <dt>{t("Assumption", "ယူဆချက်")}</dt>
            <dd>{s.assumption}</dd>
            <dt>{t("Possible impact", "ဖြစ်နိုင်သော သက်ရောက်မှု")}</dt>
            <dd>{s.impact}</dd>
            <dt>{t("Practical preparation", "လက်တွေ့ပြင်ဆင်ရန်")}</dt>
            <dd>{s.action}</dd>
            <dt>{t("Confidence", "ယုံကြည်နိုင်မှု")}</dt>
            <dd>
              {t(
                "Local likelihood not assessed. There is not enough local evidence to assign a confidence level.",
                "ဒေသဖြစ်နိုင်ခြေကို မသုံးသပ်ထားပါ။ ယုံကြည်နိုင်မှုအဆင့် သတ်မှတ်ရန် ဒေသအထောက်အထား မလုံလောက်ပါ။",
              )}
            </dd>
          </dl>
        </div>
        <Notice>
          {t(
            "These scenarios are not a warning, a forecast, or a ranking of Myanmar’s regions. They should not be used to make crop-investment or evacuation decisions alone.",
            "ဤအခြေအနေများသည် သတိပေးချက်၊ ခန့်မှန်းချက် သို့မဟုတ် မြန်မာဒေသများ၏ အဆင့်သတ်မှတ်ချက် မဟုတ်ပါ။ စိုက်ပျိုးရင်းနှီးမြှုပ်နှံမှုနှင့် ဘေးလွတ်ရာရွှေ့ပြောင်းရေးကို ဤအချက်တစ်ခုတည်းဖြင့် မဆုံးဖြတ်ပါနှင့်။",
          )}
        </Notice>
      </section>
    </>
  );
}
