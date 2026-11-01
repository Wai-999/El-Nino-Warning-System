import { useApp } from "../app/context";
import {
  settlementById,
  settlementName,
  townshipByCode,
  settlementReference,
} from "../data/locations";
import { regionName } from "../data/regions";
import LocalBriefing from "../components/LocalBriefing";
import { Source } from "../components/Service";

export default function Settlement({ id }: { id: string }) {
  const { t, lang, savedPlaces, togglePlace } = useApp();
  const point = settlementById(id);
  if (!point)
    return (
      <>
        <h1>{t("Place not found", "တည်နေရာ မတွေ့ပါ")}</h1>
        <a href="#/map">{t("Choose an area", "ဒေသရွေးရန်")}</a>
      </>
    );
  const key = `settlement:${point.id}`,
    township = townshipByCode(point.townshipCode)!;
  return (
    <>
      <header className="page-title">
        <p className="eyebrow">
          {t("CITY / TOWN / SETTLEMENT POINT", "မြို့ / အခြေချနေရာမှတ်")}
        </p>
        <h1>{settlementName(point, lang)}</h1>
        <p>
          {point.en} · {regionName(point.regionId, lang)}
        </p>
        <button
          onClick={() => togglePlace(key)}
          disabled={!savedPlaces.includes(key) && savedPlaces.length >= 12}
          aria-pressed={savedPlaces.includes(key)}
        >
          {savedPlaces.includes(key)
            ? t("Remove saved place", "သိမ်းထားသောဒေသ ဖယ်ရန်")
            : t("Save this place", "ဤတည်နေရာ သိမ်းရန်")}
        </button>
      </header>
      <p className="precision-note">
        {t(
          "This is a named settlement point, distinct from an administrative township. A city can span several townships. The source point is used for reference lookup; weather and warning coverage retain their original, coarser resolution.",
          "ဤသည် အမည်ပါ အခြေချနေရာမှတ်ဖြစ်ပြီး အုပ်ချုပ်ရေးမြို့နယ်နှင့် မတူပါ။ မြို့တစ်မြို့သည် မြို့နယ်အများအပြားတွင် ပါဝင်နိုင်သည်။ ရင်းမြစ်နေရာမှတ်ကို ရည်ညွှန်းရှာဖွေရေးအတွက်သာ သုံးပြီး မိုးလေဝသနှင့် သတိပေးဒေတာသည် မူရင်း ပိုကျယ်သောအဆင့်အတိုင်း ဖြစ်သည်။",
        )}
      </p>
      <LocalBriefing />
      <section className="surface padded">
        <h2>{t("Place reference", "တည်နေရာ ရည်ညွှန်းချက်")}</h2>
        <dl className="facts">
          <div>
            <dt>{t("Stable source ID", "ရင်းမြစ် အမှတ်စဉ်")}</dt>
            <dd>GeoNames {point.id}</dd>
          </div>
          <div>
            <dt>{t("Coordinates (WGS84)", "ကိုဩဒိနိတ် (WGS84)")}</dt>
            <dd>
              {point.lat}°N, {point.lon}°E
            </dd>
          </div>
          <div>
            <dt>
              {t(
                "Reference township at source point",
                "ရင်းမြစ်နေရာမှတ်ရှိ ရည်ညွှန်းမြို့နယ်",
              )}
            </dt>
            <dd>
              <a href={`#/township/${township.code}`}>{township[lang]}</a> ·{" "}
              {township.code}
            </dd>
          </div>
          <div>
            <dt>
              {t(
                "Source record modified / extract retrieved",
                "ရင်းမြစ်မှတ်တမ်း မွမ်းမံ / ဖိုင်ရယူရက်",
              )}
            </dt>
            <dd>
              {point.modifiedOn} / {settlementReference.retrievedOn}
            </dd>
          </div>
          <div>
            <dt>{t("Names", "အမည်များ")}</dt>
            <dd>
              {point.en} ·{" "}
              {point.my ||
                t(
                  "Burmese source label unavailable; original name retained",
                  "ရင်းမြစ်မြန်မာအမည် မရရှိ၍ မူရင်းအမည်ကို ထိန်းထားသည်",
                )}
            </dd>
          </div>
        </dl>
        <Source id="settlements" />
      </section>
      <details className="disclosure">
        <summary>
          {t(
            "Coverage, names and mapping method",
            "လွှမ်းခြုံမှု၊ အမည်နှင့် မြေပုံနည်းလမ်း",
          )}
        </summary>
        <div>
          <p>
            {t(
              "The bounded GeoNames extract contains 515 city/town/settlement points: administrative seats and populated places meeting the source’s 500-person extract criterion. It is not a comprehensive legal list of Myanmar cities, towns or villages. English and language-tagged Burmese names are retained where supplied; expert name review remains open.",
              "GeoNames စာရင်းအပိုင်းတွင် အုပ်ချုပ်ရေးရုံးစိုက်ရာများနှင့် ရင်းမြစ်၏ လူ 500 စာရင်းထုတ်စံနှုန်း ပြည့်မီသော မြို့/အခြေချနေရာမှတ် 515 ခု ပါသည်။ မြန်မာနိုင်ငံ၏ တရားဝင် မြို့နှင့် ကျေးရွာအားလုံးစာရင်း မဟုတ်ပါ။ ရရှိသည့် အင်္ဂလိပ်နှင့် မြန်မာဘာသာသတ်မှတ်အမည်ကို ထိန်းထားပြီး ကျွမ်းကျင်သူအမည်စစ်ဆေးမှု လိုသေးသည်။",
            )}
          </p>
          <p>
            {t(
              "The point falls inside exactly one pinned 2024 HDX township polygon. That derived parent lookup can differ from GeoNames’ older parent code and does not determine a whole city’s legal boundary or current administrative changes.",
              "နေရာမှတ်သည် သတ်မှတ်ဗားရှင်း 2024 HDX မြို့နယ်နယ်နိမိတ် တစ်ခုအတွင်း ပါဝင်သည်။ ဤတွက်ထုတ်ရည်ညွှန်းချက်သည် GeoNames အမည်ဟောင်းကုဒ်နှင့် ကွာနိုင်ပြီး မြို့တစ်ခုလုံး၏ တရားဝင်နယ်နိမိတ် သို့မဟုတ် လက်ရှိအုပ်ချုပ်ရေးပြောင်းလဲမှုကို ဆုံးဖြတ်ခြင်း မဟုတ်ပါ။",
            )}
          </p>
          <a
            href={`https://www.geonames.org/${point.id}/`}
            target="_blank"
            rel="noreferrer"
          >
            {t("Original GeoNames record", "မူရင်း GeoNames မှတ်တမ်း")}
          </a>
        </div>
      </details>
      <a href="#/map">
        {t("View the map and place list", "မြေပုံနှင့် တည်နေရာစာရင်း ကြည့်ရန်")}{" "}
        →
      </a>
    </>
  );
}
