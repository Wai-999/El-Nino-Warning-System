import { lazy, Suspense } from "react";
import {
  ArrowUpRight,
  MapPin,
  ClipboardCheck,
  Radio,
  ShieldCheck,
  CloudSun,
} from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import { Level, SourceLink, Notice } from "../components/shared";
import { regionalLevel, freshness, activeAlerts } from "../risk/engine";
import { actions, sources } from "../data/content";
import { regionName } from "../data/regions";
const MyanmarMap = lazy(() => import("../map/MyanmarMap"));
export default function Overview({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { t, lang, data, now } = useApp();
  const enso = data.enso;
  const current =
    enso && freshness(enso.issuedAt, enso.validUntil, now) === "current";
  const active = activeAlerts(data, now);
  const status = enso
    ? {
        "El Niño Advisory": t("El Niño advisory", "အယ်လ်နီညို အသိပေးချက်"),
        "La Niña Advisory": t("La Niña advisory", "လာနီညာ အသိပေးချက်"),
        "El Niño Watch": t("El Niño watch", "အယ်လ်နီညို စောင့်ကြည့်ရန်"),
        "La Niña Watch": t("La Niña watch", "လာနီညာ စောင့်ကြည့်ရန်"),
        "Not Active": t("No ENSO advisory", "ENSO အသိပေးချက် မရှိ"),
      }[enso.status]
    : t("Status unavailable", "အခြေအနေ မရရှိနိုင်");
  return (
    <>
      <header className="overview-heading">
        <div>
          <p className="eyebrow">
            {t(
              "MYANMAR · EARLY WARNING & PREPAREDNESS",
              "မြန်မာနိုင်ငံ · ကြိုတင်သတိပေးနှင့် ပြင်ဆင်ရေး",
            )}
          </p>
          <h1>
            {t(
              "Know the situation. Be prepared.",
              "အခြေအနေကို သိရှိ၍ အသင့်ပြင်ဆင်ပါ။",
            )}
          </h1>
          <p>
            {t(
              "A clear picture of El Niño, and your next practical steps.",
              "အယ်လ်နီညို အခြေအနေနှင့် လက်တွေ့လုပ်ဆောင်ရန် အချက်များ",
            )}
          </p>
        </div>
        <span className="scope-label">
          <ShieldCheck size={16} />
          {t("Independent public resource", "လွတ်လပ်သော ပြည်သူ့အချက်အလက်")}
        </span>
      </header>
      <section className="situation panel">
        <div className="situation-main">
          <div className="row">
            <span
              className={`badge ${current ? "enso-badge" : "level-unknown"}`}
            >
              <Radio size={14} />
              {t("PACIFIC ENSO", "ပစိဖိတ် ENSO")}
            </span>
            <span className="meta">
              {current
                ? t("Official assessment", "တရားဝင် သုံးသပ်ချက်")
                : t("Current status unavailable", "လက်ရှိအခြေအနေ မရရှိနိုင်")}
            </span>
          </div>
          <h2>
            {current
              ? status
              : t(
                  "Check the latest ENSO bulletin",
                  "နောက်ဆုံး ENSO ကြေညာချက်ကို စစ်ဆေးပါ။",
                )}
          </h2>
          <p>
            {t(
              "Pacific conditions can affect our seasons. The impacts in your area still depend on local weather and water conditions.",
              "ပစိဖိတ်အခြေအနေက ရာသီဥတုကို သက်ရောက်နိုင်သည်။ သင့်ဒေသ၏ သက်ရောက်မှုမှာ ဒေသရာသီဥတုနှင့် ရေအခြေအနေအပေါ် မူတည်ပါသည်။",
            )}
          </p>
          <SourceLink href={enso?.source.url || sources.noaa}>
            NOAA CPC{enso ? ` · ${dateLabel(enso.issuedAt, lang)}` : ""}
          </SourceLink>
          {enso && !current && (
            <p className="meta">
              {t("Previous bulletin", "ယခင်ကြေညာချက်")}: {status} ·{" "}
              {t("out of date", "သက်တမ်းကျော်နေသည်")}
            </p>
          )}
        </div>
        <div className="national-status">
          <p className="eyebrow">
            {t("MYANMAR WARNING LEVEL", "မြန်မာနိုင်ငံ သတိပေးအဆင့်")}
          </p>
          <Level level={regionalLevel(data, undefined, now)} />
          <p>
            {t(
              "Regional warning coverage is incomplete. Missing data does not mean there is no risk.",
              "ဒေသသတိပေး အချက်အလက် မပြည့်စုံပါ။ အချက်အလက်မရှိခြင်းသည် အန္တရာယ်မရှိဟု မဆိုလိုပါ။",
            )}
          </p>
          <a className="text-link" href="#/warnings">
            {t("Check warning information", "သတိပေးအချက်အလက် ကြည့်ရန်")}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <div className="overview-grid">
        <section className="panel map-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("YOUR AREA", "သင့်ဒေသ")}</p>
              <h2>{t("Myanmar risk map", "မြန်မာနိုင်ငံ အန္တရာယ်မြေပုံ")}</h2>
            </div>
            <a
              className="icon-link"
              href="#/map"
              aria-label={t("Open full map", "မြေပုံအပြည့် ကြည့်ရန်")}
            >
              <ArrowUpRight />
            </a>
          </div>
          <div className="overview-map-content">
            <Suspense
              fallback={
                <p className="skeleton">
                  {t("Loading map…", "မြေပုံ ဖွင့်နေသည်…")}
                </p>
              }
            >
              <MyanmarMap selected={selected} onSelect={onSelect} compact />
            </Suspense>
            <div className="map-summary">
              <MapPin size={22} />
              <h3>{regionName(selected, lang)}</h3>
              <Level level={regionalLevel(data, selected, now)} />
              <p>
                {t(
                  "Choose an area on the map for local information and preparedness.",
                  "ဒေသအချက်အလက်နှင့် ပြင်ဆင်ရန်အတွက် မြေပုံမှ ဒေသကို ရွေးပါ။",
                )}
              </p>
              <a className="button secondary" href={`#/region/${selected}`}>
                {t("View my area", "သင့်ဒေသ ကြည့်ရန်")}
              </a>
              <p className="meta">
                {t("Highest-risk areas", "အန္တရာယ်အများဆုံးဒေသ")}:{" "}
                {active.length
                  ? regionName(active[0].regionId, lang)
                  : t(
                      "cannot be ranked with available data",
                      "ရရှိသည့်အချက်အလက်ဖြင့် အဆင့်မခွဲနိုင်",
                    )}
              </p>
            </div>
          </div>
        </section>
        <section className="action-panel">
          <p className="eyebrow">
            <ClipboardCheck size={16} />
            {t("START HERE", "ယခုစတင်ပါ")}
          </p>
          <h2>
            {t(
              "Small steps. Better prepared.",
              "ရိုးရှင်းသော ပြင်ဆင်မှုများဖြင့် အသင့်ရှိပါစေ။",
            )}
          </h2>
          <p>
            {t(
              "Useful today, whatever the forecast.",
              "ခန့်မှန်းချက် မည်သို့ပင်ဖြစ်စေ ယနေ့အတွက် အသုံးဝင်သည်။",
            )}
          </p>
          <ol>
            {actions.map((a, i) => (
              <li key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{t(...a)}</p>
              </li>
            ))}
          </ol>
          <a className="button light" href="#/prepare">
            {t("Open my preparedness checklist", "ပြင်ဆင်ရန်စာရင်း ဖွင့်ပါ")}
          </a>
          <span className="meta">
            {t(
              "No account needed · Saved on this device",
              "အကောင့်မလို · ဤစက်တွင် သိမ်းထားသည်",
            )}
          </span>
        </section>
      </div>
      <section
        className="conditions-grid"
        aria-label={t("Local data availability", "ဒေသအချက်အလက် ရရှိမှု")}
      >
        {[
          [
            t("Current local hazard", "လက်ရှိ ဒေသအန္တရာယ်"),
            t("Not verified", "အတည်မပြုနိုင်သေး"),
          ],
          [
            t(
              "Temperature & rainfall anomalies",
              "အပူချိန်နှင့် မိုးရေ ကွာဟချက်",
            ),
            t("Unavailable", "မရရှိနိုင်"),
          ],
          [
            t("Water & agricultural stress", "ရေနှင့် စိုက်ပျိုးရေး ဖိအား"),
            t("Not assessed", "မသတ်မှတ်နိုင်သေး"),
          ],
        ].map(([label, value]) => (
          <div key={label} className="condition">
            <CloudSun size={20} />
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </section>
      <Notice>
        {t(
          "Use current local official instructions for urgent decisions. This independent resource is not an emergency service.",
          "အရေးပေါ်ဆုံးဖြတ်ချက်အတွက် လက်ရှိ ဒေသဆိုင်ရာ တရားဝင်ညွှန်ကြားချက်ကို လိုက်နာပါ။ ဤလွတ်လပ်သော အချက်အလက်ဝန်ဆောင်မှုသည် အရေးပေါ်ဌာန မဟုတ်ပါ။",
        )}{" "}
        <SourceLink href={sources.dmh}>
          {t("Myanmar DMH", "မိုးလေဝသနှင့် ဇလဗေဒညွှန်ကြားမှုဦးစီးဌာန")}
        </SourceLink>
      </Notice>
    </>
  );
}
