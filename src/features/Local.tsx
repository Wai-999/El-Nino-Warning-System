import { lazy, Suspense, useState } from "react";
import { MapPin } from "lucide-react";
import { useApp } from "../app/context";
import { regions } from "../data/regions";
import { PageTitle, Notice, AlertCard, Level } from "../components/shared";
import { RegionalProfile, SignalCard } from "../components/Operational";
import { Updates } from "../components/Enso";
import { activeAlerts, warningHistory, rank } from "../risk/engine";
import { signalsFor } from "../risk/signals";
import type { Severity } from "../data/schema";
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
      <a className="button primary" href="#/prepare">
        {t("Make a preparedness plan", "ကြိုတင်ပြင်ဆင်ရန်")}
      </a>
    </>
  );
}
export function WarningsPage() {
  const { t, data, now, operational: op } = useApp();
  const [area, setArea] = useState("all"),
    [mode, setMode] = useState("system"),
    [severity, setSeverity] = useState("all");
  const official = (
    mode === "history" ? warningHistory(data, now) : activeAlerts(data, now)
  ).filter(
    (a) =>
      (area === "all" || a.regionId === area) &&
      (severity === "all" || a.severity === severity),
  );
  const system = regions
    .filter((r) => area === "all" || r[0] === area)
    .flatMap((r) =>
      signalsFor(op, data, r[0], now)
        .filter(
          (s) =>
            s.level !== "normal" &&
            s.level !== "unknown" &&
            s.hazard !== "enso" &&
            (severity === "all" || s.level === severity),
        )
        .map((s) => ({ id: r[0], signal: s })),
    )
    .sort(
      (a, b) =>
        rank[b.signal.level as Severity] - rank[a.signal.level as Severity],
    );
  return (
    <>
      <PageTitle
        eyebrow={t("WARNINGS & EVIDENCE", "သတိပေးချက်နှင့် အထောက်အထား")}
        title={t("Warnings & updates", "သတိပေးချက်နှင့် နောက်ဆုံးသတင်း")}
        description={t(
          "Official bulletins and application screening signals have separate labels and lists.",
          "တရားဝင်ကြေညာချက်နှင့် စနစ်တွက်ချက်ညွှန်းကိန်းကို သီးခြားတံဆိပ်နှင့် စာရင်းဖြင့် ဖော်ပြထားသည်။",
        )}
      />
      <Notice>
        {t(
          "The official regional warning feed is not connected. An empty official list is not an all-clear. Consult Myanmar DMH and local authorities.",
          "တရားဝင်ဒေသသတိပေးချက်စနစ်နှင့် မချိတ်ဆက်ရသေးပါ။ တရားဝင်စာရင်းဗလာဖြစ်ခြင်းသည် အန္တရာယ်ကင်းဟု မဆိုလိုပါ။ မိုး/ဇလနှင့် ဒေသတာဝန်ရှိသူများ၏ သတင်းကို စစ်ဆေးပါ။",
        )}{" "}
        <a href="https://www.dmh.gov.mm/">Myanmar DMH</a>
      </Notice>
      <div className="filter-row">
        <RegionSelector value={area} onChange={setArea} all />
        <label>
          {t("Severity", "အဆင့်")}
          <select
            aria-label={t("Severity", "အဆင့်")}
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="all">{t("All levels", "အဆင့်အားလုံး")}</option>
            {(["advisory", "watch", "warning", "severe"] as const).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="segmented">
        {[
          ["system", "System risk signals", "စနစ်အန္တရာယ်ညွှန်းကိန်း"],
          ["official", "Official warnings", "တရားဝင်သတိပေးချက်"],
          ["history", "History", "မှတ်တမ်း"],
        ].map(([key, en, my]) => (
          <button
            key={key}
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
          >
            {t(en, my)}
          </button>
        ))}
      </div>
      {mode === "system" ? (
        <>
          <p>
            {system.length}{" "}
            {t(
              "matching signals. A region can have several signals.",
              "ကိုက်ညီသောညွှန်းကိန်း။ ဒေသတစ်ခုတွင် ညွှန်းကိန်းအများအပြား ရှိနိုင်သည်။",
            )}
          </p>
          <div className="signal-grid">
            {system.map(({ id, signal }) => (
              <SignalCard
                key={id + signal.hazard}
                signal={signal}
                region={id}
              />
            ))}
          </div>
          {!system.length && (
            <Notice>
              {t(
                "No matching elevated signals from available fresh inputs. Missing inputs do not mean normal conditions.",
                "သက်တမ်းရှိဒေတာတွင် ကိုက်ညီသော မြင့်တက်ညွှန်းကိန်း မရှိပါ။ ဒေတာမရှိခြင်းက ပုံမှန်ဟု မဆိုလိုပါ။",
              )}
            </Notice>
          )}
        </>
      ) : official.length ? (
        official.map((a) => (
          <div key={a.id}>
            {mode === "history" && (
              <p>
                {t(
                  "ARCHIVED — not an active warning",
                  "မှတ်တမ်း — လက်ရှိသတိပေးချက် မဟုတ်",
                )}
              </p>
            )}
            <AlertCard alert={a} />
          </div>
        ))
      ) : (
        <section className="panel padded">
          <h2>
            {mode === "history"
              ? t("No archived bulletins", "ကြေညာချက်မှတ်တမ်း မရှိသေး")
              : t(
                  "Regional warning status is unavailable",
                  "ဒေသသတိပေးအခြေအနေ မရရှိနိုင်သေး",
                )}
          </h2>
        </section>
      )}
      <Updates />
      <details className="panel padded">
        <summary>{t("Warning levels", "သတိပေးအဆင့်များ")}</summary>
        <div className="levels">
          {(["normal", "advisory", "watch", "warning", "severe"] as const).map(
            (level) => (
              <Level key={level} level={level} />
            ),
          )}
        </div>
        <p>
          {t(
            "For system signals, Normal means no selected threshold crossed; it does not mean all hazards were assessed. See methodology for exact rules.",
            "စနစ်ညွှန်းကိန်းတွင် ပုံမှန်ဆိုသည်မှာ ရွေးထားသောသတ်မှတ်ချက် မကျော်ခြင်းသာဖြစ်ပြီး အန္တရာယ်အားလုံး စစ်ဆေးပြီးဟု မဆိုလိုပါ။ တွက်ချက်နည်းတွင် စည်းမျဉ်းအတိအကျ ဖတ်ပါ။",
          )}
        </p>
        <a href="#/data">{t("Methodology", "တွက်ချက်နည်း")}</a>
      </details>
    </>
  );
}
