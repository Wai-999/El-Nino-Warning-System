import { useEffect, useState } from "react";
import { HeartPulse, Sprout, Droplets, Zap } from "lucide-react";
import { useApp } from "../app/context";
import { PageTitle, Notice, Level, SourceLink } from "../components/shared";
import { Evidence, SignalCard, value } from "../components/Operational";
import { EnsoPanel } from "../components/Enso";
import { regions, regionName } from "../data/regions";
import {
  mmt,
  weatherState,
  historyState,
  type DataState,
} from "../data/operational";
import {
  assessSector,
  impactFilters,
  impactHash,
  sectorIds,
  evidenceIds,
  type ImpactFilters,
} from "../risk/impacts";
import {
  historicalImpacts,
  sectorEvidence,
  impactSources,
  lastVerified,
  type ImpactSourceId,
} from "../data/impactEvidence";
import "../styles/impacts.css";
const icons = {
  health: HeartPulse,
  agriculture: Sprout,
  water: Droplets,
  energy: Zap,
};
const evidenceNames = {
  all: ["All evidence", "အထောက်အထားအားလုံး"],
  forecast: ["Forecast", "ခန့်မှန်းချက်"],
  observed: ["Observed / reanalysis", "ပြန်လည်ဆန်းစစ်ထားသော အတိတ်ဒေတာ"],
  historical: ["Historical relationship", "သမိုင်းဆိုင်ရာ ဆက်နွယ်မှု"],
  scenario: [
    "Scenario / potential impact",
    "အခြေအနေပေါ်မူတည်သော ဖြစ်နိုင်သက်ရောက်မှု",
  ],
} as const;
function Sources({ ids }: { ids: ImpactSourceId[] }) {
  const { t } = useApp();
  return (
    <div className="impact-sources">
      <strong>{t("Sources", "ရင်းမြစ်များ")}</strong>
      <ul>
        {ids.map((id) => (
          <li key={id}>
            <SourceLink href={impactSources[id].url}>
              {impactSources[id].organization} · {impactSources[id].title}
            </SourceLink>
            <span className="meta">{impactSources[id].publication}</span>
          </li>
        ))}
      </ul>
      <p className="meta">
        {t("Last verified", "နောက်ဆုံးစစ်ဆေးရက်")}: {lastVerified}
      </p>
    </div>
  );
}
function StateLabel({ state }: { state: DataState }) {
  const { t } = useApp();
  const names = {
    current: t("Current", "သက်တမ်းရှိ"),
    aging: t("Aging", "သက်တမ်းကုန်ခါနီး"),
    stale: t(
      "Stale — excluded from screening",
      "သက်တမ်းကျော် — အဆင့်တွက်ရာတွင် မသုံး",
    ),
    unavailable: t("Unavailable", "မရရှိနိုင်"),
  };
  return (
    <strong className={`data-state data-state-${state}`}>{names[state]}</strong>
  );
}
function MyanmarSnapshot({
  region,
  evidence,
}: Pick<ImpactFilters, "region" | "evidence">) {
  const {
    t,
    lang,
    operational: op,
    now,
    loading,
    operationalError,
    operationalCached,
  } = useApp();
  const w = op.weather?.regions.find((r) => r.id === region),
    h = op.history?.regions.find((r) => r.id === region);
  return (
    <section
      className="panel padded impact-snapshot"
      aria-labelledby="myanmar-snapshot-title"
    >
      <h2 id="myanmar-snapshot-title">
        {t("Myanmar impact snapshot", "မြန်မာနိုင်ငံ သက်ရောက်မှု အကျဉ်းချုပ်")}{" "}
        · {regionName(region, lang)}
      </h2>
      <p>
        {t(
          "Regional samples support heat, rain and dryness screening. Exposure and vulnerability determine who may actually be harmed.",
          "ဒေသနမူနာများဖြင့် အပူ၊ မိုးနှင့် ခြောက်သွေ့မှုကို စစ်ဆေးသည်။ အမှန်တကယ် ထိခိုက်မှုမှာ ဘေးနှင့်ထိတွေ့မှု၊ ခံနိုင်ရည်တို့ပေါ် မူတည်သည်။",
        )}
      </p>
      {loading && (
        <p role="status">
          {t("Loading regional evidence…", "ဒေသအထောက်အထား ရယူနေသည်…")}
        </p>
      )}
      {!loading && operationalError && (
        <Notice>
          {t(
            "Latest regional data could not be loaded. Any retained dataset keeps its original date; otherwise it is unavailable.",
            "နောက်ဆုံးဒေသဒေတာ မရယူနိုင်ပါ။ သိမ်းထားသောဒေတာ ရှိပါက မူရင်းရက်စွဲဖြင့် ပြသပြီး မရှိပါက မရရှိနိုင်ဟု ပြသည်။",
          )}
        </Notice>
      )}
      {operationalCached && (w || h) && (
        <p className="meta">
          {t(
            "Cached copy — check each dataset’s date below.",
            "သိမ်းထားသောဒေတာ — အောက်ပါ ဒေတာတစ်ခုစီ၏ ရက်စွဲကို စစ်ဆေးပါ။",
          )}
        </p>
      )}
      {!loading && (
        <div className="impact-evidence-grid">
          {(evidence === "all" || evidence === "forecast") && (
            <article
              className="impact-data-block"
              data-testid="impact-forecast"
            >
              <p className="evidence-label">
                {t(
                  "FORECAST · NEXT 24 HOURS",
                  "ခန့်မှန်းချက် · လာမည့် ၂၄ နာရီ",
                )}
              </p>
              <StateLabel state={weatherState(op.weather, now)} />
              {w && op.weather ? (
                <>
                  <p className="meta">
                    {mmt(op.weather.validAt, lang)} →{" "}
                    {mmt(op.weather.through, lang)}
                  </p>
                  <dl className="metric-grid">
                    <div>
                      <dt>{t("Temperature range", "အပူချိန်အပိုင်းအခြား")}</dt>
                      <dd>
                        {value(w.next24.min, "°C")} –{" "}
                        {value(w.next24.max, "°C")}
                      </dd>
                    </div>
                    <div>
                      <dt>{t("Rainfall amount", "မိုးရေပမာဏ")}</dt>
                      <dd>{value(w.next24.rain, " mm")}</dd>
                    </div>
                  </dl>
                  <p>
                    {t(
                      "Sampled regional estimates; rainfall amount is not flood probability.",
                      "ဒေသနမူနာ ခန့်မှန်းတန်ဖိုးဖြစ်သည်။ မိုးရေပမာဏသည် ရေကြီးဖြစ်နိုင်နှုန်း မဟုတ်ပါ။",
                    )}
                  </p>
                  <p className="meta">
                    {t("Retrieved", "ရယူချိန်")}:{" "}
                    {mmt(op.weather.fetchedAt, lang)}
                  </p>
                </>
              ) : (
                <p>
                  {t(
                    "Forecast data unavailable. No replacement values are estimated.",
                    "ခန့်မှန်းဒေတာ မရရှိနိုင်ပါ။ အစားထိုးတန်ဖိုး မခန့်မှန်းထားပါ။",
                  )}
                </p>
              )}
              <SourceLink href="https://open-meteo.com/en/docs/ecmwf-api">
                ECMWF IFS 0.25° / Open-Meteo
              </SourceLink>
              {op.health.ecmwf?.ok === false && (
                <p>
                  {t(
                    "Latest provider check failed; any retained forecast keeps its original time.",
                    "နောက်ဆုံးရင်းမြစ်စစ်ဆေးမှု မအောင်မြင်ပါ။ ယခင်ခန့်မှန်းချက်၏ မူရင်းအချိန်ကို ထားရှိသည်။",
                  )}
                </p>
              )}
            </article>
          )}
          {(evidence === "all" || evidence === "observed") && (
            <article
              className="impact-data-block"
              data-testid="impact-reanalysis"
            >
              <p className="evidence-label">
                {t(
                  "OBSERVED / REANALYSIS · RECENT 30 DAYS",
                  "ပြန်လည်ဆန်းစစ်ထားသော အတိတ်ဒေတာ · မကြာသေးမီ ရက် ၃၀",
                )}
              </p>
              <StateLabel state={historyState(op.history, now)} />
              {h && op.history ? (
                <>
                  <p className="meta">
                    {op.history.start} → {op.history.end} · MMT
                  </p>
                  <p className="meta">
                    {t(
                      "Baseline: matching calendar days, 1991–2020",
                      "ရည်ညွှန်းကာလ — တူညီပြက္ခဒိန်ရက်များ၊ ၁၉၉၁–၂၀၂၀",
                    )}
                  </p>
                  <dl className="metric-grid">
                    <div>
                      <dt>
                        {t(
                          "Temperature anomaly",
                          "ပုံမှန်နှင့် အပူချိန်ကွာဟချက်",
                        )}
                      </dt>
                      <dd>{value(h.temperatureAnomaly, "°C", true)}</dd>
                    </div>
                    <div>
                      <dt>
                        {t(
                          "Precipitation anomaly",
                          "ပုံမှန်နှင့် မိုးရေကွာဟချက်",
                        )}
                      </dt>
                      <dd>
                        {value(h.rainDifference, " mm", true)}
                        <br />
                        <small>
                          {h.rainPercent === null
                            ? t(
                                "Percentage unavailable: normal below 10 mm",
                                "ပုံမှန်မိုးရေ 10 mm အောက် — ရာခိုင်နှုန်း မဖော်ပြ",
                              )
                            : value(h.rainPercent, "%", true)}
                        </small>
                      </dd>
                    </div>
                    <div>
                      <dt>
                        {t(
                          "Rainfall total / normal",
                          "စုစုပေါင်းမိုးရေ / ပုံမှန်",
                        )}
                      </dt>
                      <dd>
                        {value(h.rain30, " mm")} /{" "}
                        {value(h.rainNormal30, " mm")}
                      </dd>
                    </div>
                    <div>
                      <dt>{t("Trailing dry days", "ဆက်တိုက် မိုးပြတ်ရက်")}</dt>
                      <dd>
                        {h.dryDays}
                        {h.dryDays === 30 ? "+" : ""}
                        <br />
                        <small>
                          {t(
                            "Under 1 mm/day; not a drought declaration",
                            "တစ်ရက် 1 mm အောက် — မိုးခေါင်ကြေညာချက် မဟုတ်",
                          )}
                        </small>
                      </dd>
                    </div>
                  </dl>
                  <p className="meta">
                    {t("Retrieved", "ရယူချိန်")}:{" "}
                    {mmt(op.history.fetchedAt, lang)}
                  </p>
                </>
              ) : (
                <p>
                  {t(
                    "Recent climate evidence unavailable. Dryness and water pressure cannot be assessed.",
                    "မကြာသေးမီ ရာသီဥတုအထောက်အထား မရရှိပါ။ ခြောက်သွေ့မှုနှင့် ရေဖိအားကို မသတ်မှတ်နိုင်ပါ။",
                  )}
                </p>
              )}
              <p>
                {t(
                  "ERA5 combines observations with a model; these are delayed estimates, not local station measurements or a forecast anomaly.",
                  "ERA5 သည် တိုင်းတာချက်နှင့် မော်ဒယ်ကို ပေါင်းစပ်ထားသော နောက်ကျရရှိသည့် ခန့်မှန်းတန်ဖိုးဖြစ်သည်။ ဒေသစခန်းတိုင်းတာချက် သို့မဟုတ် အနာဂတ်ကွာဟချက် မဟုတ်ပါ။",
                )}
              </p>
              <SourceLink href="https://open-meteo.com/en/docs/historical-weather-api">
                Copernicus / ECMWF ERA5 / Open-Meteo
              </SourceLink>
              {op.health.era5?.ok === false && (
                <p>
                  {t(
                    "Latest provider check failed; showing the dated reanalysis above if available.",
                    "နောက်ဆုံးရင်းမြစ်စစ်ဆေးမှု မအောင်မြင်ပါ။ ရရှိပါက အထက်ပါရက်စွဲအတိုင်း ယခင်ဒေတာကို ပြသည်။",
                  )}
                </p>
              )}
            </article>
          )}
        </div>
      )}
      <details className="impact-limitations">
        <summary>
          {t(
            "Flood, wildfire and local exposure: evidence limits",
            "ရေကြီး၊ တောမီးနှင့် ဒေသထိတွေ့မှု — ဒေတာအကန့်အသတ်",
          )}
        </summary>
        <p>
          {t(
            "No river, reservoir, soil-moisture, fire, haze or air-quality feed is connected. Heavy-rain and rainfall-deficit signals cannot establish flooding, drought damage or smoke exposure. Three sample cells per State/Region cannot resolve townships or the Central Dry Zone as a separate area.",
            "မြစ်၊ ဆည်၊ မြေအစိုဓာတ်၊ တောမီး၊ မီးခိုးနှင့် လေထုဒေတာ မချိတ်ဆက်ထားပါ။ မိုးများ၊ မိုးနည်းညွှန်းကိန်းဖြင့် ရေကြီးမှု၊ မိုးခေါင်ပျက်စီးမှု၊ မီးခိုးထိတွေ့မှုကို မအတည်ပြုနိုင်ပါ။ တိုင်း/ပြည်နယ်တစ်ခုလျှင် နမူနာ ၃ ခုဖြင့် မြို့နယ် သို့မဟုတ် အလယ်ပိုင်းခြောက်သွေ့ဇုန်ကို သီးခြား မခွဲနိုင်ပါ။",
          )}
        </p>
        <p>
          {t(
            "Wildfire/haze scenario: dry conditions can contribute to fires and smoke, but Myanmar fire occurrence and exposure are unassessed here.",
            "တောမီး/မီးခိုး ဖြစ်နိုင်သည့်အခြေအနေ — ခြောက်သွေ့မှုက မီးလောင်နှင့် မီးခိုးကို အထောက်အကူဖြစ်နိုင်သော်လည်း မြန်မာတောမီးနှင့် ထိတွေ့မှုကို ဤနေရာတွင် မသတ်မှတ်ပါ။",
          )}
        </p>
        <Sources ids={["health"]} />
      </details>
    </section>
  );
}
export default function Impacts() {
  const { t, lang, data, now, operational: op, loading } = useApp();
  const [filters, setFilters] = useState(() => impactFilters(location.hash));
  useEffect(() => {
    const sync = () => setFilters(impactFilters(location.hash));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const change = (next: Partial<ImpactFilters>) => {
    const value = { ...filters, ...next };
    setFilters(value);
    location.hash = impactHash(value);
  };
  const sector = sectorEvidence[filters.sector],
    assessment = assessSector(op, data, filters.sector, now);
  const selected = assessment.assessed.find((r) => r.id === filters.region)!;
  const showOperational = ["all", "forecast", "observed"].includes(
    filters.evidence,
  );
  const visibleSignals = selected.signals.filter(
    (s) =>
      filters.evidence === "all" ||
      (filters.evidence === "forecast" && s.source === "ecmwf") ||
      (filters.evidence === "observed" && s.source === "era5"),
  );
  return (
    <div className="impacts-page">
      <PageTitle
        eyebrow={t(
          "EL NIÑO → WEATHER → POTENTIAL IMPACTS",
          "အယ်လ်နီညို → မိုးလေဝသ → ဖြစ်နိုင်သက်ရောက်မှု",
        )}
        title={t(
          "El Niño impacts, in context.",
          "အယ်လ်နီညို သက်ရောက်မှုကို နားလည်ရန်။",
        )}
        description={t(
          "For Myanmar: what the evidence shows, what remains uncertain, and how to prepare. ENSO changes probabilities; it does not determine every local event.",
          "မြန်မာနိုင်ငံအတွက် အထောက်အထား၊ မသေချာမှုနှင့် ပြင်ဆင်ရန်။ ENSO သည် ဖြစ်နိုင်ခြေကို ပြောင်းလဲစေသော်လည်း ဒေသဖြစ်ရပ်တိုင်းကို မဆုံးဖြတ်ပါ။",
        )}
      />
      <EnsoPanel />
      <div className="impact-filters">
        <div>
          <label htmlFor="impact-region">
            {t("State / Region", "တိုင်း / ပြည်နယ်")}
          </label>
          <select
            id="impact-region"
            value={filters.region}
            onChange={(e) => change({ region: e.target.value })}
          >
            {regions.map(([id, en, my]) => (
              <option key={id} value={id}>
                {t(en, my)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="impact-evidence">
            {t("Evidence type", "အထောက်အထားအမျိုးအစား")}
          </label>
          <select
            id="impact-evidence"
            value={filters.evidence}
            onChange={(e) =>
              change({ evidence: e.target.value as ImpactFilters["evidence"] })
            }
          >
            {evidenceIds.map((id) => (
              <option key={id} value={id}>
                {t(evidenceNames[id][0], evidenceNames[id][1])}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="meta">
        {t(
          "The address includes your sector, region and evidence selection; copy it to share this view.",
          "လိပ်စာတွင် ကဏ္ဍ၊ ဒေသနှင့် အထောက်အထားရွေးချယ်မှု ပါဝင်သည်။ ဤမြင်ကွင်းကို မျှဝေရန် လိပ်စာကူးပါ။",
        )}
      </p>
      {showOperational && (
        <MyanmarSnapshot region={filters.region} evidence={filters.evidence} />
      )}
      <nav className="sector-tabs" aria-label={t("Sectors", "ကဏ္ဍများ")}>
        {sectorIds.map((id) => {
          const Icon = icons[id];
          return (
            <button
              key={id}
              aria-pressed={filters.sector === id}
              onClick={() => change({ sector: id })}
            >
              <Icon size={22} aria-hidden="true" />
              {t(...sectorEvidence[id].name)}
            </button>
          );
        })}
      </nav>
      <section className="panel padded" aria-labelledby="sector-title">
        <p className="evidence-label">
          {t(
            "SCENARIO · POTENTIAL IMPACT",
            "အခြေအနေအလိုက် ဖြစ်နိုင်သက်ရောက်မှု",
          )}
        </p>
        <h2 id="sector-title">
          {t(...sector.name)} · {regionName(filters.region, lang)}
        </h2>
        <p className="lead">{t(...sector.what)}</p>
        <p>
          <strong>{t("Who may be affected", "ထိခိုက်နိုင်သူများ")}: </strong>
          {t(...sector.who)}
        </p>
        <p className="signal-action">
          <strong>{t("Prepare", "ပြင်ဆင်ရန်")}: </strong>
          {t(...sector.prepare)}
        </p>
        <details>
          <summary>
            {t(
              "Why, when and how strong is the evidence?",
              "အကြောင်းရင်း၊ ကာလနှင့် အထောက်အထား ခိုင်မာမှု",
            )}
          </summary>
          <dl className="impact-explanation">
            <dt>{t("Mechanism", "ဖြစ်ပေါ်ပုံ")}</dt>
            <dd>{t(...sector.why)}</dd>
            <dt>{t("When", "ကာလ")}</dt>
            <dd>{t(...sector.when)}</dd>
            <dt>{t("Confidence", "ယုံကြည်နိုင်မှု")}</dt>
            <dd>
              {t(
                "Local impact likelihood is unknown; no calibrated probability or severity of damage is available.",
                "ဒေသထိခိုက်မှု ဖြစ်နိုင်ခြေ မသိရပါ။ အတည်ပြုထားသော ဖြစ်နိုင်နှုန်းနှင့် ပျက်စီးပြင်းအား မရရှိပါ။",
              )}
            </dd>
          </dl>
          <p>{t(...sector.limitation)}</p>
        </details>
        <Sources ids={sector.sources} />
        <p className="meta">
          {t(
            "Platform preparedness suggestions informed by these sources; not a government order or a prediction of damage.",
            "ရင်းမြစ်များကို ကိုးကားသော စနစ်၏ ပြင်ဆင်ရေးအကြံပြုချက်ဖြစ်သည်။ အစိုးရအမိန့် သို့မဟုတ် ပျက်စီးမှုခန့်မှန်းချက် မဟုတ်ပါ။",
          )}
        </p>
      </section>
      {showOperational && (
        <section className="impact-drivers" aria-labelledby="drivers-title">
          <h2 id="drivers-title">
            {t("Evidence behind this sector", "ဤကဏ္ဍအတွက် အထောက်အထား")}
          </h2>
          {loading ? (
            <p role="status">
              {t("Loading sector drivers…", "ကဏ္ဍအထောက်အထား ရယူနေသည်…")}
            </p>
          ) : (
            <>
              <p>
                {t(
                  "Overall screening for selected region",
                  "ရွေးထားသောဒေသ အကျဉ်းချုပ်စစ်ဆေးမှု",
                )}
                : <Level level={selected.level} />
                {!selected.complete && (
                  <strong>
                    {" "}
                    · {t("Incomplete evidence", "အထောက်အထား မပြည့်စုံ")}
                  </strong>
                )}
              </p>
              <p>
                {t(
                  "The summary uses all sector drivers; the evidence filter only changes the details shown below. Levels are planning thresholds, not impact probabilities or official warnings.",
                  "အကျဉ်းချုပ်တွင် ကဏ္ဍအကြောင်းရင်းအားလုံး သုံးသည်။ ရွေးချယ်မှုက အောက်ပါအသေးစိတ်ပြသမှုကိုသာ ပြောင်းသည်။ အဆင့်များသည် ပြင်ဆင်ရေးသတ်မှတ်ချက်ဖြစ်ပြီး ထိခိုက်ဖြစ်နိုင်နှုန်း သို့မဟုတ် တရားဝင်သတိပေးချက် မဟုတ်ပါ။",
                )}
              </p>
              {visibleSignals.length ? (
                <div className="signal-grid">
                  {visibleSignals.map((s) => (
                    <SignalCard key={s.hazard} signal={s} />
                  ))}
                </div>
              ) : (
                <Notice>
                  {t(
                    "No driver of this evidence type is used for the selected sector.",
                    "ဤကဏ္ဍတွင် ရွေးထားသော အထောက်အထားအမျိုးအစားကို မသုံးပါ။",
                  )}
                </Notice>
              )}
              <details className="panel padded impact-coverage">
                <summary>
                  {t(
                    "Myanmar coverage and regions to check",
                    "မြန်မာဒေတာလွှမ်းခြုံမှုနှင့် စစ်ဆေးရန်ဒေသများ",
                  )}
                </summary>
                <p>
                  {assessment.complete} / 15{" "}
                  {t(
                    "regions: all sector drivers assessed",
                    "ဒေသ — ကဏ္ဍအကြောင်းရင်းအားလုံး စစ်ဆေးနိုင်",
                  )}
                  ; {assessment.partial} {t("partial", "တစ်စိတ်တစ်ပိုင်း")};{" "}
                  {assessment.unavailable} {t("unavailable", "မရရှိနိုင်")}.
                </p>
                {assessment.complete + assessment.partial === 0 ? (
                  <Notice>
                    {t(
                      "No regional assessment is available. Missing data does not mean zero risk.",
                      "ဒေသသုံးသပ်ချက် မရရှိနိုင်ပါ။ ဒေတာမရှိခြင်းသည် အန္တရာယ်မရှိခြင်း မဟုတ်ပါ။",
                    )}
                  </Notice>
                ) : (
                  <p>
                    {assessment.elevated.length}{" "}
                    {t(
                      "regions have at least one elevated known driver. This is not an observed impact count or a ranking of damage.",
                      "ဒေသတွင် ရရှိသောအကြောင်းရင်းတစ်ခုခု မြင့်တက်နေသည်။ အမှန်တကယ် ထိခိုက်ဒေသအရေအတွက် သို့မဟုတ် ပျက်စီးမှုအဆင့်စဉ် မဟုတ်ပါ။",
                    )}
                  </p>
                )}
                <ul>
                  {assessment.elevated.map((r) => (
                    <li key={r.id}>
                      <a href={impactHash({ ...filters, region: r.id })}>
                        {regionName(r.id, lang)}
                      </a>{" "}
                      <Level level={r.level} />
                      {!r.complete &&
                        ` · ${t("Incomplete evidence", "အထောက်အထား မပြည့်စုံ")}`}
                    </li>
                  ))}
                </ul>
              </details>
            </>
          )}
        </section>
      )}
      <div className="action-strip">
        <h2>
          {t(
            "Prepare for your household or workplace",
            "အိမ်နှင့် လုပ်ငန်းခွင်အတွက် ပြင်ဆင်ပါ",
          )}
        </h2>
        <a className="button primary" href="#/prepare">
          {t("Open preparedness checklist", "ပြင်ဆင်ရန်စာရင်း ဖွင့်ပါ")}
        </a>
      </div>
      <details className="panel padded impact-mechanism">
        <summary>
          {t(
            "How El Niño can influence impacts",
            "အယ်လ်နီညိုက သက်ရောက်မှုကို မည်သို့ ပြောင်းလဲနိုင်သလဲ",
          )}
        </summary>
        <p>
          {t(
            "Pacific warming and weaker trade winds shift tropical rainfall and atmospheric circulation. This changes the likelihood of weather patterns elsewhere; a local hazard still needs local evidence.",
            "ပစိဖိတ်ပူနွေးမှုနှင့် ကုန်သွယ်လေအားနည်းမှုကြောင့် အပူပိုင်းမိုးရေနှင့် လေထုလည်ပတ်မှု ပြောင်းလဲသည်။ အခြားဒေသ မိုးလေဝသဖြစ်နိုင်ခြေ ပြောင်းနိုင်သော်လည်း ဒေသဘေးအတွက် ဒေသအထောက်အထား လိုသည်။",
          )}
        </p>
        <ol className="impact-chain">
          {[
            ["El Niño: ocean + atmosphere", "အယ်လ်နီညို — ပင်လယ်နှင့် လေထု"],
            ["Circulation changes", "လေထုလည်ပတ်မှု ပြောင်းလဲခြင်း"],
            [
              "Weather probabilities change",
              "မိုးလေဝသဖြစ်နိုင်ခြေ ပြောင်းလဲခြင်း",
            ],
            [
              "Hazard + exposure + vulnerability",
              "ဘေးအခြေအနေ + ထိတွေ့မှု + ခံနိုင်ရည်နည်းမှု",
            ],
            ["Potential impact", "ဖြစ်နိုင်သက်ရောက်မှု"],
          ].map(([en, my]) => (
            <li key={en}>{t(en, my)}</li>
          ))}
        </ol>
        <Sources ids={["mechanism"]} />
        <p>
          {t(
            "A hazard is a potentially harmful condition. Exposure means people or assets in its path; vulnerability describes susceptibility to harm. Risk concerns potential harm; an impact is an actual outcome. This page screens hazards and explains scenarios, without measuring losses.",
            "ဘေးအခြေအနေဆိုသည်မှာ ထိခိုက်စေနိုင်သော အခြေအနေဖြစ်သည်။ ထိတွေ့မှုမှာ ထိုနေရာရှိ လူနှင့် ပစ္စည်း၊ ထိခိုက်လွယ်မှုမှာ ခံနိုင်ရည်နည်းခြင်းဖြစ်သည်။ အန္တရာယ်သည် ထိခိုက်နိုင်မှုဖြစ်ပြီး သက်ရောက်မှုသည် ဖြစ်ပွားပြီးရလဒ်ဖြစ်သည်။ ဤစာမျက်နှာသည် ဘေးအခြေအနေစစ်ဆေးပြီး ဖြစ်နိုင်ပုံကို ရှင်းပြကာ ဆုံးရှုံးမှု မတိုင်းတာပါ။",
          )}
        </p>
      </details>
      {(filters.evidence === "all" || filters.evidence === "historical") && (
        <section className="impact-history" aria-labelledby="history-title">
          <h2 id="history-title">
            {t(
              "Historical evidence, not today’s forecast",
              "သမိုင်းအထောက်အထား — ယနေ့ခန့်မှန်းချက် မဟုတ်",
            )}
          </h2>
          {historicalImpacts.map((item) => (
            <article className="impact-history-item" key={item.id}>
              <p className="evidence-label">
                {t("HISTORICAL RELATIONSHIP", "သမိုင်းဆိုင်ရာ ဆက်နွယ်မှု")}
              </p>
              <h3>{t(...item.title)}</h3>
              <p>{t(...item.evidenceSummary)}</p>
              <p className="meta">
                {t("Where", "နေရာ")}: {t(...item.location)} ·{" "}
                {t("Period", "ကာလ")}: {t(...item.period)}
              </p>
              <details>
                <summary>
                  {t(
                    "Evidence limits and source",
                    "အထောက်အထားအကန့်အသတ်နှင့် ရင်းမြစ်",
                  )}
                </summary>
                <p>{t(...item.limitation)}</p>
                <p>
                  {t(
                    "Confidence: source provides no comparable graded confidence; local predictive confidence is unknown.",
                    "ယုံကြည်နိုင်မှု — ရင်းမြစ်တွင် နှိုင်းယှဉ်နိုင်သော အဆင့် မဖော်ပြပါ။ ဒေသခန့်မှန်းယုံကြည်နိုင်မှု မသိရပါ။",
                  )}
                </p>
                <Sources ids={item.sourceIds} />
              </details>
            </article>
          ))}
        </section>
      )}
      <details className="panel padded impact-methodology">
        <summary>
          {t(
            "Data dates, freshness and methodology",
            "ဒေတာရက်စွဲ၊ သက်တမ်းနှင့် နည်းလမ်း",
          )}
        </summary>
        <p>
          {t(
            "Forecasts: current under 12 hours, aging at 12–18 hours, stale at 18 hours or when their 24-hour window ends. ERA5: current within the expected publication delay, aging at 8 days, stale at 10 days after the last completed day. Stale values remain dated for context and do not drive screening. Retrieval time is not a model issue time.",
            "ခန့်မှန်းချက် ၁၂ နာရီအောက် သက်တမ်းရှိ၊ ၁၂–၁၈ နာရီ သက်တမ်းကုန်ခါနီး၊ ၁၈ နာရီ သို့မဟုတ် ၂၄ နာရီကာလကုန်လျှင် သက်တမ်းကျော်သည်။ ERA5 နောက်ဆုံးပြီးဆုံးရက်မှ ၈ ရက်တွင် သက်တမ်းကုန်ခါနီး၊ ၁၀ ရက်တွင် သက်တမ်းကျော်သည်။ သက်တမ်းကျော်တန်ဖိုးကို နောက်ခံအဖြစ်သာ ပြပြီး အဆင့်တွက်ရာတွင် မသုံးပါ။ ရယူချိန်သည် မော်ဒယ်ထုတ်ပြန်ချိန် မဟုတ်ပါ။",
          )}
        </p>
        <Evidence />
        <a href="#/data">
          {t(
            "Full source registry and screening thresholds",
            "ရင်းမြစ်စာရင်းနှင့် စစ်ဆေးသတ်မှတ်ချက်အပြည့်အစုံ",
          )}
        </a>
      </details>
      <Notice>
        {t(
          "Official Myanmar warning-feed coverage is unavailable. Follow Myanmar DMH and local authorities; this platform does not issue official warnings.",
          "မြန်မာတရားဝင်သတိပေးဒေတာ မချိတ်ဆက်ထားပါ။ မိုးဇလနှင့် ဒေသအာဏာပိုင်များ၏ ထုတ်ပြန်ချက်ကို လိုက်နာပါ။ ဤစနစ်က တရားဝင်သတိပေးချက် မထုတ်ပါ။",
        )}{" "}
        <SourceLink href="https://www.dmh.gov.mm/">Myanmar DMH</SourceLink>
      </Notice>
    </div>
  );
}
