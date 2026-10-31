import { useApp } from "../app/context";
import { localBriefing } from "../risk/briefing";
import { regionName } from "../data/regions";
import { townshipByCode } from "../data/locations";
import { number } from "../data/presentation";
import { mmt } from "../data/operational";
import { Source } from "./Service";
export default function LocalBriefing({
  regionId,
  townshipCode,
}: { regionId?: string; townshipCode?: string } = {}) {
  const {
    operational,
    data,
    selected: contextRegion,
    township: contextTownship,
    now,
    t,
    lang,
  } = useApp();
  const selected = regionId || contextRegion,
    township = townshipCode || contextTownship;
  const brief = localBriefing(operational, data, selected, now),
    area = townshipByCode(township);
  return (
    <section
      className="surface padded local-briefing"
      aria-labelledby="briefing-title"
    >
      <p className="eyebrow">
        {t(
          "YOUR DAILY BRIEFING · SOURCE-BASED TEMPLATE",
          "နေ့စဉ် အကျဉ်းချုပ် · ရင်းမြစ်အခြေခံ စာသားပုံစံ",
        )}
      </p>
      <h2 id="briefing-title">{area?.[lang] || regionName(selected, lang)}</h2>
      {area && (
        <p className="small">
          {t("Weather context from", "မိုးလေဝသနောက်ခံရင်းမြစ်ဒေသ")}{" "}
          {regionName(selected, lang)} ·{" "}
          {t("not township measurements", "မြို့နယ် တိုင်းတာချက် မဟုတ်ပါ")}
        </p>
      )}
      <p>
        {brief.forecast
          ? t(
              `The latest regional model snapshot estimates ${number(brief.forecast.temperature, lang)}°C. Today's high / low: ${number(brief.forecast.high, lang)}° / ${number(brief.forecast.low, lang)}°. Rain in the next 24 hours: ${number(brief.forecast.rain24, lang)} mm. Local conditions can differ.`,
              `နောက်ဆုံးဒေသမော်ဒယ်အရ အပူချိန် ${number(brief.forecast.temperature, lang)}°C ဖြစ်သည်။ ယနေ့ အမြင့်ဆုံး ${number(brief.forecast.high, lang)}°C၊ အနိမ့်ဆုံး ${number(brief.forecast.low, lang)}°C နှင့် လာမည့် 24 နာရီ မိုးရေ ${number(brief.forecast.rain24, lang)} mm ခန့်မှန်းထားသည်။ နေရာအလိုက် ကွာခြားနိုင်သည်။`,
            )
          : t(
              "Current forecast evidence is unavailable or delayed. Check the dated weather page and original sources before making plans.",
              "လက်ရှိခန့်မှန်းဒေတာ မရရှိ သို့မဟုတ် နောက်ကျနေသည်။ စီစဉ်မီ မိုးလေဝသစာမျက်နှာရှိ မူရင်းရက်စွဲနှင့် ရင်းမြစ်ကို စစ်ဆေးပါ။",
            )}
      </p>
      <p>
        {brief.official.length
          ? t(
              "Verified parent-region notices are listed in Safety. Follow their original instructions and validity.",
              "အတည်ပြု ပြည်နယ်/တိုင်းကြေညာချက်များကို ဘေးကင်းရေးတွင် ကြည့်နိုင်သည်။ မူရင်းညွှန်ကြားချက်နှင့် သက်တမ်းကို လိုက်နာပါ။",
            )
          : brief.officialCoverageCurrent
            ? t(
                "No active parent-region notice was found in the connected coverage. This is not an all-clear for a township.",
                "ချိတ်ထားသောဒေတာတွင် သက်တမ်းရှိ ပြည်နယ်/တိုင်းကြေညာချက် မတွေ့ပါ။ မြို့နယ် ဘေးကင်းကြောင်း ကြေညာခြင်း မဟုတ်ပါ။",
              )
            : t(
                "Official warning coverage is incomplete. An empty list cannot establish that your area is safe.",
                "တရားဝင်သတိပေးဒေတာ မပြည့်စုံပါ။ စာရင်းဗလာဖြစ်ခြင်းသည် သင့်ဒေသ ဘေးကင်းကြောင်း မဆိုလိုပါ။",
              )}
      </p>
      <a href="#/safety">
        {t(
          "Official notices and preparedness",
          "တရားဝင်ကြေညာချက်နှင့် ကြိုတင်ပြင်ဆင်ရေး",
        )}{" "}
        →
      </a>
      <p>
        {t(
          "Preparedness: review your local evacuation plan, keep essential supplies ready, and check official instructions. These are general steps, not a prediction of an event.",
          "ကြိုတင်ပြင်ဆင်ရန်။ ဒေသဘေးလွတ်ရာအစီအစဉ်ကို ပြန်ကြည့်၊ အရေးကြီးပစ္စည်းများ အသင့်ထားပြီး တရားဝင်ညွှန်ကြားချက် စစ်ဆေးပါ။ ယေဘုယျအချက်များသာဖြစ်ပြီး ဖြစ်စဉ်ခန့်မှန်းချက် မဟုတ်ပါ။",
        )}
      </p>
      {brief.forecastAt && (
        <p className="small muted">
          {t("Model time", "မော်ဒယ်အချိန်")} {mmt(brief.forecastAt, lang)} ·{" "}
          {t("Retrieved", "ရယူချိန်")} {mmt(brief.retrievedAt!, lang)}
        </p>
      )}
      <Source id="temperature" /> <Source id="official-warning" />{" "}
      <Source id="safety-flood" />
    </section>
  );
}
