import { lazy, Suspense, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useApp } from "../app/context";
import { canonicalRegions, regionName } from "../data/regions";
import { number } from "../data/presentation";
import {
  searchSettlements,
  settlementName,
  townshipByCode,
  settlementById,
} from "../data/locations";
import { WeatherSummary, Source, Unavailable } from "../components/Service";
const MyanmarMap = lazy(() => import("../map/MyanmarMap"));
export default function AreaMap() {
  const {
      t,
      lang,
      selected,
      setSelected,
      settlement,
      setSettlement,
      lowData,
      openLocations,
      operational: op,
    } = useApp(),
    [query, setQuery] = useState("");
  const [placeLimit, setPlaceLimit] = useState(20);
  const [regionQuery, setRegionQuery] = useState("");
  const places = searchSettlements(query, query.trim() ? undefined : selected);
  const regions = canonicalRegions.filter((r) =>
    r.source_aliases.some((a) =>
      a.toLocaleLowerCase().includes(regionQuery.toLocaleLowerCase().trim()),
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
      <button className="township-search-button" onClick={openLocations}>
        <Search size={17} />
        {t(
          "Search cities, towns or townships",
          "မြို့ သို့မဟုတ် မြို့နယ် ရှာရန်",
        )}
      </button>
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
          {settlementById(settlement) && (
            <p className="precision-note">
              <a href={`#/settlement/${settlement}`}>
                {settlementName(settlementById(settlement)!, lang)} ·{" "}
                {t("Place overview", "တည်နေရာ အကျဉ်းချုပ်")} →
              </a>
            </p>
          )}
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
        <h2>{t("Cities, towns & settlements", "မြို့နှင့် အခြေချနေရာများ")}</h2>
        <p>
          {t(
            "Search named settlement points separately from administrative townships. The list begins in your selected region; type a name to search all 515 points. A selected point is labeled on the map.",
            "အုပ်ချုပ်ရေးမြို့နယ်များနှင့် သီးခြား အမည်ပါ အခြေချနေရာမှတ်များကို ရှာပါ။ စာရင်းကို ရွေးထားသော ပြည်နယ်/တိုင်းမှ စပြသည်။ နေရာမှတ် 515 ခုလုံးရှာရန် အမည်ရိုက်ပါ။ ရွေးထားသောနေရာကို မြေပုံတွင် အမည်ဖြင့် ပြသည်။",
          )}
        </p>
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">
            {t("Search city or town names", "မြို့အမည် ရှာရန်")}
          </span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPlaceLimit(20);
            }}
            placeholder={t(
              "City, town or parent area…",
              "မြို့ သို့မဟုတ် သက်ဆိုင်ရာဒေသ…",
            )}
          />
        </label>
        <p className="small" role="status">
          {places.length}{" "}
          {t("settlement points match", "ကိုက်ညီသော အခြေချနေရာမှတ်")}
        </p>
        <div className="area-list settlement-list">
          {places.slice(0, placeLimit).map((point) => (
            <button
              key={point.id}
              onClick={() => setSettlement(point.id)}
              aria-pressed={point.id === settlement}
            >
              <MapPin size={17} />
              <span>
                {settlementName(point, lang)}
                <small>
                  {point.en} · {townshipByCode(point.townshipCode)?.[lang]}
                </small>
              </span>
            </button>
          ))}
        </div>
        {places.length > placeLimit && (
          <button onClick={() => setPlaceLimit((n) => n + 40)}>
            {t("Show more places", "နေရာများ ထပ်ပြရန်")}
          </button>
        )}
        <Source id="settlements" />
      </section>
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
            value={regionQuery}
            onChange={(e) => setRegionQuery(e.target.value)}
            placeholder={t(
              "Search state or region…",
              "ပြည်နယ် သို့မဟုတ် တိုင်း ရှာပါ…",
            )}
          />
        </label>
        <div className="area-list region-list">
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
          "Township name search is available from the pinned gazetteer. Village search, verified flood extent, gauge levels and township flood alerts remain unavailable; there is no validated live hydrology feed.",
          "သတ်မှတ်ဗားရှင်းအမည်စာရင်းမှ မြို့နယ်ရှာနိုင်ပါသည်။ ကျေးရွာရှာဖွေမှု၊ အတည်ပြုရေလွှမ်းဧရိယာ၊ မြစ်ရေမှတ်နှင့် မြို့နယ်ရေကြီးသတိပေးချက် မရရှိပါ။ အတည်ပြုတိုက်ရိုက်ရေဗေဒဒေတာ မရှိပါ။",
        )}
      </Unavailable>
      <Source id="townships" />
    </>
  );
}
