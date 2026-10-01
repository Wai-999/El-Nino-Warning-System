import { useApp, dateLabel } from "../app/context";
import { PageTitle, Notice, SourceLink } from "../components/shared";
import { Evidence } from "../components/Operational";
import { weatherFresh, historyFresh, mmt } from "../data/operational";
export default function Methodology() {
  const { t, lang, operational: op, now, data } = useApp();
  return (
    <>
      <PageTitle
        eyebrow={t("SOURCES & METHODS · V2", "ရင်းမြစ်နှင့် တွက်ချက်နည်း · V2")}
        title={t(
          "See the evidence behind each signal.",
          "ညွှန်းကိန်းတစ်ခုစီ၏ အထောက်အထားကို ကြည့်ပါ။",
        )}
        description={t(
          "Independent climate preparedness. Forecasts, historical reanalysis and official assessments are separate evidence types.",
          "လွတ်လပ်သော ရာသီဥတုကြိုတင်ပြင်ဆင်ရေး။ ခန့်မှန်းချက်၊ သမိုင်းပြန်လည်ဆန်းစစ်ချက်နှင့် တရားဝင်သုံးသပ်ချက်သည် သီးခြားအထောက်အထား အမျိုးအစားများဖြစ်သည်။",
        )}
      />
      <section className="panel padded">
        <h2>{t("Data status", "ဒေတာအခြေအနေ")}</h2>
        <dl className="indicator-list">
          <div>
            <dt>ECMWF IFS</dt>
            <dd>
              {weatherFresh(op.weather, now)
                ? t("Current forecast", "သက်တမ်းရှိ ခန့်မှန်းချက်")
                : op.weather
                  ? t("Stale", "သက်တမ်းကျော်")
                  : t("Unavailable", "မရရှိ")}
            </dd>
          </div>
          <div>
            <dt>ERA5</dt>
            <dd>
              {historyFresh(op.history, now)
                ? t(
                    "Historical · expected publication lag",
                    "သမိုင်းဒေတာ · ပုံမှန်ထုတ်ပြန်နောက်ကျမှု",
                  )
                : op.history
                  ? t("Stale", "သက်တမ်းကျော်")
                  : t("Unavailable", "မရရှိ")}
            </dd>
          </div>
          <div>
            <dt>
              {t("Official Myanmar warnings", "မြန်မာ တရားဝင်သတိပေးချက်")}
            </dt>
            <dd>{t("Coverage unavailable", "လွှမ်းခြုံဒေတာ မရရှိ")}</dd>
          </div>
        </dl>
        {Object.entries(op.health).map(([id, h]) => (
          <details key={id}>
            <summary>
              {id} ·{" "}
              {h.ok
                ? t("Last check succeeded", "နောက်ဆုံးစစ်ဆေးမှု အောင်မြင်")
                : t(
                    "Last retrieval failed — prior data retained",
                    "နောက်ဆုံးရယူမှု မအောင်မြင် — ယခင်ဒေတာ ထိန်းသိမ်းထား",
                  )}
            </summary>
            <p>
              {t("Checked", "စစ်ဆေးချိန်")}: {mmt(h.checkedAt, lang)}
              <br />
              {t("Last success", "နောက်ဆုံးအောင်မြင်ချိန်")}:{" "}
              {h.lastSuccess ? mmt(h.lastSuccess, lang) : "—"}
            </p>
          </details>
        ))}
        <Evidence />
      </section>
      <section className="panel padded">
        <h2>{t("How anomalies are calculated", "ကွာဟချက် တွက်ချက်ပုံ")}</h2>
        <p>
          {t(
            "Temperature anomaly = recent 30-day mean minus the 1991–2020 mean for the same calendar dates. Rainfall departure = recent 30-day total minus the expected total. Both sides use ERA5, the same three sample cells and MMT calendar days.",
            "အပူချိန်ကွာဟချက် = မကြာသေးမီ ရက် ၃၀ ပျမ်းမျှ − တူညီသောပြက္ခဒိန်ရက်များ၏ ၁၉၉၁–၂၀၂၀ ပျမ်းမျှ။ မိုးရေကွာဟချက် = ရက် ၃၀ စုစုပေါင်း − ပုံမှန်စုစုပေါင်း။ နှစ်ဖက်လုံးတွင် ERA5၊ တူညီသောနမူနာကွက် ၃ ခုနှင့် မြန်မာစံတော်ချိန်ရက်များ သုံးထားသည်။",
          )}
        </p>
        <p>
          {t(
            "Percentage = 100 × departure / expected rain; suppressed below 10 mm expected rain. Dry days count consecutive sampled-mean days below 1 mm, ending on the dated historical window. This is not SPI, a drought declaration or today’s soil moisture.",
            "ရာခိုင်နှုန်း = 100 × ကွာဟချက် / ပုံမှန်မိုးရေ။ ပုံမှန်မိုးရေ 10 mm အောက်တွင် မပြပါ။ မိုးပြတ်ရက်သည် သမိုင်းဒေတာ နောက်ဆုံးရက်အထိ နမူနာပျမ်းမျှ 1 mm အောက် ဆက်တိုက်ရက်များဖြစ်သည်။ SPI၊ မိုးခေါင်ကြေညာချက် သို့မဟုတ် ယနေ့မြေအစိုဓာတ် မဟုတ်ပါ။",
          )}
        </p>
      </section>
      <section className="panel padded">
        <h2>
          {t(
            "Transparent screening thresholds",
            "ပွင့်လင်းသော စစ်ဆေးသတ်မှတ်ချက်များ",
          )}
        </h2>
        <p>
          {t(
            "Thresholds produce application planning signals, never government warnings. They have not been calibrated against Myanmar impacts. Levels: Normal → Advisory → Watch → Warning → Severe.",
            "သတ်မှတ်ချက်များသည် စနစ်ပြင်ဆင်ရေးညွှန်းကိန်းသာဖြစ်ပြီး အစိုးရသတိပေးချက် မဟုတ်ပါ။ မြန်မာသက်ရောက်မှုဒေတာဖြင့် ချိန်ညှိအတည်မပြုရသေးပါ။ အဆင့် — ပုံမှန် → အသိပေး → စောင့်ကြည့် → သတိပေး → ပြင်းထန်။",
          )}
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("Driver", "အကြောင်းရင်း")}</th>
                <th>{t("Thresholds / method", "သတ်မှတ်ချက် / နည်းလမ်း")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{t("Heat", "အပူ")}</th>
                <td>
                  {t(
                    "NWS shade heat index, highest sample over next 24 h: 80 / 90 / 103 / 125°F (26.7 / 32.2 / 39.4 / 51.7°C).",
                    "NWS အရိပ် အပူဒဏ်ညွှန်းကိန်း၊ လာမည့် ၂၄ နာရီ နမူနာအမြင့်ဆုံး — 80 / 90 / 103 / 125°F (26.7 / 32.2 / 39.4 / 51.7°C)။",
                  )}
                </td>
              </tr>
              <tr>
                <th>{t("Rain", "မိုး")}</th>
                <td>
                  {t(
                    "Highest sample next-24-hour total: 20 / 50 / 100 / 200 mm. Screening only, not flood prediction.",
                    "လာမည့် ၂၄ နာရီ နမူနာအများဆုံး — 20 / 50 / 100 / 200 mm။ စစ်ဆေးညွှန်းကိန်းသာဖြစ်ပြီး ရေကြီးခန့်မှန်းချက် မဟုတ်ပါ။",
                  )}
                </td>
              </tr>
              <tr>
                <th>{t("Wind", "လေ")}</th>
                <td>
                  {t(
                    "Highest sample gust in next 24 h: 40 / 60 / 80 / 100 km/h.",
                    "လာမည့် ၂၄ နာရီ နမူနာအမြင့်ဆုံးလေပြင်း — 40 / 60 / 80 / 100 km/h။",
                  )}
                </td>
              </tr>
              <tr>
                <th>{t("Dryness / water", "ခြောက်သွေ့မှု / ရေ")}</th>
                <td>
                  {t(
                    "Expected 30-day rain ≥30 mm: deficit ≥25% → Advisory; ≥50% plus ≥7 dry days → Watch; ≥75% plus ≥14 dry days → Warning. No Severe classification.",
                    "ပုံမှန် ရက် ၃၀ မိုးရေ ≥30 mm ရှိလျှင် — လျော့နည်းမှု ≥25% အသိပေး၊ ≥50% နှင့် မိုးပြတ် ≥7 ရက် စောင့်ကြည့်၊ ≥75% နှင့် မိုးပြတ် ≥14 ရက် သတိပေး။ ပြင်းထန်အဆင့် မသတ်မှတ်ပါ။",
                  )}
                </td>
              </tr>
              <tr>
                <th>{t("Agriculture", "စိုက်ပျိုးရေး")}</th>
                <td>
                  {t(
                    "Highest heat/rain/dryness level; all three inputs required. No crop-loss inference.",
                    "အပူ၊ မိုး၊ ခြောက်သွေ့မှုထဲမှ အမြင့်ဆုံး၊ သုံးမျိုးလုံး၏ဒေတာ လိုအပ်သည်။ သီးနှံဆုံးရှုံးမှု မတွက်ချက်ပါ။",
                  )}
                </td>
              </tr>
              <tr>
                <th>ENSO</th>
                <td>
                  {t(
                    "Adds climate context only. Never increases local severity.",
                    "ရာသီဥတုနောက်ခံအတွက်သာ သုံးသည်။ ဒေသအဆင့်ကို မမြှင့်ပါ။",
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <SourceLink href="https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml">
          NWS heat-index formula
        </SourceLink>
        <p>
          {t(
            "Overall attention is the maximum available independent hazard, not an averaged score. Missing hazards remain unknown. Immediate official warnings outrank system hazards; immediate high weather signals outrank ENSO context.",
            "စုစုပေါင်းသည် ရရှိသော သီးခြားအန္တရာယ်အဆင့်များ၏ အမြင့်ဆုံးဖြစ်သည်။ ပျမ်းမျှအမှတ် မဟုတ်ပါ။ မရရှိသောအန္တရာယ်ကို မသိဟု ထားသည်။ တရားဝင်အရေးပေါ်သတိပေးချက်ကို ဦးစားပေး၍ ချက်ချင်းမြင့်တက်မိုးလေဝသအန္တရာယ်ကို ENSO ထက် ဦးစားပေးသည်။",
          )}
        </p>
      </section>
      <section className="panel padded">
        <h2>
          {t(
            "Freshness, privacy & limitations",
            "သက်တမ်း၊ ကိုယ်ရေးအချက်အလက်နှင့် အကန့်အသတ်",
          )}
        </h2>
        <p>
          {t(
            "Weather refreshes four times daily; stale after 18 hours. ERA5 refreshes daily and is stale when its last day is more than 10 days old. Baselines are cached. Cached data keeps its original date, and is labeled when offline. NOAA assessments expire on the stated next-update date.",
            "မိုးလေဝသဒေတာကို တစ်နေ့ ၄ ကြိမ် ရယူ၍ ၁၈ နာရီကျော်လျှင် သက်တမ်းကျော်ဟု ပြသည်။ ERA5 ကို နေ့စဉ်ရယူ၍ နောက်ဆုံးဒေတာရက် ၁၀ ရက်ကျော်လျှင် သက်တမ်းကျော်ဖြစ်သည်။ အခြေခံပျမ်းမျှကို သိမ်းထားသည်။ အော့ဖ်လိုင်းဒေတာ၏ မူရင်းရက် မပြောင်းပါ။ NOAA သုံးသပ်ချက်သည် နောက်ထုတ်ပြန်ရက်တွင် သက်တမ်းကုန်သည်။",
          )}
        </p>
        <p>
          {t(
            "No account, location tracking or analytics. Language, selected region, cached data and checklists stay in your browser. Low Data Mode skips maps and optional charts.",
            "အကောင့်၊ တည်နေရာခြေရာခံမှုနှင့် သုံးစွဲမှုခြေရာခံမှု မရှိပါ။ ဘာသာစကား၊ ဒေသ၊ သိမ်းဒေတာနှင့် ပြင်ဆင်စာရင်းကို သင့်ဘရောက်ဇာတွင်သာ သိမ်းသည်။ ဒေတာချွေတာစနစ်တွင် မြေပုံနှင့် မလိုအပ်သောဇယားများကို မဖွင့်ပါ။",
          )}
        </p>
        <p>
          {t(
            "MIMU/OCHA/HDX boundaries: CC BY 3.0 IGO; Bago and Shan subdivisions merged. Forecast and ERA5 data: ECMWF/Copernicus/Open-Meteo, CC BY 4.0.",
            "MIMU/OCHA/HDX နယ်နိမိတ် — CC BY 3.0 IGO၊ ပဲခူးနှင့် ရှမ်းဒေသခွဲများ ပေါင်းထားသည်။ ခန့်မှန်းချက်နှင့် ERA5 ဒေတာ — ECMWF/Copernicus/Open-Meteo၊ CC BY 4.0။",
          )}
        </p>
        <SourceLink href="https://github.com/Wai-999/El-Nino-Warning-System/blob/main/docs/DATA_SOURCES.md">
          {t("Full source registry", "ရင်းမြစ်စာရင်း အပြည့်အစုံ")}
        </SourceLink>{" "}
        ·{" "}
        <SourceLink href="https://github.com/Wai-999/El-Nino-Warning-System/blob/main/docs/RISK_METHODOLOGY.md">
          {t(
            "Scientific methodology & limitations",
            "သိပ္ပံနည်းလမ်းနှင့် အကန့်အသတ်",
          )}
        </SourceLink>
        {data.enso && (
          <p className="meta">NOAA · {dateLabel(data.enso.issuedAt, lang)}</p>
        )}
      </section>
      <Notice>
        {t(
          "Independent preparedness information, not an emergency service. Follow local authorities for protective decisions. Forecasts can miss severe local weather, especially in mountainous terrain.",
          "လွတ်လပ်သော ပြင်ဆင်ရေးအချက်အလက်သာဖြစ်ပြီး အရေးပေါ်ဌာန မဟုတ်ပါ။ ကာကွယ်ရေးဆုံးဖြတ်ချက်တွင် ဒေသတာဝန်ရှိသူများကို လိုက်နာပါ။ အထူးသဖြင့် တောင်တန်းဒေသတွင် ပြင်းထန်ဒေသမိုးလေဝသကို မော်ဒယ်က လွတ်သွားနိုင်သည်။",
        )}
      </Notice>
    </>
  );
}
