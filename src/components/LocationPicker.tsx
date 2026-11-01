import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import type { Lang } from "../app/context";
import { canonicalRegions } from "../data/regions";
import {
  normalizeSearch,
  searchTownships,
  searchSettlements,
  settlementName,
  townshipByCode,
  settlements,
} from "../data/locations";
import { localDigits } from "../data/locale";
import sampleData from "../../scripts/cache/samples.json";

export default function LocationPicker({
  open,
  onClose,
  selected,
  onSelect,
  lang,
  township,
  onTownship,
  settlement,
  onSettlement,
}: {
  open: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (id: string) => void;
  lang: Lang;
  township: string | null;
  onTownship: (code: string) => void;
  settlement: string | null;
  onSettlement: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState(""),
    [geo, setGeo] = useState("");
  const [kind, setKind] = useState("all"),
    [limit, setLimit] = useState(20);
  const t = (en: string, my: string) =>
    localDigits(lang === "en" ? en : my, lang);
  useEffect(() => {
    if (open) {
      setQuery("");
      setGeo("");
      setKind("all");
      setLimit(20);
      ref.current?.showModal();
    } else ref.current?.close();
  }, [open]);
  const regions = canonicalRegions.filter((r) =>
    r.source_aliases.some((alias) =>
      normalizeSearch(alias).includes(normalizeSearch(query)),
    ),
  );
  const townships = searchTownships(query, query.trim() ? undefined : selected);
  const cities = searchSettlements(query, query.trim() ? undefined : selected);
  function locate() {
    if (!navigator.geolocation) {
      setGeo(
        t(
          "Geolocation unavailable. Choose manually.",
          "တည်နေရာရှာမရပါ။ ကိုယ်တိုင်ရွေးပါ။",
        ),
      );
      return;
    }
    setGeo(
      t(
        "Waiting for your location permission…",
        "တည်နေရာခွင့်ပြုချက် စောင့်နေသည်…",
      ),
    );
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = sampleData.samples
          .map((s) => ({
            ...s,
            distance: Math.hypot(
              (s.lat - coords.latitude) * 111,
              (s.lon - coords.longitude) *
                111 *
                Math.cos((coords.latitude * Math.PI) / 180),
            ),
          }))
          .sort((a, b) => a.distance - b.distance)[0];
        if (
          coords.latitude < 9 ||
          coords.latitude > 29 ||
          coords.longitude < 92 ||
          coords.longitude > 102 ||
          nearest.distance > 200
        ) {
          setGeo(
            t(
              "No nearby validated Myanmar sample. Please choose manually.",
              "နီးစပ်သော မြန်မာဒေသနမူနာ မတွေ့ပါ။ ကိုယ်တိုင်ရွေးပါ။",
            ),
          );
          return;
        }
        onSelect(nearest.regionId);
        setGeo(
          t(
            "Approximate region selected. Check the selection below; this is not a precise boundary lookup.",
            "အနီးစပ်ဆုံးဒေသကို ရွေးထားသည်။ အောက်ပါရွေးချယ်မှုကို စစ်ဆေးပါ။ တိကျသောနယ်နိမိတ်ရှာဖွေမှု မဟုတ်ပါ။",
          ),
        );
      },
      () =>
        setGeo(
          t(
            "Location permission denied or unavailable. Choose manually.",
            "တည်နေရာခွင့် မရရှိပါ။ ကိုယ်တိုင်ရွေးနိုင်ပါသည်။",
          ),
        ),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  }
  const showCities = ["all", "settlements"].includes(kind),
    showTownships = ["all", "townships"].includes(kind),
    showRegions = ["all", "regions"].includes(kind);
  const count =
    (showCities ? cities.length : 0) +
    (showTownships ? townships.length : 0) +
    (showRegions ? regions.length : 0);
  return (
    <dialog
      ref={ref}
      className="location-dialog"
      onCancel={onClose}
      aria-labelledby="location-title"
    >
      <div className="row spread">
        <h2 id="location-title">
          {t("Choose your area", "သင့်ဒေသကို ရွေးပါ")}
        </h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={t("Close location picker", "ဒေသရွေးချယ်မှု ပိတ်ရန်")}
        >
          <X size={20} />
        </button>
      </div>
      <p className="muted">
        {t(
          `Search ${settlements.length} city/town/settlement points, 330 townships or regions in English or Burmese.`,
          `မြို့/အခြေချနေရာ ${settlements.length}၊ မြို့နယ် 330 နှင့် ပြည်နယ်/တိုင်းကို မြန်မာ သို့မဟုတ် အင်္ဂလိပ်ဖြင့် ရှာပါ။`,
        )}
      </p>
      <label className="search-field">
        <Search size={18} />
        <span className="sr-only">
          {t(
            "Search cities, towns, regions or townships",
            "မြို့၊ ဒေသ သို့မဟုတ် မြို့နယ် ရှာရန်",
          )}
        </span>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(20);
          }}
          placeholder={t(
            "Name, parent area or PCode…",
            "အမည်၊ သက်ဆိုင်ရာဒေသ သို့မဟုတ် PCode…",
          )}
        />
      </label>
      <div
        className="place-kinds"
        role="group"
        aria-label={t("Place type", "တည်နေရာအမျိုးအစား")}
      >
        {[
          ["all", "All", "အားလုံး"],
          ["settlements", "Cities / towns", "မြို့များ"],
          ["townships", "Townships", "မြို့နယ်များ"],
          ["regions", "Regions", "ပြည်နယ်/တိုင်းများ"],
        ].map(([id, en, my]) => (
          <button
            key={id}
            aria-pressed={kind === id}
            onClick={() => {
              setKind(id);
              setLimit(20);
            }}
          >
            {t(en, my)}
          </button>
        ))}
      </div>
      <p className="small muted" role="status">
        {query.trim()
          ? t(
              `${count} matches across Myanmar`,
              `မြန်မာနိုင်ငံတစ်ဝန်း ကိုက်ညီမှု ${count} ခု`,
            )
          : t(
              "Places in your region. Type a name to search nationwide.",
              "ရွေးထားသောဒေသရှိ နေရာများ။ တစ်နိုင်ငံလုံးရှာရန် အမည်ရိုက်ပါ။",
            )}
      </p>
      <div className="location-options">
        {showCities && (
          <>
            <p className="small muted">
              {t("Cities, towns & settlements", "မြို့နှင့် အခြေချနေရာများ")} ·{" "}
              {cities.length}
            </p>
            {cities.slice(0, limit).map((point) => (
              <button
                key={`settlement:${point.id}`}
                aria-pressed={settlement === point.id}
                onClick={() => {
                  onSettlement(point.id);
                  onClose();
                }}
              >
                <MapPin size={17} />
                <span>
                  {settlementName(point, lang)}
                  <small>
                    {t("Settlement point", "အခြေချနေရာမှတ်")} ·{" "}
                    {townshipByCode(point.townshipCode)?.[lang]} · {point.en}
                    {lang === "my" && !point.my
                      ? ` · ${t("Original English name", "မူရင်းအင်္ဂလိပ်အမည်")}`
                      : ""}
                  </small>
                </span>
              </button>
            ))}
          </>
        )}
        {showTownships && (
          <>
            <p className="small muted">
              {t("Townships", "မြို့နယ်များ")} · {townships.length}
            </p>
            {townships.slice(0, limit).map((area) => (
              <button
                key={`township:${area.code}`}
                aria-pressed={!settlement && township === area.code}
                onClick={() => {
                  onTownship(area.code);
                  onClose();
                }}
              >
                <MapPin size={17} />
                <span>
                  {area[lang]}
                  <small>
                    {t("Township", "မြို့နယ်")} · {area.district[lang]} ·{" "}
                    {area.admin1[lang]} · {area.code}
                  </small>
                </span>
              </button>
            ))}
          </>
        )}
        {showRegions && (
          <>
            <p className="small muted">
              {t("States / regions", "ပြည်နယ် / တိုင်းဒေသကြီး")}
            </p>
            {regions.map((region) => (
              <button
                key={region.canonical_region_id}
                aria-pressed={
                  !township && selected === region.canonical_region_id
                }
                onClick={() => {
                  onSelect(region.canonical_region_id);
                  onClose();
                }}
              >
                <MapPin size={17} />
                <span>
                  {lang === "en"
                    ? region.canonical_name_en
                    : region.canonical_name_my}
                  <small>
                    {t("State / region", "ပြည်နယ် / တိုင်းဒေသကြီး")}
                  </small>
                </span>
              </button>
            ))}
          </>
        )}
        {((showCities && cities.length > limit) ||
          (showTownships && townships.length > limit)) && (
          <button onClick={() => setLimit((n) => n + 40)}>
            {t("Show more matching places", "ကိုက်ညီသောနေရာများ ထပ်ပြရန်")}
          </button>
        )}
        {count === 0 && (
          <p role="status">
            {t(
              "No place matches. Try another name or PCode.",
              "ကိုက်ညီသောဒေသ မရှိပါ။ အမည်တစ်မျိုး သို့မဟုတ် PCode ဖြင့် စမ်းပါ။",
            )}
          </p>
        )}
      </div>
      <button className="locate-button" onClick={locate}>
        <LocateFixed size={17} />
        {t("Use approximate location", "အနီးစပ်ဆုံးတည်နေရာ သုံးရန်")}
      </button>
      {geo && (
        <p className="small" role="status">
          {geo}
        </p>
      )}
      <p className="small muted">
        {t(
          "Weather uses parent-region samples. Saved on this device. Village coverage is incomplete.",
          "မိုးလေဝသသည် ပြည်နယ်/တိုင်း နမူနာဖြစ်သည်။ ဤစက်တွင်သာ သိမ်းသည်။ ကျေးရွာစာရင်း မပြည့်စုံပါ။",
        )}{" "}
        <a href="#/sources?indicator=settlements" onClick={onClose}>
          {t("Names & coverage", "အမည်နှင့် လွှမ်းခြုံမှု")}
        </a>
      </p>
    </dialog>
  );
}
