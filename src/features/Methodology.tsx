import { useApp, dateLabel } from "../app/context";
import { sources } from "../data/content";
import { PageTitle, Notice, SourceLink } from "../components/shared";
import { freshness } from "../risk/engine";
export default function Methodology() {
  const { t, data, lang, now } = useApp();
  return (
    <>
      <PageTitle
        eyebrow={t("DATA & METHODOLOGY", "အချက်အလက်နှင့် နည်းလမ်း")}
        title={t(
          "Trust starts with transparency.",
          "ပွင့်လင်းမှုက ယုံကြည်မှု၏ အစဖြစ်သည်။",
        )}
        description={t(
          "Where information comes from, what it can tell you, and what it cannot.",
          "အချက်အလက်၏ ရင်းမြစ်၊ သိရှိနိုင်သည့်အရာနှင့် အကန့်အသတ်များ",
        )}
      />
      <Notice>
        {t(
          "This is an independent preparedness resource, not an official warning authority. Regional live warnings and anomaly datasets are not yet connected.",
          "ဤသည် လွတ်လပ်သော ကြိုတင်ပြင်ဆင်ရေး အချက်အလက်ဖြစ်ပြီး တရားဝင်သတိပေးအဖွဲ့ မဟုတ်ပါ။ ဒေသတိုက်ရိုက်သတိပေးချက်နှင့် ကွာဟချက်ဒေတာများ မချိတ်ဆက်ရသေးပါ။",
        )}
      </Notice>
      <section className="panel padded">
        <h2>{t("Source register", "ရင်းမြစ်စာရင်း")}</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  t("Information", "အချက်အလက်"),
                  t("Source & scope", "ရင်းမြစ်နှင့် အတိုင်းအတာ"),
                  t("Freshness / availability", "သက်တမ်း / ရရှိမှု"),
                ].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {t("ENSO status", "ENSO အခြေအနေ")}
                  <small>
                    {t("Official assessment", "တရားဝင်သုံးသပ်ချက်")}
                  </small>
                </td>
                <td>
                  <SourceLink href={sources.noaa}>NOAA CPC</SourceLink>
                  <small>
                    {t(
                      "Tropical Pacific. Not a Myanmar forecast.",
                      "အပူပိုင်းပစိဖိတ်။ မြန်မာဒေသခန့်မှန်းချက် မဟုတ်ပါ။",
                    )}
                  </small>
                </td>
                <td>
                  {data.enso
                    ? dateLabel(data.enso.issuedAt, lang)
                    : t("Unavailable", "မရရှိနိုင်")}
                  <small>
                    {data.enso &&
                    freshness(data.enso.issuedAt, data.enso.validUntil, now) ===
                      "current"
                      ? t("Within bulletin validity", "ကြေညာချက်သက်တမ်းအတွင်း")
                      : t(
                          "Current bulletin unavailable",
                          "လက်ရှိကြေညာချက် မရှိ",
                        )}
                    {data.enso &&
                      ` · ${t("next issue due", "နောက်ထုတ်ပြန်မည့်နေ့")} ${dateLabel(data.enso.validUntil, lang)}`}
                  </small>
                </td>
              </tr>
              <tr>
                <td>
                  {t("Myanmar regional warnings", "မြန်မာ ဒေသသတိပေးချက်များ")}
                </td>
                <td>
                  <SourceLink href={sources.dmh}>Myanmar DMH</SourceLink>
                  <small>
                    {t(
                      "Official external information; no automated feed.",
                      "တရားဝင် ပြင်ပရင်းမြစ်။ အလိုအလျောက်စနစ် မချိတ်ထားပါ။",
                    )}
                  </small>
                </td>
                <td>{t("Not connected", "မချိတ်ဆက်ရသေး")}</td>
              </tr>
              <tr>
                <td>
                  {t(
                    "Temperature / rainfall anomalies",
                    "အပူချိန် / မိုးရေ ကွာဟချက်",
                  )}
                </td>
                <td>
                  {t(
                    "No validated regional baseline or ingestion is configured.",
                    "အတည်ပြု ဒေသအခြေခံစံနှုန်းနှင့် ဒေတာရယူမှု မသတ်မှတ်ထားပါ။",
                  )}
                </td>
                <td>
                  {t(
                    "Unavailable; no inferred values",
                    "မရရှိနိုင်။ မှန်းဆတန်ဖိုး မပြထားပါ။",
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  {t("Administrative boundaries", "အုပ်ချုပ်ရေးနယ်နိမိတ်")}
                </td>
                <td>
                  <SourceLink href="https://www.geoboundaries.org/api/current/gbOpen/MMR/ADM1/">
                    geoBoundaries / Myanmar Analytics Project
                  </SourceLink>
                  <small>CC BY 4.0 · MMR-ADM1-20573499</small>
                </td>
                <td>
                  {t(
                    "2019 reference geometry. 14 areas; Nay Pyi Taw not separate. Simplified for display.",
                    "၂၀၁၉ ရည်ညွှန်းနယ်နိမိတ်၊ ဒေသ ၁၄ ခု။ နေပြည်တော် သီးခြားမပါ။ ပြသရန် ရိုးရှင်းထားသည်။",
                  )}
                </td>
              </tr>
              <tr>
                <td>{t("Health preparedness", "ကျန်းမာရေး ပြင်ဆင်မှု")}</td>
                <td>
                  <SourceLink href={sources.who}>WHO</SourceLink>
                </td>
                <td>
                  {t(
                    "General guidance; not a medical assessment",
                    "အထွေထွေလမ်းညွှန်၊ ဆေးစစ်သုံးသပ်ချက် မဟုတ်",
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  {t(
                    "Agriculture and ENSO education",
                    "စိုက်ပျိုးရေးနှင့် ENSO ပညာပေး",
                  )}
                </td>
                <td>
                  <SourceLink href={sources.fao}>FAO</SourceLink> ·{" "}
                  <SourceLink href={sources.wmo}>WMO</SourceLink>
                </td>
                <td>
                  {t(
                    "General evidence; not local predictions",
                    "အထွေထွေအထောက်အထား၊ ဒေသခန့်မှန်းချက် မဟုတ်",
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <div className="two-columns">
        <section className="panel padded">
          <h2>{t("How warning levels work", "သတိပေးအဆင့် သတ်မှတ်ပုံ")}</h2>
          <ol className="method-steps">
            <li>
              {t(
                "Validate publisher, region, timestamps, severity, and action text before a bulletin can appear.",
                "ကြေညာချက်မပြမီ ထုတ်ပြန်သူ၊ ဒေသ၊ အချိန်၊ အဆင့်နှင့် လုပ်ဆောင်ရန်စာသားကို စစ်ဆေးသည်။",
              )}
            </li>
            <li>
              {t(
                "Use the most severe active, verified bulletin for an area. Preserve its source and original severity.",
                "ဒေသအတွက် သက်တမ်းရှိ အတည်ပြုကြေညာချက်များထဲမှ အမြင့်ဆုံးအဆင့်ကို သုံးပြီး ရင်းမြစ်နှင့် မူရင်းအဆင့်ကို ထိန်းသိမ်းသည်။",
              )}
            </li>
            <li>
              {t(
                "Expired and future bulletins are excluded from current warnings. An ENSO phase never creates a local alert.",
                "သက်တမ်းကုန်နှင့် စတင်ချိန်မရောက်သေးသော ကြေညာချက်များကို လက်ရှိသတိပေးချက်တွင် မပြပါ။ ENSO အဆင့်မှ ဒေသသတိပေးချက် မဖန်တီးပါ။",
              )}
            </li>
            <li>
              {t(
                "“Normal” requires complete regional coverage checked within 24 hours. Otherwise an area without a valid bulletin is “Not assessed”.",
                "“ပုံမှန်” ဟုသတ်မှတ်ရန် ဒေသအားလုံးကို ၂၄ နာရီအတွင်း စစ်ဆေးထားရမည်။ ထိုအချက်မရှိဘဲ သက်တမ်းရှိကြေညာချက် မရှိပါက “မသတ်မှတ်နိုင်သေး” ဟု ပြသည်။",
              )}
            </li>
          </ol>
          <p>
            {t(
              "No numerical risk score or unvalidated meteorological threshold is used. Numerical triggers require Myanmar-specific calibration and expert review before activation.",
              "ကိန်းဂဏန်း အန္တရာယ်ရမှတ် သို့မဟုတ် အတည်မပြုထားသော မိုးလေဝသသတ်မှတ်ချက် မသုံးပါ။ ကိန်းဂဏန်းသတ်မှတ်ချက်များကို မြန်မာဒေသနှင့် ကိုက်ညီအောင် ချိန်ညှိ၍ ပညာရှင်စစ်ဆေးပြီးမှ သုံးရမည်။",
            )}
          </p>
        </section>
        <section className="panel padded">
          <h2>
            {t(
              "Time, uncertainty & privacy",
              "အချိန်၊ မသေချာမှုနှင့် ကိုယ်ရေးအချက်အလက်",
            )}
          </h2>
          <h3>
            {t(
              "Daily retrieval, monthly bulletin",
              "နေ့စဉ်ရယူမှု၊ လစဉ်ကြေညာချက်",
            )}
          </h3>
          <p>
            {t(
              "The publication workflow checks NOAA daily. An unchanged bulletin keeps its issue date. Retrieval time is not the observation period.",
              "ထုတ်ဝေစနစ်က NOAA ကို နေ့စဉ်စစ်ဆေးသည်။ မပြောင်းသောကြေညာချက်တွင် မူရင်းထုတ်ပြန်ရက်ကို ထားသည်။ ရယူချိန်သည် လေ့လာတိုင်းတာချိန် မဟုတ်ပါ။",
            )}
          </p>
          <h3>{t("Freshness limits", "သက်တမ်းအကန့်အသတ်")}</h3>
          <p>
            {t(
              "ENSO status becomes stale after its stated next-update day. Cached information keeps its dates and is checked against your device clock.",
              "ဖော်ပြထားသော နောက်ထုတ်ပြန်ရက် ကျော်လျှင် ENSO အချက်အလက် သက်တမ်းကျော်ဟု ပြသည်။ သိမ်းထားသောအချက်အလက်တွင် မူရင်းရက်စွဲထားပြီး သင့်စက်နာရီနှင့် စစ်ဆေးသည်။",
            )}
          </p>
          <h3>
            {t("Confidence is not invented", "ယုံကြည်နိုင်မှုကို မဖန်တီးပါ")}
          </h3>
          <p>
            {t(
              "Confidence must come from the source and its reasoning. If absent, it is “not provided”. Planning scenarios have no assigned probability.",
              "ယုံကြည်နိုင်မှုသည် ရင်းမြစ်နှင့် ၎င်း၏အကြောင်းပြချက်မှ လာရမည်။ မပါပါက “မဖော်ပြထား” ဟု ပြသည်။ ပြင်ဆင်ရေးအခြေအနေများတွင် ဖြစ်နိုင်နှုန်း မသတ်မှတ်ပါ။",
            )}
          </p>
          <h3>
            {t("Your device, your preferences", "သင့်စက်၊ သင့်ရွေးချယ်မှုများ")}
          </h3>
          <p>
            {t(
              "No accounts, analytics, or precise location collection. Language, selected region, recent data, and checklist progress stay in browser storage. Clearing site data removes them.",
              "အကောင့်၊ အသုံးပြုမှုခြေရာခံစနစ်နှင့် တိကျသောတည်နေရာ ကောက်ယူမှု မရှိပါ။ ဘာသာစကား၊ ရွေးထားသောဒေသ၊ နောက်ဆုံးဒေတာနှင့် စာရင်းပြီးစီးမှုကို browser တွင်သာ သိမ်းသည်။ Site data ရှင်းလျှင် ပျက်မည်။",
            )}
          </p>
        </section>
      </div>
      <section className="panel padded">
        <h2>{t("Read the labels", "အမျိုးအစားများကို နားလည်ပါ")}</h2>
        <p>
          {t(
            "Observed = measured conditions. Forecast = a future estimate. Baseline = a reference period for comparison. Historical = past records. Scenario = conditional planning assumptions. The current release displays official ENSO assessments and general guidance; regional observations and forecasts are unavailable.",
            "တိုင်းတာချက် = တိုင်းတာထားသောအခြေအနေ။ ခန့်မှန်းချက် = အနာဂတ်အတွက် ခန့်မှန်းမှု။ အခြေခံစံ = နှိုင်းယှဉ်ရန် ရည်ညွှန်းကာလ။ သမိုင်းမှတ်တမ်း = ယခင်အချက်အလက်။ အခြေအနေ = ပြင်ဆင်ရေးယူဆချက်။ ယခုဗားရှင်းတွင် တရားဝင် ENSO သုံးသပ်ချက်နှင့် အထွေထွေလမ်းညွှန်သာ ပြပြီး ဒေသတိုင်းတာချက်နှင့် ခန့်မှန်းချက် မရရှိနိုင်သေးပါ။",
          )}
        </p>
        <p>
          {t(
            "Temperature anomalies (°C) describe a difference from a baseline, not the actual air temperature. Rainfall totals (mm) and rainfall anomalies (%) are different quantities; no values are displayed without a valid baseline, period, and units.",
            "အပူချိန်ကွာဟချက် (°C) သည် အခြေခံစံမှ ကွာခြားမှုဖြစ်ပြီး လေထုအပူချိန်အမှန် မဟုတ်ပါ။ မိုးရေစုစုပေါင်း (mm) နှင့် မိုးရေကွာဟချက် (%) မတူပါ။ မှန်ကန်သော စံကာလ၊ အချိန်ကာလနှင့် ယူနစ်မရှိဘဲ တန်ဖိုးများ မပြပါ။",
          )}
        </p>
      </section>
    </>
  );
}
