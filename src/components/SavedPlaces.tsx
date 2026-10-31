import { Bookmark, X, Plus } from "lucide-react";
import { useApp } from "../app/context";
import { savedPlace, placeName } from "../data/locations";
import { activeAlerts } from "../risk/engine";
export default function SavedPlaces() {
  const {
    t,
    lang,
    savedPlaces,
    selected,
    township,
    togglePlace,
    setTownship,
    setSelected,
    openLocations,
    data,
    now,
  } = useApp();
  const current = township ? `township:${township}` : `region:${selected}`;
  return (
    <section className="saved-places" aria-labelledby="saved-places-title">
      <div className="section-heading">
        <h2 id="saved-places-title">
          <Bookmark size={19} /> {t("Your saved places", "သိမ်းထားသော ဒေသများ")}
        </h2>
        <button
          onClick={() => togglePlace(current)}
          disabled={!savedPlaces.includes(current) && savedPlaces.length >= 12}
          aria-pressed={savedPlaces.includes(current)}
        >
          <Plus size={15} />
          {savedPlaces.includes(current)
            ? t("Remove current place", "လက်ရှိဒေသ ဖယ်ရန်")
            : t("Save current place", "လက်ရှိဒေသ သိမ်းရန်")}
        </button>
      </div>
      <p className="small muted">
        {t(
          "Up to 12 places, only on this device. Regional notices are context for a township; township alert coverage is unknown. This does not subscribe you to messages.",
          "ဤစက်တွင်သာ ဒေသ 12 ခုအထိ သိမ်းနိုင်သည်။ ပြည်နယ်/တိုင်းကြေညာချက်သည် မြို့နယ်အတွက် နောက်ခံသာဖြစ်ပြီး မြို့နယ်သတိပေးဒေတာ မသိပါ။ ပေးပို့မှု စာရင်းသွင်းခြင်း မဟုတ်ပါ။",
        )}
      </p>
      <div className="saved-place-list">
        {savedPlaces.map((id) => {
          const p = savedPlace(id)!;
          const alerts = activeAlerts(data, now).filter(
            (a) => a.regionId === p.regionId,
          );
          return (
            <article key={id}>
              <button
                className="saved-place-select"
                onClick={() =>
                  p.township
                    ? setTownship(p.township.code)
                    : setSelected(p.regionId)
                }
              >
                <strong>{placeName(id, lang)}</strong>
                <small>
                  {alerts.length
                    ? `${alerts.length} ${t("parent-region official notices", "သက်ဆိုင်ရာ ပြည်နယ်/တိုင်း ကြေညာချက်")}`
                    : t("Official coverage unknown", "တရားဝင်သတိပေးဒေတာ မသိ")}
                </small>
              </button>
              <button
                className="icon-button"
                onClick={() => togglePlace(id)}
                aria-label={`${t("Remove saved place", "သိမ်းထားသောဒေသ ဖယ်ရန်")} ${placeName(id, lang)}`}
              >
                <X size={17} />
              </button>
            </article>
          );
        })}
      </div>
      {!savedPlaces.length && (
        <button className="text-link" onClick={openLocations}>
          {t(
            "Choose a township or region to begin",
            "စတင်ရန် မြို့နယ် သို့မဟုတ် ပြည်နယ်/တိုင်း ရွေးပါ",
          )}
        </button>
      )}
    </section>
  );
}
