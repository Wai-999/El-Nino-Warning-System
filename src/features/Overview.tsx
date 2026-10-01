import { lazy, Suspense } from "react";
import { useApp } from "../app/context";
import { PageTitle, Level, Notice, AlertCard } from "../components/shared";
import { RegionalProfile, SignalCard, value } from "../components/Operational";
import { EnsoPanel, Updates } from "../components/Enso";
import { priority, signalsFor, leadingSignal, actions } from "../risk/signals";
import { activeAlerts, rank, coverageCurrent } from "../risk/engine";
import { regions, regionName } from "../data/regions";
import { historyFresh, mmt } from "../data/operational";
const MyanmarMap = lazy(() => import("../map/MyanmarMap"));
export default function Overview({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { t, lang, data, operational: op, now, lowData } = useApp();
  const p = priority(op, data, now),
    alerts = activeAlerts(data, now);
  const ranked = regions
    .map((r) => ({
      id: r[0],
      signal: leadingSignal(signalsFor(op, data, r[0], now)),
    }))
    .filter((r) => r.signal)
    .sort(
      (a, b) =>
        rank[b.signal!.level as keyof typeof rank] -
        rank[a.signal!.level as keyof typeof rank],
    );
  const h = historyFresh(op.history, now)
    ? op.history?.regions.find((r) => r.id === selected)
    : undefined;
  return (
    <>
      <PageTitle
        eyebrow={t(
          "MYANMAR · WEATHER & CLIMATE",
          "မြန်မာ · မိုးလေဝသနှင့် ရာသီဥတု",
        )}
        title={t(
          "Know the conditions. Prepare today.",
          "အခြေအနေကို သိရှိပြီး ယနေ့ ပြင်ဆင်ပါ။",
        )}
        description={t(
          "Regional forecasts, recent climate departures and practical actions.",
          "ဒေသခန့်မှန်းချက်၊ မကြာသေးမီ ရာသီဥတုကွာဟချက်နှင့် လက်တွေ့လုပ်ဆောင်ရန်။",
        )}
      />
      {p.kind === "official" ? (
        <AlertCard alert={p.official} />
      ) : p.kind === "system" ? (
        <section className="priority-panel">
          <p className="eyebrow">
            {t("HIGHEST IMMEDIATE CONCERN", "ယခု ဦးစားပေး သတိပြုရန်")}
          </p>
          <SignalCard signal={p.signal} region={p.id} compact />
        </section>
      ) : p.kind === "enso" ? (
        <EnsoPanel />
      ) : (
        <Notice>
          {t(
            "Review local conditions and routine preparations. Unassessed hazards may still exist.",
            "ဒေသအခြေအနေနှင့် ပုံမှန်ပြင်ဆင်မှုကို စစ်ဆေးပါ။ မသုံးသပ်ရသေးသော အန္တရာယ်များ ရှိနိုင်သည်။",
          )}
        </Notice>
      )}
      <section
        className="national-strip"
        aria-label={t("National snapshot", "နိုင်ငံအကျဉ်းချုပ်")}
      >
        <div>
          <span>
            {t("Highest system attention", "စနစ်အဆင့် အမြင့်ဆုံးဒေသ")}
          </span>
          <strong>{ranked[0] ? regionName(ranked[0].id, lang) : "—"}</strong>
          {ranked[0] && (
            <>
              <Level level={ranked[0].signal!.level} />
              <small>
                {
                  ranked.filter(
                    (r) => r.signal!.level === ranked[0].signal!.level,
                  ).length
                }{" "}
                {t("regions share this level", "ဒေသတွင် ဤအဆင့်တူ ရှိသည်")}
              </small>
            </>
          )}
        </div>
        <div>
          <span>
            {t("Official active warnings", "သက်တမ်းရှိ တရားဝင်သတိပေးချက်")}
          </span>
          <strong>
            {coverageCurrent(data, now)
              ? alerts.length
              : t("Coverage unavailable", "လွှမ်းခြုံဒေတာ မရရှိ")}
          </strong>
          <a href="#/warnings">
            {t("Warnings & updates", "သတိပေးချက်နှင့် သတင်း")}
          </a>
        </div>
        <div>
          <span>
            {regionName(selected, lang)} ·{" "}
            {t("30-day anomalies", "ရက် ၃၀ ကွာဟချက်")}
          </span>
          <strong>
            {value(h?.temperatureAnomaly, "°C", true)} ·{" "}
            {value(h?.rainPercent, "%", true)}
          </strong>
          <small>{op.history?.end} · ERA5 · 1991–2020</small>
        </div>
      </section>
      {ranked[0] && (
        <div className="action-strip">
          <strong>{t("One action today", "ယနေ့ လုပ်ဆောင်ရန်")}</strong>
          <p>{t(...actions[ranked[0].signal!.hazard])}</p>
        </div>
      )}
      <div className="v2-map-grid">
        <section className="panel map-panel">
          <div className="panel-heading">
            <h2>{t("Myanmar risk map", "မြန်မာနိုင်ငံ အန္တရာယ်မြေပုံ")}</h2>
            <a href="#/map">{t("Explore layers", "အလွှာများ ကြည့်ရန်")}</a>
          </div>
          <label className="region-select">
            {t("State / Region", "ပြည်နယ် / တိုင်းဒေသကြီး")}
            <select value={selected} onChange={(e) => onSelect(e.target.value)}>
              {regions.map((r) => (
                <option key={r[0]} value={r[0]}>
                  {regionName(r[0], lang)}
                </option>
              ))}
            </select>
          </label>
          {lowData ? (
            <div className="padded">
              <p>
                {t(
                  "Low Data Mode: map and optional charts are paused. Regional text and warnings remain available.",
                  "ဒေတာချွေတာစနစ် — မြေပုံနှင့် မလိုအပ်သောပုံပြဇယားများကို ခေတ္တပိတ်ထားသည်။ ဒေသအချက်အလက်နှင့် သတိပေးချက် ဆက်ရရှိနိုင်သည်။",
                )}
              </p>
            </div>
          ) : (
            <Suspense
              fallback={<p>{t("Loading map…", "မြေပုံ ဖွင့်နေသည်…")}</p>}
            >
              <MyanmarMap selected={selected} onSelect={onSelect} />
            </Suspense>
          )}
        </section>
        <aside className="panel padded">
          <RegionalProfile id={selected} />
        </aside>
      </div>
      {p.kind !== "enso" && <EnsoPanel />}
      <Updates />
      <Notice>
        {t(
          "Official-warning coverage is incomplete. Follow current Myanmar DMH and local-authority instructions. System signals are independent planning guidance.",
          "တရားဝင်သတိပေးချက် လွှမ်းခြုံမှု မပြည့်စုံပါ။ လက်ရှိ မိုး/ဇလနှင့် ဒေသတာဝန်ရှိသူများ၏ ညွှန်ကြားချက်ကို လိုက်နာပါ။ စနစ်ညွှန်းကိန်းသည် လွတ်လပ်သော ပြင်ဆင်ရေးလမ်းညွှန်ဖြစ်သည်။",
        )}{" "}
        <a href="https://www.dmh.gov.mm/">Myanmar DMH</a>
      </Notice>
      {op.weather && (
        <p className="meta">
          {t("Weather retrieved", "မိုးလေဝသဒေတာ ရယူချိန်")}:{" "}
          {mmt(op.weather.fetchedAt, lang)}
        </p>
      )}
    </>
  );
}
