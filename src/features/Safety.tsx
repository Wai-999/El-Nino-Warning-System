import { useState } from "react";
import {
  ShieldCheck,
  Sun,
  Droplets,
  Wind,
  Leaf,
  ArrowUpRight,
  Bell,
  Check,
  Printer,
} from "lucide-react";
import { useApp } from "../app/context";
import { prioritizeAlerts, warningHistory } from "../risk/engine";
import { signalsFor, hazardNames } from "../risk/signals";
import { regionName } from "../data/regions";
import { mmt } from "../data/operational";
import {
  OfficialNotice,
  Source,
  Unavailable,
  SectionHeading,
} from "../components/Service";
import OfficialHealth from "../components/OfficialHealth";
import EmergencyContacts from "../components/EmergencyContacts";
import { townshipByCode } from "../data/locations";
import { readCropPreference, saveCropPreference } from "../data/preferences";
type Pair = readonly [string, string];
const hazards = [
  {
    id: "heat",
    name: ["Extreme heat", "အပူဒဏ်"] as Pair,
    icon: Sun,
    items: [
      [
        "Plan rest, shade and safe drinking water, especially for outdoor work.",
        "ပြင်ပအလုပ်တွင် အနားယူချိန်၊ အရိပ်နှင့် သန့်ရှင်းသော သောက်ရေ စီစဉ်ပါ။",
      ],
      [
        "Check on children, older adults and people who need support.",
        "ကလေး၊ သက်ကြီးရွယ်အိုနှင့် အကူအညီလိုသူများကို ဂရုစိုက်ပါ။",
      ],
      [
        "Know a cooler place you can reach; never leave anyone in a parked vehicle.",
        "သွားရောက်နိုင်သော အေးမြသည့်နေရာ သိထားပါ။ ရပ်ထားသောကားထဲ မည်သူ့ကိုမျှ မထားခဲ့ပါနှင့်။",
      ],
    ] as Pair[],
  },
  {
    id: "flood",
    name: ["Floods", "ရေကြီးမှု"] as Pair,
    icon: Droplets,
    items: [
      [
        "Know your local evacuation route and follow official instructions.",
        "ဒေသဘေးလွတ်ရာလမ်းကြောင်း သိထားပြီး တရားဝင်ညွှန်ကြားချက် လိုက်နာပါ။",
      ],
      [
        "Keep documents, medicines and a torch ready in a waterproof bag.",
        "စာရွက်စာတမ်း၊ ဆေးနှင့် ဓာတ်မီးကို ရေစိုခံအိတ်တွင် ပြင်ဆင်ထားပါ။",
      ],
      [
        "Avoid walking or driving through floodwater; protect drinking water and food.",
        "ရေကြီးနေရာကို ခြေလျင်၊ ကားဖြင့် မဖြတ်ပါနှင့်။ သောက်ရေနှင့် အစားအစာ ကာကွယ်ထားပါ။",
      ],
    ] as Pair[],
  },
  {
    id: "drought",
    name: ["Drought", "မိုးခေါင်မှု"] as Pair,
    icon: Leaf,
    items: [
      [
        "Check actual local water supplies rather than relying on a regional rainfall total.",
        "ဒေသမိုးရေပေါင်းလဒ်ကိုသာ မမှီခိုဘဲ အမှန်တကယ် ရေရရှိမှု စစ်ဆေးပါ။",
      ],
      [
        "Repair leaks and protect safe drinking-water storage.",
        "ရေယိုစိမ့်မှု ပြုပြင်၍ သန့်ရှင်းသောသောက်ရေ သိုလှောင်မှု ကာကွယ်ပါ။",
      ],
      [
        "Seek crop-stage advice before changing irrigation or seasonal planting plans.",
        "ရေပေးခြင်းနှင့် ရာသီစိုက်ပျိုးရေးအစီအစဉ် မပြောင်းမီ သီးနှံအဆင့်အလိုက် အကြံဉာဏ်ယူပါ။",
      ],
    ] as Pair[],
  },
  {
    id: "storm",
    name: ["Storms & wind", "မုန်တိုင်းနှင့် လေပြင်း"] as Pair,
    icon: Wind,
    items: [
      [
        "Follow official cyclone bulletins and local evacuation instructions.",
        "တရားဝင်မုန်တိုင်းကြေညာချက်နှင့် ဒေသဘေးလွတ်ရာညွှန်ကြားချက် လိုက်နာပါ။",
      ],
      [
        "Secure loose objects before winds strengthen and charge essential devices.",
        "လေအားမကောင်းမီ လွင့်နိုင်သည့်ပစ္စည်းများ ခိုင်မြဲအောင်ထား၍ လိုအပ်သောစက်များ အားသွင်းပါ။",
      ],
      [
        "Shelter away from windows, trees and damaged power lines.",
        "ပြတင်းပေါက်၊ သစ်ပင်နှင့် ပျက်စီးဓာတ်ကြိုးများမှ ဝေးရာတွင် ခိုလှုံပါ။",
      ],
    ] as Pair[],
  },
];
function readChecked(place: string, migrate = false) {
  try {
    const key = `el-nino-hazard-checklist:${place}`;
    let stored = localStorage.getItem(key);
    if (
      !stored &&
      migrate &&
      !localStorage.getItem("el-nino-checklist-migration")
    ) {
      stored = localStorage.getItem("el-nino-hazard-checklist");
      if (stored) localStorage.setItem(key, stored);
      localStorage.setItem("el-nino-checklist-migration", place);
    }
    const x = JSON.parse(stored || "{}");
    return x && typeof x === "object" && !Array.isArray(x)
      ? Object.fromEntries(
          Object.entries(x).filter(([, v]) => typeof v === "boolean"),
        )
      : {};
  } catch {
    return {};
  }
}
function readFilter() {
  try {
    const x = JSON.parse(localStorage.getItem("el-nino-alert-filter") || "{}");
    return {
      scope: ["region", "township"].includes(x.scope) ? x.scope : "nationwide",
      hazard: ["all", "heat", "rainfall", "drought", "flood", "storm"].includes(
        x.hazard,
      )
        ? String(x.hazard)
        : "all",
    };
  } catch {
    return { scope: "nationwide", hazard: "all" };
  }
}
export default function Safety() {
  const {
    t,
    lang,
    data,
    now,
    selected,
    township,
    settlement,
    operational: op,
  } = useApp();
  const place = settlement
    ? `settlement:${settlement}`
    : township
      ? `township:${township}`
      : `region:${selected}`;
  const [filter, setFilter] = useState(readFilter),
    [saved, setSaved] = useState("");
  const [hazard, setHazard] = useState("flood"),
    [checkRecord, setChecked] = useState(() => ({
      place,
      value: readChecked(place, true),
    })),
    [storage, setStorage] = useState(true);
  const checked =
    checkRecord.place === place ? checkRecord.value : readChecked(place);
  const [cropRecord, setCropRecord] = useState(() => ({
    place,
    ...readCropPreference(place),
  }));
  const cropPref =
    cropRecord.place === place ? cropRecord : readCropPreference(place);
  const { crop, stage } = cropPref;
  function changeCrop(key: "crop" | "stage", value: string) {
    const next = { ...cropPref, [key]: value };
    saveCropPreference(place, next);
    setCropRecord({ place, ...next });
  }
  const alerts = prioritizeAlerts(data, selected, now).filter(
    (a) =>
      (filter.scope === "nationwide" || a.regionId === selected) &&
      (filter.hazard === "all" || a.type === filter.hazard),
  );
  const expired = warningHistory(data, now);
  const list = hazards.find((h) => h.id === hazard)!;
  const done = list.items.filter((_, i) => checked[`${hazard}-${i}`]).length;
  const signals = signalsFor(op, data, selected, now).filter((s) =>
    ["heat", "rain", "wind", "dryness"].includes(s.hazard),
  );
  const levels = {
    normal: t("Low screened concern", "စစ်ဆေးမှုအရ စိုးရိမ်မှုနည်း"),
    advisory: t("Attention", "ဂရုပြုရန်"),
    watch: t("Elevated", "စိုးရိမ်မှုပိုရှိ"),
    warning: t("High", "စိုးရိမ်မှုမြင့်"),
    severe: t("Very high", "စိုးရိမ်မှုအလွန်မြင့်"),
    unknown: t("Unavailable", "မရရှိပါ"),
  };
  function toggle(i: number) {
    const key = `${hazard}-${i}`,
      next = { ...checked, [key]: !checked[key] };
    setChecked({ place, value: next });
    try {
      localStorage.setItem(
        `el-nino-hazard-checklist:${place}`,
        JSON.stringify(next),
      );
      setStorage(true);
    } catch {
      setStorage(false);
    }
  }
  return (
    <>
      <header className="page-title">
        <p className="eyebrow">
          {t(
            "SMALL STEPS. PRACTICAL PREPARATION.",
            "သေးငယ်သော လုပ်ဆောင်မှုမှ လက်တွေ့ပြင်ဆင်ရေးသို့။",
          )}
        </p>
        <h1>
          {t("Stay informed. Stay prepared.", "သတင်းသိရှိပြီး အသင့်ပြင်ဆင်ပါ။")}
        </h1>
        <p>
          {t(
            "Official warnings, clearly separated from model estimates. Simple plans you can save on this device.",
            "တရားဝင်သတိပေးချက်နှင့် မော်ဒယ်ခန့်မှန်းချက်ကို ခွဲခြားထားသည်။ ရိုးရှင်းသောအစီအစဉ်ကို ဤစက်တွင် သိမ်းနိုင်သည်။",
          )}
        </p>
      </header>
      <section className="surface padded warning-center">
        <div className="row spread">
          <h2>
            <ShieldCheck size={22} />
            {t("Official warning centre", "တရားဝင် သတိပေးဗဟို")}
          </h2>
          <span className="status-pill delayed">
            {t("Feed not connected", "ဒေတာ မချိတ်ဆက်ရသေး")}
          </span>
        </div>
        <p>
          {t(
            "Automated Myanmar official-warning coverage is unavailable. Check the issuer directly for current warnings; no listed warning is not an all-clear.",
            "မြန်မာ တရားဝင်သတိပေးချက် အလိုအလျောက်ဒေတာ မရရှိပါ။ လက်ရှိသတိပေးချက်ကို မူရင်းထုတ်ပြန်သူထံ စစ်ဆေးပါ။ စာရင်းမရှိခြင်းသည် ဘေးကင်းကြောင်း မဆိုလိုပါ။",
          )}
        </p>
        <div className="official-links">
          <a
            href="https://www.moezala.gov.mm/en/cyclone-warning"
            target="_blank"
            rel="noreferrer"
          >
            {t("DMH cyclone bulletins", "မိုးဇလ မုန်တိုင်းကြေညာချက်")}
            <ArrowUpRight size={16} />
          </a>
          <a
            href="https://www.moezala.gov.mm/en/flood-bulletin"
            target="_blank"
            rel="noreferrer"
          >
            {t("DMH flood bulletins", "မိုးဇလ ရေကြီးကြေညာချက်")}
            <ArrowUpRight size={16} />
          </a>
        </div>
        <Source id="official-warning" />
        <details className="inner-details">
          <summary>
            {t(
              "Filter the in-site warning list",
              "ဤစာမျက်နှာ သတိပေးစာရင်း စစ်ထုတ်ရန်",
            )}
          </summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                localStorage.setItem(
                  "el-nino-alert-filter",
                  JSON.stringify(filter),
                );
                setSaved(
                  t(
                    "Device filter saved. This does not subscribe to notifications.",
                    "စက်တွင် စစ်ထုတ်မှု သိမ်းပြီးပါပြီ။ အသိပေးချက် စာရင်းသွင်းခြင်း မဟုတ်ပါ။",
                  ),
                );
              } catch {
                setSaved(
                  t(
                    "Saved for this visit only; device storage is blocked.",
                    "ဤအကြိမ်အတွက်သာ သိမ်းသည်။ စက်သိုလှောင်ခွင့် ပိတ်ထားသည်။",
                  ),
                );
              }
            }}
          >
            <div className="form-grid">
              <label>
                {t("Area", "ဒေသ")}
                <select
                  aria-label={t("Area", "ဒေသ")}
                  value={filter.scope}
                  onChange={(e) =>
                    setFilter({ ...filter, scope: e.target.value })
                  }
                >
                  <option value="nationwide">
                    {t("Nationwide", "တစ်နိုင်ငံလုံး")}
                  </option>
                  <option value="region">{regionName(selected, lang)}</option>
                  {township && (
                    <option value="township">
                      {townshipByCode(township)?.[lang]} ·{" "}
                      {t("parent-region context", "ပြည်နယ်/တိုင်းနောက်ခံ")}
                    </option>
                  )}
                </select>
              </label>
              <label>
                {t("Hazard", "ဘေးအမျိုးအစား")}
                <select
                  aria-label={t("Hazard", "ဘေးအမျိုးအစား")}
                  value={filter.hazard}
                  onChange={(e) =>
                    setFilter({ ...filter, hazard: e.target.value })
                  }
                >
                  {[
                    ["all", "All hazards", "ဘေးအားလုံး"],
                    ["heat", "Heat", "အပူဒဏ်"],
                    ["rainfall", "Rainfall", "မိုးရေ"],
                    ["drought", "Drought", "မိုးခေါင်"],
                    ["flood", "Flood", "ရေကြီး"],
                    ["storm", "Storm", "မုန်တိုင်း"],
                  ].map(([id, en, my]) => (
                    <option key={id} value={id}>
                      {t(en, my)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit">
              {t("Save device filter", "စက်တွင် စစ်ထုတ်မှု သိမ်းရန်")}
            </button>
            <p role="status" className="small">
              {saved}
            </p>
            <p className="small muted">
              {t(
                "Township selection filters parent-region context only; direct township bulletin coverage is unavailable. No account or contact details are stored.",
                "မြို့နယ်ရွေးခြင်းသည် သက်ဆိုင်ရာပြည်နယ်/တိုင်းနောက်ခံကိုသာ စစ်ထုတ်သည်။ တိုက်ရိုက်မြို့နယ်ကြေညာချက် မရရှိပါ။ အကောင့်၊ ဆက်သွယ်ရန်ဒေတာ မသိမ်းပါ။",
              )}
            </p>
          </form>
        </details>
        {alerts.map((a) => (
          <OfficialNotice key={a.id} alert={a} />
        ))}
        {expired.length > 0 && (
          <details className="inner-details">
            <summary>
              {t(
                "Expired or unverified notices",
                "သက်တမ်းကုန် သို့မဟုတ် အတည်မပြုနိုင်သော ကြေညာချက်များ",
              )}
            </summary>
            {expired.map((a) => (
              <OfficialNotice key={a.id} alert={a} />
            ))}
          </details>
        )}
      </section>
      <details className="disclosure">
        <summary>
          {t(
            "Automated screening estimates · not official warnings",
            "အလိုအလျောက် စစ်ဆေးခန့်မှန်းချက် · တရားဝင်သတိပေးချက် မဟုတ်",
          )}
        </summary>
        <div>
          <p>
            {regionName(selected, lang)} ·{" "}
            {t(
              "Existing published screening thresholds are not calibrated against Myanmar local impacts. Unknown inputs stay unavailable. ENSO does not raise local severity.",
              "ယခင်ထုတ်ပြန်စစ်ဆေးသတ်မှတ်ချက်များကို မြန်မာဒေသထိခိုက်မှုနှင့် မချိန်ညှိရသေးပါ။ မသိသောဒေတာကို မရရှိဟု ပြသည်။ ENSO ကြောင့် ဒေသအန္တရာယ်အဆင့် မတိုးပါ။",
            )}
          </p>
          <div className="screening-list">
            {signals.map((s) => (
              <article key={s.hazard}>
                <div className="row spread">
                  <h3>{t(...hazardNames[s.hazard])}</h3>
                  <span className={`status-pill screening-${s.level}`}>
                    {levels[s.level]}
                  </span>
                </div>
                <p>{t(...s.evidence)}</p>
                <p className="small muted">
                  {s.historical
                    ? op.history
                      ? `${op.history.start} → ${op.history.end}`
                      : t("No valid period", "သက်တမ်းမရရှိ")
                    : op.weather
                      ? `${mmt(op.weather.validAt, lang)} → ${mmt(op.weather.through, lang)}`
                      : t("No valid period", "သက်တမ်းမရရှိ")}
                </p>
                <Source
                  id={
                    s.historical
                      ? "dry-days"
                      : s.hazard === "heat"
                        ? "heat-index"
                        : s.hazard === "wind"
                          ? "wind"
                          : "rain-forecast"
                  }
                />
              </article>
            ))}
          </div>
        </div>
      </details>
      <section className="preparedness-section">
        <SectionHeading
          title={t(
            "Your preparedness checklist",
            "သင့်ကြိုတင်ပြင်ဆင်ရေး စာရင်း",
          )}
        />
        <p>
          {t(
            "General educational guidance. Progress is saved separately for the selected place on this device and works offline after the first visit.",
            "ယေဘုယျ ပညာပေးလမ်းညွှန်ဖြစ်သည်။ ရွေးထားသောဒေသတစ်ခုစီ၏ ပြီးစီးမှုကို ဤစက်တွင် သီးခြားသိမ်းပြီး ပထမအကြိမ်ပြီးနောက် အော့ဖ်လိုင်း သုံးနိုင်သည်။",
          )}
        </p>
        <div
          className="hazard-tabs"
          role="group"
          aria-label={t("Preparedness hazard", "ပြင်ဆင်ရေး ဘေးအမျိုးအစား")}
        >
          {hazards.map((h) => (
            <button
              key={h.id}
              onClick={() => setHazard(h.id)}
              aria-pressed={hazard === h.id}
            >
              <h.icon size={18} />
              {t(...h.name)}
            </button>
          ))}
        </div>
        <div className="surface padded">
          <div className="row spread">
            <h3>{t(...list.name)}</h3>
            <button
              className="icon-button"
              aria-label={t("Print checklist", "စာရင်း ပုံနှိပ်ရန်")}
              onClick={() => window.print()}
            >
              <Printer size={18} />
            </button>
          </div>
          <p aria-live="polite">
            {done} / {list.items.length} {t("complete", "ပြီးစီး")}
          </p>
          <progress
            className="checklist-progress"
            value={done}
            max={list.items.length}
            aria-label={t("Checklist completion", "စာရင်း ပြီးစီးမှု")}
          />
          <div className="hazard-checklist">
            {list.items.map((item, i) => (
              <label
                key={`${hazard}-${i}`}
                className={checked[`${hazard}-${i}`] ? "done" : ""}
              >
                <input
                  type="checkbox"
                  checked={!!checked[`${hazard}-${i}`]}
                  onChange={() => toggle(i)}
                />
                <span>{t(...item)}</span>
                {!!checked[`${hazard}-${i}`] && <Check size={18} />}
              </label>
            ))}
          </div>
          <p className="small muted">
            {storage
              ? t(
                  "Saved only on this device. No personal details are collected.",
                  "ဤစက်တွင်သာ သိမ်းသည်။ ကိုယ်ရေးအချက်အလက် မကောက်ယူပါ။",
                )
              : t(
                  "Storage unavailable; progress lasts for this visit only.",
                  "သိမ်းဆည်းခွင့်မရှိ၍ ယခုအကြိမ်အတွက်သာ ထိန်းထားသည်။",
                )}
          </p>
          <Source id={`safety-${hazard}`} />
        </div>
      </section>
      <OfficialHealth />
      <EmergencyContacts />
      <section className="surface padded crop-section">
        <h2>{t("For your crop & season", "သင့်သီးနှံနှင့် ရာသီအတွက်")}</h2>
        <p>
          {t(
            "General FAO-informed seasonal considerations. The field location, planting system and actual moisture are unknown.",
            "FAO အချက်အလက်အခြေခံ ယေဘုယျရာသီစဉ်းစားရန်ဖြစ်သည်။ လယ်ကွင်းတည်နေရာ၊ စိုက်ပျိုးစနစ်နှင့် အမှန်တကယ်အစိုဓာတ်ကို မသိပါ။",
          )}
        </p>
        <div className="form-grid">
          <label>
            {t("Crop", "သီးနှံ")}
            <select
              aria-label={t("Crop", "သီးနှံ")}
              value={crop}
              onChange={(e) => changeCrop("crop", e.target.value)}
            >
              <option value="rice">{t("Rice", "စပါး")}</option>
              <option value="maize">{t("Maize", "ပြောင်း")}</option>
              <option value="pulses">{t("Pulses", "ပဲမျိုးစုံ")}</option>
            </select>
          </label>
          <label>
            {t("Growth stage assumption", "ယူဆထားသော ကြီးထွားအဆင့်")}
            <select
              aria-label={t(
                "Growth stage assumption",
                "ယူဆထားသော ကြီးထွားအဆင့်",
              )}
              value={stage}
              onChange={(e) => changeCrop("stage", e.target.value)}
            >
              {[
                ["seedling", "Establishment", "အပင်ငယ်"],
                ["vegetative", "Vegetative growth", "အပင်ကြီးထွား"],
                [
                  "flowering",
                  "Flowering / grain filling",
                  "ပန်းပွင့် / အစေ့ဖြည့်",
                ],
                ["harvest", "Harvest", "ရိတ်သိမ်း"],
              ].map(([id, en, my]) => (
                <option key={id} value={id}>
                  {t(en, my)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="crop-guidance" aria-live="polite">
          <p>
            {crop === "rice"
              ? t(
                  "Rice water management depends on the production system. Check actual water availability and drainage with local crop advice.",
                  "စပါးရေစီမံမှုသည် စိုက်ပျိုးစနစ်ပေါ် မူတည်သည်။ အမှန်တကယ်ရေရရှိမှုနှင့် ရေနုတ်မြောင်းကို ဒေသအကြံဉာဏ်ဖြင့် စစ်ဆေးပါ။",
                )
              : crop === "maize"
                ? t(
                    "Maize water needs vary through its growth stages. Regional rainfall cannot establish water adequacy in your field.",
                    "ပြောင်းရေလိုအပ်ချက်သည် ကြီးထွားအဆင့်အလိုက် ကွာသည်။ ဒေသမိုးရေမှ သင့်လယ်ကွင်းရေလုံလောက်မှု မသတ်မှတ်နိုင်ပါ။",
                  )
                : t(
                    "Pulses include different species with different requirements. Check species, soil moisture and drainage before decisions.",
                    "ပဲမျိုးစုံတွင် လိုအပ်ချက်ကွဲသော မျိုးစိတ်များ ပါသည်။ ဆုံးဖြတ်မီ မျိုးစိတ်၊ မြေအစိုဓာတ်နှင့် ရေနုတ်မှုကို စစ်ဆေးပါ။",
                  )}
          </p>
          <p>
            {stage === "harvest"
              ? t(
                  "Harvest-stage assumption: review the forecast and local drying/storage conditions. This is not a precise harvest-date recommendation.",
                  "ရိတ်သိမ်းအဆင့်ဟု ယူဆထားသည်။ ခန့်မှန်းချက်နှင့် ဒေသအခြောက်ခံ/သိုလှောင်အခြေအနေ စစ်ဆေးပါ။ တိကျသော ရိတ်သိမ်းရက် အကြံပြုချက် မဟုတ်ပါ။",
                )
              : t(
                  "Confirm the selected growth stage with local agricultural advice. No precise sowing date or yield promise is provided.",
                  "ရွေးထားသောအဆင့်ကို ဒေသစိုက်ပျိုးရေးအကြံဉာဏ်ဖြင့် အတည်ပြုပါ။ တိကျသောစိုက်ရက် သို့မဟုတ် အထွက်နှုန်း မကတိပြုပါ။",
                )}
          </p>
        </div>
        <Unavailable>
          {t(
            "Field soil moisture, irrigation supply and crop stress measurements are unavailable.",
            "လယ်ကွင်းမြေအစိုဓာတ်၊ ရေပေးရရှိမှုနှင့် သီးနှံဖိအားတိုင်းတာချက် မရရှိပါ။",
          )}
        </Unavailable>
        <Source id="agriculture" />
      </section>
      <section className="subscription-section">
        <Bell size={24} />
        <div>
          <h2>
            {t(
              "Notification delivery is not available yet",
              "အသိပေးချက် ပေးပို့မှု မရရှိသေးပါ",
            )}
          </h2>
          <p>
            {t(
              "Browser push and Telegram subscriptions are unshipped. A verified warning feed, secure consent/unsubscribe storage, deduplication and a tested delivery worker are still needed. Free scheduled jobs cannot promise immediate emergency delivery.",
              "ဘရောက်ဇာနှင့် Telegram စာရင်းသွင်းပေးပို့မှု မဖွင့်ရသေးပါ။ အတည်ပြုသတိပေးဒေတာ၊ လုံခြုံသော ခွင့်ပြု/ပယ်ဖျက်သိမ်းဆည်းမှု၊ ထပ်ပေးပို့မှုကာကွယ်ရေးနှင့် စမ်းသပ်ပေးပို့စနစ် လိုသေးသည်။ အခမဲ့ အချိန်ဇယားစနစ်က ချက်ချင်းအရေးပေါ်ပေးပို့မှု မကတိပြုနိုင်ပါ။",
            )}
          </p>
          <Source id="subscriptions" />
        </div>
      </section>
    </>
  );
}
