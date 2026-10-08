import { useEffect, useState } from "react";
import { useApp, dateLabel } from "../app/context";
import { PageTitle, SourceLink } from "../components/shared";
import { LocationSelect } from "../components/LocationSelect";
import { StateLabel } from "../components/Intelligence";
import {
  healthTopics,
  healthSources,
  healthReviewedAt,
  burmeseHealthResources,
} from "../data/healthGuidance";
import {
  surveillance,
  surveillanceState,
  reportsForLocation,
} from "../data/surveillance";
import { canonicalLocation, locationName } from "../risk/locations";
import { regionalRows } from "../risk/intelligence";
import { SignalCard } from "../components/Operational";
import { reviewedState } from "../data/sources";
import "../styles/health.css";
function readSelection() {
  const q = new URLSearchParams(location.hash.split("?")[1]);
  return {
    region: canonicalLocation(q.get("region")),
    topic:
      healthTopics.find((x) => x.id === q.get("topic"))?.id ?? "heatstroke",
  };
}
export default function Health() {
  const { t, lang, operational: op, data, now } = useApp();
  const [selection, setSelection] = useState(readSelection);
  useEffect(() => {
    const sync = () => setSelection(readSelection());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  function change(next: Partial<typeof selection>) {
    const updated = { ...selection, ...next };
    setSelection(updated);
    location.hash = `/health?${new URLSearchParams(updated)}`;
  }
  const topic = healthTopics.find((x) => x.id === selection.topic)!;
  const rows = regionalRows(op, data, now).filter(
    (r) => selection.region === "MM" || r.id === selection.region,
  );
  const environmental = rows.flatMap((r) =>
    r.signals.filter(
      (s) => ["heat", "rain"].includes(s.hazard) && s.level !== "unknown",
    ),
  );
  const reports = reportsForLocation(selection.region);
  const sections = [
    ["signs", "EARLY SIGNS", "အစောပိုင်း လက္ခဏာများ"],
    ["now", "WHAT TO DO NOW · FIRST AID", "ယခုလုပ်ရန် · ရှေးဦးပြုစုခြင်း"],
    ["care", "SEEK MEDICAL CARE IF", "ဆေးကုသမှု ရယူရမည့်အချိန်"],
    [
      "emergency",
      "GET URGENT MEDICAL HELP IF",
      "အရေးပေါ်ဆေးကုသမှု ချက်ချင်းလိုသည့် လက္ခဏာများ",
    ],
    ["prevention", "PREVENTION", "ကာကွယ်ရေး"],
  ] as const;
  return (
    <div className="health-page">
      <PageTitle
        eyebrow={t(
          "HEALTH · RECOGNIZE & RESPOND",
          "ကျန်းမာရေး · သတိပြု၍ တုံ့ပြန်ရန်",
        )}
        title={t(
          "Know the signs. Act early.",
          "လက္ခဏာသိ၍ စောစီးစွာ ဆောင်ရွက်ပါ။",
        )}
        description={t(
          "Public first aid and care thresholds, not a diagnosis. El Niño does not directly cause infection.",
          "ရောဂါသတ်မှတ်ချက် မဟုတ်သော ရှေးဦးပြုစုမှုနှင့် ကုသမှုလိုချိန် လမ်းညွှန်။ အယ်လ်နီညိုကြောင့် ရောဂါပိုး တိုက်ရိုက်မကူးစက်ပါ။",
        )}
      />
      <div className="health-emergency panel padded">
        <strong>
          {t("EMERGENCY — ACT NOW", "အရေးပေါ် — ချက်ချင်းဆောင်ရွက်ပါ")}
        </strong>
        <p>
          {t(
            "In heat: confusion, seizures or unconsciousness can signal heatstroke. Get emergency medical help and begin cooling immediately. Do not wait for an app alert.",
            "ပူပြင်းချိန် စိတ်ရှုပ်ထွေး၊ တက် သို့မဟုတ် သတိလစ်ခြင်းသည် အပူလျှပ်လက္ခဏာ ဖြစ်နိုင်သည်။ အရေးပေါ်ဆေးအကူအညီ ရယူပြီး ချက်ချင်းအအေးပေးပါ။ အက်ပ်သတိပေးချက်ကို မစောင့်ပါနှင့်။",
          )}
        </p>
        <a
          href={`#/health?region=${selection.region}&topic=heatstroke`}
          onClick={() =>
            requestAnimationFrame(() =>
              document
                .getElementById("health-guidance")
                ?.scrollIntoView({ block: "start" }),
            )
          }
        >
          {t("Heatstroke first aid below", "အောက်ပါ အပူလျှပ် ရှေးဦးပြုစုမှု")}
        </a>
      </div>
      <LocationSelect
        id="health-region"
        value={selection.region}
        onChange={(region) => change({ region })}
      />
      <section className="panel padded health-environment">
        <h2>
          {t("Environmental context for", "ဒေသပတ်ဝန်းကျင်အခြေအနေ —")}{" "}
          {locationName(selection.region, lang)}
        </h2>
        <p className="evidence-label">
          {t(
            "FORECAST · HEAT / RAIN SCREENING",
            "ခန့်မှန်းချက် · အပူ / မိုး စစ်ဆေးမှု",
          )}
        </p>
        <p>
          {environmental.length
            ? t(
                `${environmental.length}/${rows.length * 2} heat/rain inputs are usable. These describe potential exposure, not infections or patients.`,
                `အပူ/မိုး ဒေတာ ${environmental.length}/${rows.length * 2} ခု အသုံးပြုနိုင်သည်။ ဘေးနှင့် ထိတွေ့နိုင်ခြေကိုသာ ဖော်ပြပြီး ရောဂါနှင့် လူနာကို မဖော်ပြပါ။`,
              )
            : t(
                "Environmental evidence unavailable. All health guidance remains accessible; missing weather does not mean no health risk.",
                "ပတ်ဝန်းကျင်ဒေတာ မရရှိပါ။ ကျန်းမာရေးလမ်းညွှန်ကို ဆက်ဖတ်နိုင်သည်။ မိုးလေဝသဒေတာမရှိခြင်းသည် ကျန်းမာရေးအန္တရာယ်မရှိဟု မဆိုလိုပါ။",
              )}
        </p>
        {selection.region !== "MM" && (
          <div className="signal-grid">
            {rows[0]?.signals
              .filter((s) => ["heat", "rain"].includes(s.hazard))
              .map((s) => (
                <SignalCard key={s.hazard} signal={s} compact />
              ))}
          </div>
        )}
        <a
          href={`#/impacts?region=${selection.region}&sector=health&evidence=forecast`}
        >
          {t(
            "Inspect local heat / rain, dates and sources",
            "ဒေသအပူ / မိုး၊ ရက်စွဲနှင့် ရင်းမြစ် ကြည့်ရန်",
          )}
        </a>
      </section>
      <div className="health-topic-picker">
        <label htmlFor="health-topic">
          {t("Health topic", "ကျန်းမာရေးအကြောင်းအရာ")}
        </label>
        <select
          id="health-topic"
          value={topic.id}
          onChange={(e) => change({ topic: e.target.value })}
        >
          {healthTopics.map((x) => (
            <option key={x.id} value={x.id}>
              {t(...x.name)}
            </option>
          ))}
        </select>
      </div>
      <article
        id="health-guidance"
        className="panel padded health-topic"
        data-topic={topic.id}
      >
        <h2>{t(...topic.name)}</h2>
        <p className="evidence-label">
          {t(
            "SCENARIO · PUBLIC HEALTH GUIDANCE",
            "ဖြစ်နိုင်သည့်အခြေအနေ · ကျန်းမာရေးလမ်းညွှန်",
          )}
        </p>
        <p className="health-pathway">{t(...topic.pathway)}</p>
        <p>
          <strong>{t("Who needs extra care:", "အထူးဂရုစိုက်ရန် —")}</strong>{" "}
          {t(...topic.vulnerable)}
        </p>
        <div className="health-guidance-grid">
          {sections.map(([field, en, my]) => (
            <section key={field} className={`health-step health-${field}`}>
              <h3>{t(en, my)}</h3>
              <p>{t(...topic[field])}</p>
            </section>
          ))}
        </div>
        <div className="health-references">
          <h3>{t("OFFICIAL SOURCE", "တရားဝင် ရင်းမြစ်")}</h3>
          {topic.sources.map((id) => {
            const s = healthSources[id];
            return (
              <p key={id}>
                <SourceLink href={s.url}>
                  {s.publisher} · {s.title}
                </SourceLink>
                <span className="meta">
                  {" "}
                  ·{" "}
                  {s.date
                    ? dateLabel(s.date, lang)
                    : t("Publication date not stated", "ထုတ်ပြန်ရက် မဖော်ပြ")}
                </span>
              </p>
            );
          })}
          <p className="meta">
            {t("Guidance review", "လမ်းညွှန် ပြန်စစ်ရက်")}:{" "}
            {dateLabel(healthReviewedAt, lang)} ·{" "}
            <StateLabel state={reviewedState(healthReviewedAt, 90, 180, now)} />
          </p>
        </div>
        <p>
          {t(
            "Use a reachable local emergency service or nearest health facility. No verified nationwide emergency number is supplied here. This guide cannot assess an individual.",
            "ဆက်သွယ်နိုင်သော ဒေသအရေးပေါ်ဝန်ဆောင်မှု သို့မဟုတ် အနီးဆုံးကျန်းမာရေးဌာနသို့ ဆက်သွယ်ပါ။ အတည်ပြုထားသော နိုင်ငံတစ်ဝန်းအရေးပေါ်ဖုန်းကို ဤနေရာတွင် မဖော်ပြထားပါ။ ဤလမ်းညွှန်သည် တစ်ဦးချင်းကို မစစ်ဆေးနိုင်ပါ။",
          )}
        </p>
        <a href="#/prepare">
          {t(
            "Prepare supplies and a household plan",
            "လိုအပ်ပစ္စည်းနှင့် အိမ်ထောင်စုအစီအစဉ် ပြင်ဆင်ရန်",
          )}
        </a>
      </article>
      <section className="panel padded surveillance">
        <h2>
          {t(
            "DISEASE SURVEILLANCE · DATED REPORT",
            "ရောဂါစောင့်ကြည့်မှု · ရက်စွဲပါ အစီရင်ခံစာ",
          )}
        </h2>
        <StateLabel state={surveillanceState(now)} />
        <p className="evidence-label">
          {t(
            "OBSERVED · REPORTED EVENTS, NOT A CURRENT CASE COUNT",
            "ဖြစ်ပွားမှု အစီရင်ခံချက် · လက်ရှိလူနာအရေအတွက် မဟုတ်",
          )}
        </p>
        <p>
          {t("Report period", "အစီရင်ခံကာလ")}: {surveillance.period} ·{" "}
          {t("Published", "ထုတ်ပြန်")}: {dateLabel(surveillance.issuedAt, lang)}
        </p>
        {reports.map((r) => (
          <p key={r.id}>{t(...r.text)}</p>
        ))}
        {!reports.length && (
          <p>
            {t(
              "No location-specific report in this reviewed bulletin. This does not establish zero cases.",
              "စစ်ဆေးထားသော ဤစာတမ်း၌ ရွေးထားသောဒေသအတွက် အချက်အလက် မပါပါ။ လူနာမရှိဟု မဆိုလိုပါ။",
            )}
          </p>
        )}
        <p>
          {t(
            "Current comparable regional incidence: AUTHORITATIVE DATA NOT CURRENTLY AVAILABLE. Reporting access is incomplete. This report never changes weather-derived concern.",
            "နှိုင်းယှဉ်နိုင်သော လက်ရှိဒေသလူနာနှုန်း — လက်ရှိ ယုံကြည်စိတ်ချရသော ဒေတာ မရရှိပါ။ အစီရင်ခံလွှမ်းခြုံမှု မပြည့်စုံပါ။ ဤစာတမ်းသည် မိုးလေဝသအခြေပြု စစ်ဆေးအဆင့်ကို မပြောင်းလဲပါ။",
          )}
        </p>
        <SourceLink href={surveillance.url}>
          {surveillance.publisher} · {surveillance.title}
        </SourceLink>
        <p className="meta">
          {t("Reviewed", "ပြန်စစ်")}: {dateLabel(surveillance.reviewedAt, lang)}
        </p>
      </section>
      <section className="panel padded">
        <h2>
          {t(
            "Official resources in Burmese",
            "မြန်မာဘာသာ တရားဝင်လမ်းညွှန်များ",
          )}
        </h2>
        <ul>
          {burmeseHealthResources.map((s) => (
            <li key={s.url}>
              <SourceLink href={s.url}>{t(...s.name)}</SourceLink>
            </li>
          ))}
        </ul>
        <p>
          {t(
            "The English and Burmese summaries are editorial adaptations; independent clinical and native-language review remains a release limitation. Original WHO materials are linked above.",
            "အင်္ဂလိပ်နှင့် မြန်မာအကျဉ်းချုပ်များကို ရေးသားပြင်ဆင်ထားသည်။ သီးခြားဆေးဘက်နှင့် မြန်မာဘာသာကျွမ်းကျင်သူ၏ စစ်ဆေးမှု မပြီးသေးခြင်းသည် ဤထုတ်ဝေမှု၏ အကန့်အသတ်ဖြစ်သည်။ WHO မူရင်းများကို အထက်တွင် ချိတ်ထားသည်။",
          )}
        </p>
        <a href="#/data">
          {t("Sources and review policy", "ရင်းမြစ်နှင့် ပြန်စစ်မူဝါဒ")}
        </a>
      </section>
    </div>
  );
}
