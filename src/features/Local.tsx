import { lazy, Suspense } from "react";
import { MapPin } from "lucide-react";
import { useApp } from "../app/context";
import { regions } from "../data/regions";
import { PageTitle, AlertCard } from "../components/shared";
import { RegionalProfile } from "../components/Operational";
import { RegionEvidence } from "../components/Intelligence";
import { activeAlerts } from "../risk/engine";
const MyanmarMap = lazy(() => import("../map/MyanmarMap"));
export function RegionSelector({
  value,
  onChange,
  all = false,
}: {
  value: string;
  onChange: (v: string) => void;
  all?: boolean;
}) {
  const { t, lang } = useApp();
  return (
    <label className="region-select">
      <MapPin size={18} />
      <span>{t("State / Region", "ပြည်နယ် / တိုင်းဒေသကြီး")}</span>
      <select
        aria-label={t("State / Region", "ပြည်နယ် / တိုင်းဒေသကြီး")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {all && <option value="all">{t("All areas", "ဒေသအားလုံး")}</option>}
        {regions.map((r) => (
          <option key={r[0]} value={r[0]}>
            {r[lang === "en" ? 1 : 2]}
          </option>
        ))}
      </select>
    </label>
  );
}
export function MapPage({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (s: string) => void;
}) {
  const { t, lowData } = useApp();
  return (
    <>
      <PageTitle
        eyebrow={t("LOCATION & RISK", "ဒေသနှင့် အန္တရာယ်")}
        title={t("Your area, in context.", "သင့်ဒေသ အခြေအနေကို သိရှိပါ။")}
        description={t(
          "Choose a layer and region. Hatched areas have missing or stale evidence.",
          "အလွှာနှင့် ဒေသရွေးပါ။ မျဉ်းစင်းနေရာများတွင် ဒေတာမရရှိ သို့မဟုတ် သက်တမ်းကျော်နေသည်။",
        )}
      />
      <RegionSelector value={selected} onChange={onSelect} />
      <div className="v2-map-grid">
        <section className="panel">
          {lowData ? (
            <div className="padded">
              {t(
                "Map paused in Low Data Mode. Use the region selector.",
                "ဒေတာချွေတာစနစ်တွင် မြေပုံပိတ်ထားသည်။ ဒေသရွေးချယ်ရန် စာရင်းကို သုံးပါ။",
              )}
            </div>
          ) : (
            <Suspense
              fallback={<p>{t("Loading map…", "မြေပုံ ဖွင့်နေသည်…")}</p>}
            >
              <MyanmarMap
                selected={selected}
                onSelect={(id) => {
                  onSelect(id);
                  if (window.innerWidth < 760)
                    document
                      .getElementById("selected-profile")
                      ?.scrollIntoView({ block: "start" });
                }}
              />
            </Suspense>
          )}
        </section>
        <aside
          className="panel padded"
          id="selected-profile"
          aria-live="polite"
        >
          <RegionalProfile id={selected} />
        </aside>
      </div>
    </>
  );
}
export function RegionPage({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (s: string) => void;
}) {
  const { t, data, now } = useApp();
  return (
    <>
      <PageTitle
        eyebrow={t("AREA PROFILE", "ဒေသအချက်အလက်")}
        title={t(
          "Weather, risks and your next steps.",
          "မိုးလေဝသ၊ အန္တရာယ်နှင့် လုပ်ဆောင်ရန်။",
        )}
        description={t(
          "Forecasts and historical reanalysis are dated separately.",
          "ခန့်မှန်းချက်နှင့် သမိုင်းပြန်လည်ဆန်းစစ်ဒေတာ ရက်စွဲများကို သီးခြားဖော်ပြထားသည်။",
        )}
      />
      <RegionSelector
        value={selected}
        onChange={(id) => {
          onSelect(id);
          location.hash = "/region/" + id;
        }}
      />
      {activeAlerts(data, now)
        .filter((a) => a.regionId === selected)
        .map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}
      <section className="panel padded">
        <RegionalProfile id={selected} full />
      </section>
      <RegionEvidence id={selected} />
      <p>
        <a href="#/">
          {t(
            "Current ENSO outlook → Overview",
            "လက်ရှိ ENSO မျှော်မှန်းချက် → အကျဉ်းချုပ်",
          )}
        </a>
      </p>
      <a className="button primary" href="#/prepare">
        {t("Make a preparedness plan", "ကြိုတင်ပြင်ဆင်ရန်")}
      </a>
    </>
  );
}
