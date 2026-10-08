import { useEffect, useState } from "react";
import { HeartPulse, Sprout, Droplets, Zap } from "lucide-react";
import { useApp } from "../app/context";
import { PageTitle, Notice, Level, SourceLink } from "../components/shared";
import { Evidence, SignalCard, value } from "../components/Operational";
import { LocationSelect } from "../components/LocationSelect";
import { locationName } from "../risk/locations";
import { nationalImpactMetrics } from "../risk/impactMetrics";
import "../styles/health.css";
import { regionName } from "../data/regions";
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
  const {
    t,
    lang,
    data,
    now,
    operational: op,
    loading,
    operationalError,
    operationalCached,
  } = useApp();
  const [filters, setFilters] = useState(() => impactFilters(location.hash));
  useEffect(() => {
    const sync = () => setFilters(impactFilters(location.hash));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const change = (next: Partial<ImpactFilters>) => {
    const updated = { ...filters, ...next };
    setFilters(updated);
    location.hash = impactHash(updated);
  };
  const sector = sectorEvidence[filters.sector],
    assessment = assessSector(op, data, filters.sector, now);
  const selected = assessment.assessed.find((r) => r.id === filters.region);
  const showOperational = ["all", "forecast", "observed"].includes(
    filters.evidence,
  );
  const visibleSignals =
    selected?.signals.filter(
      (s) =>
        filters.evidence === "all" ||
        (filters.evidence === "forecast" && s.source === "ecmwf") ||
        (filters.evidence === "observed" && s.source === "era5"),
    ) ?? [];
  const metrics = nationalImpactMetrics(op, now).filter(
    (m) => filters.evidence === "all" || m.kind === filters.evidence,
  );
  const gaps = [
    [
      "Drought",
      "မိုးခေါင်မှု",
      "Precipitation deficit is available; validated SPI/SPEI and soil-moisture impacts are not.",
      "မိုးရေလိုငွေ ရရှိသော်လည်း အတည်ပြု SPI/SPEI၊ မြေအစိုဓာတ် သက်ရောက်မှု မရရှိပါ။",
    ],
    [
      "Flood / heavy rain",
      "ရေကြီး / မိုးသည်း",
      "Heavy-rain forecasts are available. River levels and inundation forecasts are not connected.",
      "မိုးသည်းခန့်မှန်းချက် ရရှိသည်။ မြစ်ရေအမြင့်နှင့် ရေလွှမ်းခန့်မှန်းဒေတာ မချိတ်ဆက်ထားပါ။",
    ],
    [
      "Wildfire / haze",
      "တောမီး / မီးခိုးမြူ",
      "No verified fire or air-quality exposure series is connected.",
      "အတည်ပြု မီးလောင် သို့မဟုတ် လေထုထိတွေ့မှုဒေတာ မချိတ်ဆက်ထားပါ။",
    ],
    [
      "Food security",
      "စားနပ်ရိက္ခာဖူလုံရေး",
      "Crop weather does not measure food access, nutrition or prices.",
      "သီးနှံမိုးလေဝသက စားနပ်ရိက္ခာလက်လှမ်းမီမှု၊ အာဟာရနှင့် ဈေးနှုန်း မတိုင်းတာပါ။",
    ],
    [
      "Livelihoods",
      "အသက်မွေးဝမ်းကျောင်း",
      "No current local income, labour-exposure or loss series is available here.",
      "လက်ရှိဒေသဝင်ငွေ၊ လုပ်သားထိတွေ့မှုနှင့် ဆုံးရှုံးမှုဒေတာ ဤနေရာတွင် မရရှိပါ။",
    ],
    [
      "Ecosystems",
      "ဂေဟစနစ်",
      "No validated local biodiversity or ecosystem-impact series is connected.",
      "အတည်ပြု ဒေသဇီဝမျိုးစုံနှင့် ဂေဟသက်ရောက်မှုဒေတာ မချိတ်ဆက်ထားပါ။",
    ],
  ];
  return (
    <div className="impacts-page">
      <PageTitle
        eyebrow={t(
          "LOCATION → EVIDENCE → ACTION",
          "တည်နေရာ → အထောက်အထား → လုပ်ဆောင်ရန်",
        )}
        title={t(
          `Potential impacts for ${locationName(filters.region, lang)}`,
          `${locationName(filters.region, lang)} အတွက် ဖြစ်နိုင်သက်ရောက်မှုများ`,
        )}
        description={t(
          "Select a location to inspect potential pressures. These are hazard screens and conditional scenarios, not measured damage or disease forecasts.",
          "တည်နေရာရွေး၍ ဖြစ်နိုင်သောဖိအားများကို ကြည့်ပါ။ ဘေးစစ်ဆေးမှုနှင့် အခြေအနေပေါ်မူတည်သော သုံးသပ်ချက်များဖြစ်ပြီး ပျက်စီးမှုတိုင်းတာချက် သို့မဟုတ် ရောဂါခန့်မှန်းချက် မဟုတ်ပါ။",
        )}
      />
      <div className="impact-filters">
        <LocationSelect
          id="impact-region"
          value={filters.region}
          onChange={(region) => change({ region })}
        />
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
      {!loading && operationalError && (
        <Notice>
          {t(
            "Latest regional data could not be loaded. Retained data keeps its original dates; missing evidence remains unavailable.",
            "နောက်ဆုံးဒေသဒေတာ မရယူနိုင်ပါ။ သိမ်းထားသောဒေတာသည် မူရင်းရက်စွဲကို ထားရှိပြီး မရှိလျှင် မရရှိနိုင်ဟု ပြသည်။",
          )}
        </Notice>
      )}
      {operationalCached && (
        <p className="meta">
          {t(
            "Cached copy — check source dates.",
            "သိမ်းထားသောဒေတာ — မူရင်းရက်စွဲ စစ်ဆေးပါ။",
          )}
        </p>
      )}
      {showOperational && (
        <section className="panel padded impact-priorities">
          <h2>
            {t("Top potential pressures", "ဦးစားပေး စောင့်ကြည့်ရန် ဖိအားများ")}{" "}
            · {t(...sector.name)}
          </h2>
          <p>
            {t(
              "FORECAST / OBSERVED REANALYSIS · highest available sector drivers. This is not a damage ranking or an official warning. The evidence filter changes the details below; the summary uses all sector drivers.",
              "ခန့်မှန်း / အတိတ်ပြန်လည်ဆန်းစစ်ဒေတာ · ရရှိသော အမြင့်ဆုံးကဏ္ဍအကြောင်းရင်းများ။ ပျက်စီးမှုအဆင့်စဉ် သို့မဟုတ် တရားဝင်သတိပေးချက် မဟုတ်ပါ။ ရွေးချယ်မှုသည် အသေးစိတ်ကို ပြောင်းပြီး အကျဉ်းချုပ်တွင် ကဏ္ဍဒေတာအားလုံး သုံးသည်။",
            )}
          </p>
          {loading ? (
            <p role="status">
              {t("Loading sector drivers…", "ကဏ္ဍအထောက်အထား ရယူနေသည်…")}
            </p>
          ) : selected ? (
            <>
              <Level level={selected.level} />
              {!selected.complete && (
                <p>
                  <strong>
                    {t("Incomplete evidence", "အထောက်အထား မပြည့်စုံ")}
                  </strong>
                </p>
              )}
              <div className="signal-grid">
                {visibleSignals.map((s) => (
                  <SignalCard key={s.hazard} signal={s} />
                ))}
              </div>
              {!visibleSignals.length && (
                <p>
                  {t(
                    "No driver of this evidence type is used for this sector.",
                    "ဤကဏ္ဍတွင် ဤအထောက်အထားအမျိုးအစားကို မသုံးပါ။",
                  )}
                </p>
              )}
            </>
          ) : (
            <>
              <p>
                {assessment.complete}/15{" "}
                {t(
                  "regions: all sector drivers assessed",
                  "ဒေသ — ကဏ္ဍအကြောင်းရင်းအားလုံး စစ်ဆေးနိုင်",
                )}{" "}
                · {assessment.partial} {t("partial", "တစ်စိတ်တစ်ပိုင်း")} ·{" "}
                {assessment.unavailable} {t("unavailable", "မရရှိနိုင်")}
              </p>
              <ul className="impact-priority-list">
                {assessment.elevated.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    <a href={impactHash({ ...filters, region: r.id })}>
                      {regionName(r.id, lang)}
                    </a>{" "}
                    <Level level={r.level} />
                    {!r.complete && (
                      <small>
                        {" "}
                        · {t("Incomplete evidence", "အထောက်အထား မပြည့်စုံ")}
                      </small>
                    )}
                  </li>
                ))}
              </ul>
              {!assessment.elevated.length && (
                <p>
                  {t(
                    "No elevated driver is available. Check completeness: missing evidence does not mean zero risk.",
                    "မြင့်တက်သောအကြောင်းရင်း မရရှိပါ။ ပြည့်စုံမှုစစ်ဆေးပါ။ ဒေတာမရှိခြင်းသည် အန္တရာယ်မရှိဟု မဆိုလိုပါ။",
                  )}
                </p>
              )}
              <a href="#/warnings">
                {t(
                  "All regional screening and official warning coverage",
                  "ဒေသစစ်ဆေးမှုအားလုံးနှင့် တရားဝင်သတိပေး လွှမ်းခြုံမှု",
                )}
              </a>
            </>
          )}
        </section>
      )}
      {showOperational &&
        (selected ? (
          <MyanmarSnapshot
            region={filters.region}
            evidence={filters.evidence}
          />
        ) : (
          <section className="panel padded impact-snapshot">
            <h2>
              {t(
                "Temperature / heat & rainfall across Myanmar",
                "မြန်မာတစ်ဝန်း အပူချိန် / အပူနှင့် မိုးရေ",
              )}
            </h2>
            <p>
              {t(
                "Ranges of sampled regional estimates, not national averages. Choose a State/Region for amounts and source details.",
                "ဒေသနမူနာတန်ဖိုးများ၏ အပိုင်းအခြားဖြစ်ပြီး နိုင်ငံပျမ်းမျှ မဟုတ်ပါ။ အသေးစိတ်အတွက် တိုင်း/ပြည်နယ် ရွေးပါ။",
              )}
            </p>
            <div className="impact-evidence-grid">
              {metrics.map((m) => (
                <article className="impact-data-block" key={m.id}>
                  <p className="evidence-label">{t(...m.kindLabel)}</p>
                  <StateLabel state={m.state} />
                  <h3>{t(...m.label)}</h3>
                  <strong>
                    {m.range
                      ? `${value(m.range[0], m.unit)} – ${value(m.range[1], m.unit)}`
                      : t("Unavailable", "မရရှိနိုင်")}
                  </strong>
                  <p>
                    {t(
                      "Regions with usable values",
                      "အသုံးပြုနိုင်သော ဒေသတန်ဖိုး",
                    )}
                    : {m.count}/15
                  </p>
                  <p className="meta">
                    {m.period ?? t("Period unavailable", "ကာလ မရရှိ")} ·{" "}
                    {t(...m.baseline)}
                  </p>
                  <p>{t(...m.why)}</p>
                  <p className="meta">
                    {t("Retrieved", "ရယူချိန်")}:{" "}
                    {m.updatedAt ? mmt(m.updatedAt, lang) : "—"}
                  </p>
                  <SourceLink href={m.sourceUrl}>{m.source}</SourceLink>
                </article>
              ))}
            </div>
            <Evidence />
          </section>
        ))}
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
      {filters.evidence !== "historical" && (
        <section className="panel padded">
          <p className="evidence-label">
            {t(
              "SCENARIO · POTENTIAL IMPACT",
              "အခြေအနေအလိုက် ဖြစ်နိုင်သက်ရောက်မှု",
            )}
          </p>
          <h2>
            {t(...sector.name)} · {locationName(filters.region, lang)}
          </h2>
          <p className="lead">{t(...sector.what)}</p>
          <p>
            <strong>{t("Who may be affected", "ထိခိုက်နိုင်သူများ")}: </strong>
            {t(...sector.who)}
          </p>
          <p>
            <strong>{t("What to monitor", "စောင့်ကြည့်ရန်")}: </strong>
            {t(...sector.when)}
          </p>
          <details>
            <summary>
              {t(
                "Why, when and how strong is the evidence?",
                "အကြောင်းရင်း၊ ကာလနှင့် အထောက်အထား ခိုင်မာမှု",
              )}
            </summary>
            <div className="impact-explanation">
              <p>{t(...sector.why)}</p>
              <p>{t(...sector.limitation)}</p>
            </div>
            <p>
              {t(
                "Local impact likelihood is unknown. No calibrated probability, yield loss or number of patients is available.",
                "ဒေသထိခိုက်နိုင်ခြေ မသိရပါ။ အတည်ပြုဖြစ်နိုင်နှုန်း၊ သီးနှံဆုံးရှုံးမှု၊ လူနာအရေအတွက် မရရှိပါ။",
              )}
            </p>
          </details>
          <p className="signal-action">{t(...sector.prepare)}</p>
          <Sources ids={sector.sources} />
          <div className="row">
            <a href={`#/health?region=${filters.region}`}>
              {t(
                "Health signs and safe response",
                "ကျန်းမာရေးလက္ခဏာနှင့် ဘေးကင်းတုံ့ပြန်မှု",
              )}
            </a>
            <a href="#/prepare">
              {t("Preparedness checklist", "ပြင်ဆင်ရန်စာရင်း")}
            </a>
          </div>
        </section>
      )}
      <section className="panel padded impact-gaps">
        <h2>
          {t(
            "Evidence limits for this location",
            "ဤဒေသ၏ အထောက်အထားအကန့်အသတ်များ",
          )}
        </h2>
        <p className="evidence-label">
          {t(
            "INSUFFICIENT LOCATION-SPECIFIC EVIDENCE",
            "ဒေသအလိုက် အထောက်အထား မလုံလောက်",
          )}
        </p>
        <p>
          {t(
            "AUTHORITATIVE DATA NOT CURRENTLY AVAILABLE for local outcomes in the areas below. No sector is assigned a safe status from missing data.",
            "အောက်ပါကဏ္ဍများ၏ ဒေသရလဒ်အတွက် လက်ရှိ ယုံကြည်စိတ်ချရသော ဒေတာ မရရှိပါ။ ဒေတာမရှိသောကဏ္ဍကို ဘေးကင်းဟု မသတ်မှတ်ပါ။",
          )}
        </p>
        {gaps.map(([en, my, detail, detailMy]) => (
          <details key={en}>
            <summary>
              {t(en, my)} · {t("Unavailable", "မရရှိနိုင်")}
            </summary>
            <p>{t(detail, detailMy)}</p>
          </details>
        ))}
        <p>
          {t(
            "Health, agriculture, water and energy pathways above are scenarios. Local disease incidence, crop losses, supply failures and power outages are not measured.",
            "အထက်ပါ ကျန်းမာရေး၊ စိုက်ပျိုးရေး၊ ရေနှင့် စွမ်းအင်တို့သည် ဖြစ်နိုင်ပုံများသာ ဖြစ်သည်။ ဒေသလူနာနှုန်း၊ သီးနှံဆုံးရှုံးမှု၊ ရေပေးဝေမှုနှင့် မီးပြတ်မှုကို မတိုင်းတာပါ။",
          )}
        </p>
        <a href="#/data">
          {t(
            "Research, missing sources and methods",
            "ရင်းမြစ်သုတေသန၊ မရရှိသည့်ဒေတာနှင့် နည်းလမ်း",
          )}
        </a>
      </section>
      <section className="panel padded impact-crosslinks">
        <h2>{t("Follow the evidence", "အထောက်အထား ဆက်လက်လေ့လာရန်")}</h2>
        <p className="evidence-label">
          {t("HISTORICAL ASSOCIATION", "သမိုင်းဆိုင်ရာ ဆက်နွယ်မှု")}
        </p>
        <a href="#/records">
          {t(
            "Dated historical impacts and limitations → Records",
            "ရက်စွဲပါ အတိတ်သက်ရောက်မှုနှင့် အကန့်အသတ် → မှတ်တမ်းများ",
          )}
        </a>
        <p>
          <a href="#/">
            {t(
              "Current official ENSO outlook → Overview",
              "လက်ရှိတရားဝင် ENSO မျှော်မှန်းချက် → အကျဉ်းချုပ်",
            )}
          </a>
        </p>
        <p>
          <a href="#/learn">
            {t(
              "How ENSO, monsoon and other drivers interact → Learn",
              "ENSO၊ မုတ်သုံနှင့် အခြားအကြောင်းရင်း → လေ့လာရန်",
            )}
          </a>
        </p>
        <p>
          <a href="#/warnings">
            {t(
              "OFFICIAL WARNING · coverage and original bulletins",
              "တရားဝင်သတိပေးချက် · လွှမ်းခြုံမှုနှင့် မူရင်းကြေညာချက်",
            )}
          </a>
        </p>
      </section>
    </div>
  );
}
