import { useState } from "react";
import { HeartPulse, Sprout, Droplets, Zap } from "lucide-react";
import { useApp } from "../app/context";
import { PageTitle, Notice, Level, SourceLink } from "../components/shared";
import { Evidence, SignalCard } from "../components/Operational";
import { regions, regionName } from "../data/regions";
import { signalsFor, type Hazard } from "../risk/signals";
import { rank } from "../risk/engine";
import type { Severity } from "../data/schema";
const sectors = [
  {
    id: "health",
    name: ["Health", "ကျန်းမာရေး"],
    icon: HeartPulse,
    hazards: ["heat", "rain"],
    meaning: [
      "Heat can increase dehydration and heat illness; heavy rainfall can interrupt safe water access. Older people, children and outdoor workers need additional support.",
      "အပူကြောင့် ရေဓာတ်ခန်းခြောက်ခြင်းနှင့် အပူဒဏ်ဖျားနာမှု တိုးနိုင်ပြီး မိုးသည်းထန်လျှင် သန့်ရှင်းရေ ရရှိမှု ထိခိုက်နိုင်သည်။ သက်ကြီးရွယ်အို၊ ကလေးနှင့် ပြင်ပလုပ်သားများကို အထူးဂရုစိုက်ပါ။",
    ],
    source:
      "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
  },
  {
    id: "agriculture",
    name: ["Agriculture", "စိုက်ပျိုးရေး"],
    icon: Sprout,
    hazards: ["agriculture"],
    meaning: [
      "Heat, heavy rain and rainfall deficits can strain crops and field work. Actual effects depend on crop stage, soils and irrigation; these signals do not establish crop loss.",
      "အပူ၊ မိုးသည်းထန်မှုနှင့် မိုးနည်းခြင်းက သီးနှံနှင့် လယ်ယာလုပ်ငန်းကို ဖိအားပေးနိုင်သည်။ အမှန်တကယ်သက်ရောက်မှုမှာ သီးနှံအဆင့်၊ မြေနှင့် ရေပေးမှုအပေါ် မူတည်ပြီး သီးနှံဆုံးရှုံးမှုကို ဤညွှန်းကိန်းက မအတည်ပြုပါ။",
    ],
    source: "https://www.fao.org/el-nino/en/",
  },
  {
    id: "water",
    name: ["Water", "ရေ"],
    icon: Droplets,
    hazards: ["water", "rain"],
    meaning: [
      "A prolonged rainfall deficit can pressure local supplies; heavy rain can contaminate exposed sources. Confirm actual storage, treatment and river conditions locally.",
      "မိုးရေကြာရှည်လျော့နည်းမှုက ရေရရှိမှုကို ဖိအားပေးနိုင်ပြီး မိုးသည်းထန်လျှင် ရေအရင်းအမြစ် ညစ်ညမ်းနိုင်သည်။ ရေလက်ကျန်၊ သန့်စင်မှုနှင့် မြစ်ရေအခြေအနေကို ဒေသတွင် စစ်ဆေးပါ။",
    ],
    source: "https://www.who.int/news-room/fact-sheets/detail/drinking-water",
  },
  {
    id: "energy",
    name: ["Energy", "စွမ်းအင်"],
    icon: Zap,
    hazards: ["heat", "water", "wind"],
    meaning: [
      "Heat may increase cooling needs. Persistent rainfall deficits can pressure hydropower, and strong winds can damage exposed infrastructure. No outage or generation forecast is available.",
      "အပူကြောင့် အအေးပေးရန် လိုအပ်ချက်တိုးနိုင်သည်။ မိုးရေကြာရှည်နည်းလျှင် ရေအားလျှပ်စစ်ကို ဖိအားပေးနိုင်ပြီး လေပြင်းက အဆောက်အအုံနှင့် လျှပ်စစ်ပစ္စည်း ထိခိုက်စေနိုင်သည်။ မီးပြတ်မှုနှင့် ထုတ်လုပ်ပမာဏကို မခန့်မှန်းထားပါ။",
    ],
    source: "https://wmo.int/topics/energy",
  },
] as const;
export default function Impacts() {
  const { t, lang, data, now, operational: op } = useApp();
  const [selected, setSelected] = useState("health");
  const sector = sectors.find((s) => s.id === selected)!;
  const assessed = regions
    .map((r) => ({
      id: r[0],
      signals: signalsFor(op, data, r[0], now)
        .filter(
          (s) =>
            (sector.hazards as readonly Hazard[]).includes(s.hazard) &&
            s.level !== "unknown",
        )
        .sort((a, b) => rank[b.level as Severity] - rank[a.level as Severity]),
    }))
    .filter((r) => r.signals.length);
  const affected = assessed
    .filter((r) => r.signals[0].level !== "normal")
    .sort(
      (a, b) =>
        rank[b.signals[0].level as Severity] -
        rank[a.signals[0].level as Severity],
    );
  return (
    <>
      <PageTitle
        eyebrow={t(
          "CURRENT CONDITIONS → PRACTICAL ACTION",
          "လက်ရှိအခြေအနေ → လက်တွေ့လုပ်ဆောင်ရန်",
        )}
        title={t(
          "What the conditions mean for you.",
          "ယခုအခြေအနေက သင့်အတွက် ဘာကိုဆိုလိုသလဲ။",
        )}
        description={t(
          "Weather-linked planning guidance, grounded in each region’s current forecast and dated recent climate evidence.",
          "ဒေသခန့်မှန်းချက်နှင့် ရက်စွဲပါ မကြာသေးမီ ရာသီဥတုအထောက်အထားအပေါ် အခြေခံသော ပြင်ဆင်ရေးလမ်းညွှန်။",
        )}
      />
      <nav className="sector-tabs" aria-label={t("Sectors", "ကဏ္ဍများ")}>
        {sectors.map((s) => (
          <button
            key={s.id}
            aria-pressed={selected === s.id}
            onClick={() => setSelected(s.id)}
          >
            <s.icon size={22} />
            {t(s.name[0], s.name[1])}
          </button>
        ))}
      </nav>
      <section className="panel padded">
        <p className="eyebrow">
          {t(
            "INFERRED IMPACT · SYSTEM SCREENING",
            "ဖြစ်နိုင်သောသက်ရောက်မှု · စနစ်တွက်ချက်မှု",
          )}
        </p>
        <div className="row spread">
          <h2>{t(sector.name[0], sector.name[1])}</h2>
          <Level
            level={
              affected[0]?.signals[0].level ??
              (assessed.length ? "normal" : "unknown")
            }
          />
        </div>
        <p className="lead">
          {affected.length} / 15{" "}
          {t(
            "regions have an elevated weather-based planning signal.",
            "ဒေသတွင် ရာသီဥတုအခြေခံ မြင့်တက်ပြင်ဆင်ရေးညွှန်းကိန်း ရှိသည်။",
          )}
        </p>
        <p>
          {assessed.length} / 15{" "}
          {t(
            "regions have usable inputs for at least one sector driver. This is not an observed impact count.",
            "ဒေသတွင် ကဏ္ဍအကြောင်းရင်း အနည်းဆုံးတစ်ခုအတွက် သုံးနိုင်သောဒေတာ ရှိသည်။ အမှန်တကယ် ထိခိုက်မှုအရေအတွက် မဟုတ်ပါ။",
          )}
        </p>
        <p>{t(sector.meaning[0], sector.meaning[1])}</p>
        <SourceLink href={sector.source}>
          {t("Sector guidance", "ကဏ္ဍလမ်းညွှန်ချက်")}
        </SourceLink>
        <Evidence />
      </section>
      <h2>
        {t("Regions needing most attention", "ဦးစားပေး သတိပြုရန်ဒေသများ")}
      </h2>
      {affected.length ? (
        <div className="signal-grid">
          {affected.slice(0, 6).map((r) => (
            <SignalCard key={r.id} signal={r.signals[0]} region={r.id} />
          ))}
        </div>
      ) : (
        <Notice>
          {t(
            "No elevated signal is available for this sector. Missing inputs and local vulnerabilities may still matter.",
            "ဤကဏ္ဍအတွက် မြင့်တက်ညွှန်းကိန်း မရရှိပါ။ မရရှိသောဒေတာနှင့် ဒေသထိခိုက်လွယ်မှုကို ဆက်လက်ထည့်တွက်ရန် လိုသည်။",
          )}
        </Notice>
      )}
      {affected.length > 6 && (
        <details className="panel padded">
          <summary>
            {t("All affected regions", "ညွှန်းကိန်းရှိ ဒေသအားလုံး")}
          </summary>
          <ul>
            {affected.map((r) => (
              <li key={r.id}>
                <a href={`#/region/${r.id}`}>{regionName(r.id, lang)}</a>{" "}
                <Level level={r.signals[0].level} />
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className="action-strip">
        <h3>
          {t(
            "Prepare for your household or workplace",
            "အိမ်နှင့် လုပ်ငန်းခွင်အတွက် ပြင်ဆင်ပါ",
          )}
        </h3>
        <a className="button primary" href="#/prepare">
          {t("Open preparedness checklist", "ပြင်ဆင်ရန်စာရင်း ဖွင့်ပါ")}
        </a>
      </div>
      <Notice>
        {t(
          "These are potential impacts inferred from weather, not confirmed damage, disease forecasts or official warnings. Forecast confidence is not locally calibrated.",
          "ဤသည် မိုးလေဝသအခြေခံ ဖြစ်နိုင်သောသက်ရောက်မှုဖြစ်ပြီး အတည်ပြုပျက်စီးမှု၊ ရောဂါခန့်မှန်းချက် သို့မဟုတ် တရားဝင်သတိပေးချက် မဟုတ်ပါ။ ဒေသခန့်မှန်းယုံကြည်နိုင်မှုကို အတည်မပြုရသေးပါ။",
        )}
      </Notice>
    </>
  );
}
