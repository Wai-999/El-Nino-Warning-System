import { useApp } from "../app/context";
import { geography, townshipByCode } from "../data/locations";
import { regionName } from "../data/regions";
import { mmt, weatherFresh, historyFresh } from "../data/operational";
import { number } from "../data/presentation";
import { Source, Unavailable } from "../components/Service";
import LocalBriefing from "../components/LocalBriefing";
export default function Township({ code }: { code: string }) {
  const { t, lang, now, operational: op, togglePlace, savedPlaces } = useApp(),
    area = townshipByCode(code);
  if (!area)
    return (
      <>
        <h1>{t("Township not found", "မြို့နယ် မတွေ့ပါ")}</h1>
        <a href="#/map">{t("Choose an area", "ဒေသရွေးရန်")}</a>
      </>
    );
  const w = op.weather?.regions.find((r) => r.id === area.regionId),
    h = op.history?.regions.find((r) => r.id === area.regionId),
    id = `township:${area.code}`;
  return (
    <>
      <header className="page-title">
        <p className="eyebrow">
          {t("TOWNSHIP OVERVIEW", "မြို့နယ် အကျဉ်းချုပ်")}
        </p>
        <h1>{area[lang]}</h1>
        <p>
          {t("Myanmar", "မြန်မာနိုင်ငံ")} / {area.admin1[lang]} /{" "}
          {area.district[lang]} / {area[lang]} · {area.code}
        </p>
        <button
          onClick={() => togglePlace(id)}
          disabled={!savedPlaces.includes(id) && savedPlaces.length >= 12}
          aria-pressed={savedPlaces.includes(id)}
        >
          {savedPlaces.includes(id)
            ? t("Remove saved township", "သိမ်းထားသောမြို့နယ် ဖယ်ရန်")
            : t("Save township", "မြို့နယ် သိမ်းရန်")}
        </button>
      </header>
      <LocalBriefing regionId={area.regionId} townshipCode={area.code} />
      <section className="surface padded">
        <h2>
          {t("What is available for this place?", "ဤဒေသအတွက် ဘာဒေတာ ရရှိသလဲ။")}
        </h2>
        <p>
          {t(
            "Administrative selection is precise to this source township. Meteorological precision is coarser: the existing three-cell regional method is retained rather than presenting an unvalidated township forecast.",
            "အုပ်ချုပ်ရေးရွေးချယ်မှုသည် ရင်းမြစ်မြို့နယ်အထိ ဖြစ်သည်။ မိုးလေဝသတိကျမှုမှာ ပိုကျယ်သည်။ အတည်မပြုမြို့နယ်ခန့်မှန်းချက်အစား ဒေသနမူနာသုံးခုနည်းကို ဆက်သုံးသည်။",
          )}
        </p>
        {(!weatherFresh(op.weather, now) || !historyFresh(op.history, now)) && (
          <Unavailable>
            {t(
              "Some values below are delayed or unavailable. They are dated context, not current conditions; original source periods are retained.",
              "အောက်ပါဒေတာအချို့ နောက်ကျ သို့မဟုတ် မရရှိပါ။ ရက်စွဲပါနောက်ခံသာဖြစ်ပြီး လက်ရှိအခြေအနေ မဟုတ်ပါ။ မူရင်းကာလများကို ထိန်းထားသည်။",
            )}
          </Unavailable>
        )}
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label={t("Township data methods", "မြို့နယ် ဒေတာနည်းလမ်းများ")}
        >
          <table>
            <thead>
              <tr>
                <th>{t("Indicator", "ညွှန်းကိန်း")}</th>
                <th>
                  {t(
                    "Available value / coverage",
                    "ရရှိတန်ဖိုး / လွှမ်းခြုံမှု",
                  )}
                </th>
                <th>{t("Method and limitation", "နည်းနှင့် ကန့်သတ်ချက်")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{t("Temperature / rain", "အပူချိန် / မိုးရေ")}</th>
                <td>
                  {number(w?.now.temperature, lang)}°C ·{" "}
                  {number(w?.next24.rain, lang)} mm / 24h
                </td>
                <td>
                  {regionName(area.regionId, lang)} ·{" "}
                  {t(
                    "parent-region ECMWF sample; not township observation",
                    "သက်ဆိုင်ရာ ပြည်နယ်/တိုင်း ECMWF နမူနာ၊ မြို့နယ်တိုင်းတာချက် မဟုတ်",
                  )}{" "}
                  <Source id="temperature" />
                  {op.weather && <p>{mmt(op.weather.validAt, lang)}</p>}
                </td>
              </tr>
              <tr>
                <th>{t("Recent climate", "မကြာသေးမီ ရာသီဥတု")}</th>
                <td>
                  {number(h?.temperatureAnomaly, lang)}°C{" "}
                  {t("anomaly", "ကွာဟချက်")}
                </td>
                <td>
                  {t(
                    "Parent-region ERA5 / 1991–2020; original completed-day window",
                    "သက်ဆိုင်ရာ ပြည်နယ်/တိုင်း ERA5 / 1991–2020၊ မူရင်းပြီးဆုံးရက်ကာလ",
                  )}{" "}
                  {op.history && `${op.history.start} → ${op.history.end}`}{" "}
                  <Source id="temperature-anomaly" />
                </td>
              </tr>
              <tr>
                <th>
                  {t("Official warnings / flood", "တရားဝင်သတိပေးချက် / ရေကြီး")}
                </th>
                <td>
                  {t("Township coverage unavailable", "မြို့နယ်ဒေတာ မရရှိ")}
                </td>
                <td>
                  {t(
                    "No validated township bulletin, gauge or observed flood footprint; rain cannot substitute.",
                    "အတည်ပြုမြို့နယ်ကြေညာချက်၊ ရေမှတ်နှင့် တွေ့ရှိရေလွှမ်းဒေတာ မရှိပါ။ မိုးရေကို အစားမသုံးပါ။",
                  )}{" "}
                  <Source id="official-warning" />
                </td>
              </tr>
              <tr>
                <th>ENSO</th>
                <td>
                  {t("Pacific climate context", "ပစိဖိတ် ရာသီဥတုနောက်ခံ")}
                </td>
                <td>
                  {t(
                    "Not a local warning or township forecast",
                    "ဒေသသတိပေးချက် သို့မဟုတ် မြို့နယ်ခန့်မှန်းချက် မဟုတ်",
                  )}{" "}
                  <Source id="roni" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <details className="disclosure">
        <summary>
          {t(
            "Administrative details & reviewed names",
            "အုပ်ချုပ်ရေး အသေးစိတ်နှင့် စစ်ဆေးအမည်များ",
          )}
        </summary>
        <div>
          <dl className="facts">
            <div>
              <dt>PCode</dt>
              <dd>township:{area.code}</dd>
            </div>
            <div>
              <dt>{t("District", "ခရိုင်")}</dt>
              <dd>
                district:{area.district.code} · {area.district[lang]}
              </dd>
            </div>
            <div>
              <dt>{t("Source state/region", "ရင်းမြစ် ပြည်နယ်/တိုင်း")}</dt>
              <dd>
                admin1:{area.admin1.code} · {area.admin1[lang]}
              </dd>
            </div>
            <div>
              <dt>{t("Names", "အမည်များ")}</dt>
              <dd>
                {area.en} · {area.my}{" "}
                {area.aliases.length ? `· ${area.aliases.join(", ")}` : ""}
              </dd>
            </div>
            <div>
              <dt>{t("Geography valid on", "နယ်နိမိတ် အကျုံးဝင်ရက်")}</dt>
              <dd>{geography.validOn}</dd>
            </div>
            <div>
              <dt>
                {t(
                  "Source review / resource update",
                  "ရင်းမြစ် စစ်ဆေး / ဖိုင်မွမ်းမံရက်",
                )}
              </dt>
              <dd>
                {geography.reviewedOn} / {geography.resourceUpdatedAt}
              </dd>
            </div>
          </dl>
          <p>
            {t(
              "A newer download date does not make these boundaries current. Corrections require a reviewed source change; older names remain search aids, not boundary changes.",
              "ဖိုင်ရယူရက် အသစ်ဖြစ်ခြင်းက နယ်နိမိတ်ကို လက်ရှိဖြစ်စေခြင်း မဟုတ်ပါ။ ပြင်ဆင်မှုတိုင်း ရင်းမြစ်စစ်ဆေးရန် လိုသည်။ အမည်ဟောင်းများသည် ရှာဖွေရေးအကူအညီသာဖြစ်ပြီး နယ်နိမိတ်ပြောင်းလဲမှု မဟုတ်ပါ။",
            )}
          </p>
          <Source id="townships" />
        </div>
      </details>
      <Unavailable>
        {t(
          "Village coverage in this source is partial. Village-scale measurements, township flood maps and automatic township alert delivery are unavailable.",
          "ဤရင်းမြစ်တွင် ကျေးရွာစာရင်း မပြည့်စုံပါ။ ကျေးရွာတိုင်းတာချက်၊ မြို့နယ်ရေကြီးမြေပုံနှင့် အလိုအလျောက်မြို့နယ်အသိပေးပို့မှု မရရှိပါ။",
        )}
      </Unavailable>
      <a href="#/safety">
        {t(
          "Preparedness and official links",
          "ကြိုတင်ပြင်ဆင်မှုနှင့် တရားဝင်လင့်ခ်များ",
        )}{" "}
        →
      </a>
    </>
  );
}
