import { lazy, Suspense, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useApp } from "../app/context";
import { canonicalRegions, regionName } from "../data/regions";
import { number } from "../data/presentation";
import { WeatherSummary, Source, Unavailable } from "../components/Service";
const MyanmarMap = lazy(() => import("../map/MyanmarMap"));
export default function AreaMap() {
  const { t, lang, selected, setSelected, lowData, operational: op } = useApp(),
    [query, setQuery] = useState("");
  const regions = canonicalRegions.filter((r) =>
    r.source_aliases.some((a) =>
      a.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()),
    ),
  );
  return (
    <>
      <header className="page-title">
        <p className="eyebrow">{t("PLACE MATTERS", "ဒေသအလိုက် ကြည့်ရန်")}</p>
        <h1>{t("Explore Myanmar", "မြန်မာဒေသများ ကြည့်ရန်")}</h1>
        <p>
          {t(
            "Choose a region on the map or from the accessible list. These are regional samples, not township measurements.",
            "မြေပုံ သို့မဟုတ် စာရင်းမှ ဒေသရွေးပါ။ ဒေသနမူနာများဖြစ်ပြီး မြို့နယ်တိုင်းတာချက် မဟုတ်ပါ။",
          )}
        </p>
      </header>
      <div className="area-map-layout">
        <section className="surface map-surface">
          {lowData ? (
            <Unavailable>
              {t(
                "Map paused in low data mode. Use the list below, or turn low data mode off in the menu.",
                "ဒေတာချွေတာစနစ်တွင် မြေပုံရပ်ထားသည်။ အောက်စာရင်းသုံးပါ သို့မဟုတ် မီနူးမှ ဒေတာချွေတာစနစ် ပိတ်ပါ။",
              )}
            </Unavailable>
          ) : (
            <Suspense
              fallback={
                <p className="padded">
                  {t("Loading map…", "မြေပုံ ဖွင့်နေသည်…")}
                </p>
              }
            >
              <MyanmarMap selected={selected} onSelect={setSelected} />
            </Suspense>
          )}
          <div className="map-source">
            <Source id="boundaries" />
            <Source id="temperature" />
          </div>
        </section>
        <aside className="selected-area">
          <WeatherSummary compact />
          <div className="precision-note">
            <MapPin size={18} />
            <p>
              {t(
                "Three 0.25° cells represent a whole region. A finer administrative boundary does not make the forecast more precise.",
                "ဒေသတစ်ခုလုံးအတွက် ၀.၂၅° နမူနာသုံးခုသာ သုံးသည်။ နယ်နိမိတ် အသေးစိတ်ဖြစ်ခြင်းက ခန့်မှန်းချက် ပိုတိကျသည်ဟု မဆိုလိုပါ။",
              )}
            </p>
          </div>
        </aside>
      </div>
      <section className="area-list-section">
        <div className="section-heading">
          <h2>{t("Choose from the list", "စာရင်းမှ ရွေးရန်")}</h2>
        </div>
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">
            {t("Filter regions", "ဒေသစစ်ထုတ်ရန်")}
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              "Search state or region…",
              "ပြည်နယ် သို့မဟုတ် တိုင်း ရှာပါ…",
            )}
          />
        </label>
        <div className="area-list">
          {regions.map((r) => {
            const w = op.weather?.regions.find(
              (w) => w.id === r.canonical_region_id,
            );
            return (
              <button
                key={r.canonical_region_id}
                onClick={() => setSelected(r.canonical_region_id)}
                aria-pressed={selected === r.canonical_region_id}
              >
                <MapPin size={17} />
                <span>
                  {regionName(r.canonical_region_id, lang)}
                  <small>
                    {t("Regional model snapshot", "ဒေသ မော်ဒယ်ဒေတာ")}
                  </small>
                </span>
                <strong>{number(w?.now.temperature, lang, 0)}°C</strong>
              </button>
            );
          })}
        </div>
        {regions.length === 0 && (
          <p role="status">
            {t("No matching regions.", "ကိုက်ညီသောဒေသ မရှိပါ။")}
          </p>
        )}
      </section>
      <Unavailable>
        {t(
          "Township/village search, verified flood extent, gauge levels and township flood alerts are unavailable. No validated gazetteer or live hydrology feed is connected.",
          "မြို့နယ်/ကျေးရွာရှာဖွေမှု၊ အတည်ပြုရေလွှမ်းဧရိယာ၊ မြစ်ရေမှတ်နှင့် မြို့နယ်ရေကြီးသတိပေးချက် မရရှိပါ။ အတည်ပြုအမည်စာရင်းနှင့် ရေဗေဒဒေတာ မချိတ်ဆက်ရသေးပါ။",
        )}
      </Unavailable>
      <Source id="townships" />
    </>
  );
}
