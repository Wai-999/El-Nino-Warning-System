import { lazy, Suspense } from "react";
import { useApp } from "../app/context";
import { Source } from "./Service";
const MyanmarMap = lazy(() => import("../map/MyanmarMap"));
export default function HomeMap() {
  const { t, selected, setSelected, lowData, openLocations } = useApp();
  return (
    <section className="surface home-map" aria-labelledby="home-map-title">
      <div className="section-heading">
        <h2 id="home-map-title">{t("Find your place", "သင့်ဒေသကို ရှာပါ")}</h2>
        <button onClick={openLocations}>
          {t("Search cities & townships", "မြို့ / မြို့နယ် ရှာရန်")}
        </button>
      </div>
      {lowData ? (
        <p>
          {t(
            "Map paused in low data mode. Search or choose a saved place.",
            "ဒေတာချွေတာစနစ်တွင် မြေပုံရပ်ထားသည်။ ရှာဖွေမှု သို့မဟုတ် သိမ်းထားသောဒေသကို သုံးပါ။",
          )}
        </p>
      ) : (
        <Suspense fallback={<p>{t("Loading map…", "မြေပုံ ဖွင့်နေသည်…")}</p>}>
          <MyanmarMap selected={selected} onSelect={setSelected} compact />
        </Suspense>
      )}
      <p className="small muted">
        {t(
          "Select a state/region on the map, or search city/town names and 330 townships. Colors follow the named layer and its dated source; they do not establish city or township warning coverage.",
          "မြေပုံမှ ပြည်နယ်/တိုင်းရွေးပါ သို့မဟုတ် မြို့အမည်နှင့် မြို့နယ် 330 ကို ရှာပါ။ အရောင်များသည် အမည်ဖော်ပြအလွှာနှင့် ရက်စွဲပါရင်းမြစ်ကို လိုက်နာပြီး မြို့ သို့မဟုတ် မြို့နယ်သတိပေးဒေတာကို မသတ်မှတ်ပါ။",
        )}
      </p>
      <Source id="boundaries" /> <Source id="townships" />
      <p>
        <a href="#/map">
          {t(
            "Open map controls & accessible list",
            "မြေပုံထိန်းချုပ်မှုနှင့် စာရင်း ဖွင့်ရန်",
          )}{" "}
          →
        </a>
      </p>
    </section>
  );
}
