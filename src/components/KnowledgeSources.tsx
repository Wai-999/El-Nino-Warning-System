import { useApp, dateLabel } from "../app/context";
import { healthSources, healthReviewedAt } from "../data/healthGuidance";
import { SourceLink } from "./shared";
export function KnowledgeSources() {
  const { t, lang } = useApp();
  return (
    <>
      <section className="panel padded">
        <h2>
          {t(
            "Health guidance: sources and scope",
            "ကျန်းမာရေးလမ်းညွှန် — ရင်းမြစ်နှင့် အတိုင်းအတာ",
          )}
        </h2>
        <p>
          {t(
            "General public first aid, symptoms and care thresholds are reviewed separately from weather and disease surveillance. No diagnosis, drug dose or incidence is calculated. Each topic links its clinical references. Review age becomes aging after 90 days and stale after 180 days; urgent first aid remains accessible.",
            "အထွေထွေ ရှေးဦးပြုစုမှု၊ လက္ခဏာနှင့် ကုသရန်အချိန်ကို မိုးလေဝသ၊ ရောဂါစောင့်ကြည့်မှုနှင့် သီးခြားစစ်သည်။ ရောဂါသတ်မှတ်၊ ဆေးပမာဏ၊ လူနာနှုန်း မတွက်ပါ။ ခေါင်းစဉ်တစ်ခုစီတွင် ဆေးဘက်ရင်းမြစ် ပါသည်။ ပြန်စစ်ပြီး ရက် ၉၀ ကျော်လျှင် ဟောင်းလာ၊ ၁၈၀ ကျော်လျှင် သက်တမ်းကျော်ဟု ပြပြီး ရှေးဦးပြုစုမှု ဆက်ဖတ်နိုင်သည်။",
          )}
        </p>
        <p>
          {t("Last reviewed", "နောက်ဆုံးပြန်စစ်")}:{" "}
          {dateLabel(healthReviewedAt, lang)}
        </p>
        <details>
          <summary>
            {t("Clinical source catalogue", "ဆေးဘက်ရင်းမြစ် စာရင်း")}
          </summary>
          <ul>
            {Object.values(healthSources).map((s) => (
              <li key={s.url}>
                <SourceLink href={s.url}>
                  {s.publisher} · {s.title}
                </SourceLink>{" "}
                · {s.date ?? t("Date not stated", "ရက်စွဲ မဖော်ပြ")}
              </li>
            ))}
          </ul>
        </details>
        <p>
          {t(
            "The dated WHO Health Cluster bulletin is a separate report, not complete current surveillance. Its freshness uses publication age: current through 30 days, aging through 60, then stale. Unmentioned regions are unknown, never zero cases.",
            "ရက်စွဲပါ WHO Health Cluster စာတမ်းသည် သီးခြားအစီရင်ခံစာဖြစ်ပြီး လက်ရှိစောင့်ကြည့်ဒေတာစုံ မဟုတ်ပါ။ ထုတ်ပြန်ပြီး ရက် ၃၀ အထိ လက်ရှိ၊ ရက် ၆၀ အထိ ဟောင်းလာ၊ ထို့နောက် သက်တမ်းကျော်ဟု ပြသည်။ မဖော်ပြဒေသသည် မသိရခြင်းဖြစ်ပြီး လူနာသုည မဟုတ်ပါ။",
          )}
        </p>
        <a href="#/health">
          {t(
            "Health guidance and original Burmese resources",
            "ကျန်းမာရေးလမ်းညွှန်နှင့် မူရင်းမြန်မာဘာသာ ရင်းမြစ်များ",
          )}
        </a>
      </section>
      <section className="panel padded">
        <h2>
          {t(
            "Missing-data research · reviewed 4 October 2026",
            "မရရှိသောဒေတာ သုတေသန · ၂၀၂၆ အောက်တိုဘာ ၄ ပြန်စစ်",
          )}
        </h2>
        <p>
          {t(
            "Search order: Myanmar official → ASEAN → UN / international operational → research → validated derived indicators. Authoritative sources exist for several gaps, but geographic resolution, access and validation are not yet sufficient to connect them safely.",
            "ရှာဖွေစဉ် — မြန်မာတရားဝင် → အာဆီယံ → UN / နိုင်ငံတကာလုပ်ငန်းရင်းမြစ် → သုတေသန → အတည်ပြုတွက်ချက်ညွှန်းကိန်း။ ကွက်လပ်အချို့တွင် ရင်းမြစ်ရှိသော်လည်း ဒေသအရွယ်အစား၊ ရယူခွင့်နှင့် အတည်ပြုမှု မလုံလောက်သေးပါ။",
          )}
        </p>
        <ul>
          <li>
            <SourceLink href="https://www.dmh.gov.mm/">Myanmar DMH</SourceLink>{" "}
            —{" "}
            {t(
              "official warnings: no reliable structured validity/geography feed verified; coverage remains unavailable.",
              "တရားဝင်သတိပေး — သက်တမ်း/ဒေသပါ ယုံကြည်ရသောဒေတာစီးကြောင်း မအတည်ပြုနိုင်သေး၍ လွှမ်းခြုံမှု မရရှိ။",
            )}
          </li>
          <li>
            <SourceLink href="https://www.globalfloods.eu/general-information/data-and-services/">
              Copernicus GloFAS
            </SourceLink>{" "}
            —{" "}
            {t(
              "river forecasts need catchment mapping and threshold validation; heavy rain is not inundation.",
              "မြစ်ခန့်မှန်းချက်အတွက် ရေဝေရေလဲခွဲခြားမှုနှင့် သတ်မှတ်ချက်အတည်ပြုရန် လိုသည်။ မိုးသည်းသည် ရေလွှမ်းမှု မဟုတ်။",
            )}
          </li>
          <li>
            <SourceLink href="https://www.fao.org/giews/earthobservation/access.jsp">
              FAO GIEWS / ASIS
            </SourceLink>{" "}
            —{" "}
            {t(
              "vegetation/crop stress requires local crop masks and a defined baseline; not a yield-loss estimate.",
              "အပင်/သီးနှံဖိအားအတွက် ဒေသသီးနှံဧရိယာနှင့် ရည်ညွှန်းကာလ လိုသည်။ အထွက်ဆုံးရှုံးမှု ခန့်မှန်းချက် မဟုတ်။",
            )}
          </li>
          <li>
            <SourceLink href="https://firms.modaps.eosdis.nasa.gov/content/academy/data_api/firms_api_use.html">
              NASA FIRMS
            </SourceLink>{" "}
            —{" "}
            {t(
              "API key and hotspot validation required; hotspots do not measure smoke exposure.",
              "API key နှင့် အပူအစက်အတည်ပြုမှု လိုသည်။ အပူအစက်သည် မီးခိုးထိတွေ့မှု မတိုင်းတာ။",
            )}
          </li>
          <li>
            <SourceLink href="https://asmc.asean.org/asmc-haze-hotspot-daily/">
              ASMC haze monitoring
            </SourceLink>{" "}
            —{" "}
            {t(
              "regional context does not establish local air quality or a Myanmar official alert.",
              "ဒေသနောက်ခံသည် ဒေသလေထုအရည်အသွေး သို့မဟုတ် မြန်မာတရားဝင်သတိပေးချက် မဟုတ်။",
            )}
          </li>
          <li>
            <SourceLink href="https://wmo.int/resources/publication-series/global-seasonal-climate-updates/gscu-son2026">
              WMO GSCU · SON 2026
            </SourceLink>{" "}
            —{" "}
            {t(
              "ocean-driver outlook, issued 3 September; seasonal context cannot replace local observations.",
              "စက်တင်ဘာ ၃ ထုတ် ပင်လယ်အကြောင်းရင်း မျှော်မှန်းချက်။ ရာသီနောက်ခံကို ဒေသတိုင်းတာချက်အစား မသုံးရ။",
            )}
          </li>
        </ul>
        <p>
          {t(
            "Current local disease incidence, validated drought, flood inundation, smoke exposure, crop damage and losses: AUTHORITATIVE DATA NOT CURRENTLY AVAILABLE in this application. Next research review: 4 November 2026; this is a review target, not an automated subscription.",
            "ဤစနစ်တွင် လက်ရှိဒေသလူနာနှုန်း၊ အတည်ပြုမိုးခေါင်၊ ရေလွှမ်း၊ မီးခိုးထိတွေ့မှု၊ သီးနှံပျက်စီးနှင့် ဆုံးရှုံးမှု — လက်ရှိ ယုံကြည်စိတ်ချရသော ဒေတာ မရရှိပါ။ နောက်ပြန်စစ်ရန်ရက် — ၂၀၂၆ နိုဝင်ဘာ ၄၊ အလိုအလျောက်သတင်းဝန်ဆောင်မှု မဟုတ်ပါ။",
          )}
        </p>
      </section>
    </>
  );
}
