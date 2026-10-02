import { useApp } from "../app/context";
import { regionName, regions } from "../data/regions";
import { mmt, type DataState } from "../data/operational";
import {
  sourceStatus,
  coverageKpi,
  regionalRows,
  nextScheduledUpdate,
  coverageFor,
  type Category,
} from "../risk/intelligence";
import { contextNotice, sources, sourceById } from "../data/sources";
import { PageTitle, SourceLink, Notice } from "./shared";
import type { Severity } from "../data/schema";
import { coverageCurrent } from "../risk/engine";
import { sectorEvidence } from "../data/impactEvidence";
export const coverageLabels: Record<Category, [string, string]> = {
  temperature: ["Temperature · reanalysis", "အပူချိန် · ပြန်လည်ဆန်းစစ်"],
  precipitation: ["Precipitation · reanalysis", "မိုးရေ · ပြန်လည်ဆန်းစစ်"],
  forecast: ["Weather forecast", "မိုးလေဝသ ခန့်မှန်းချက်"],
  drought: ["Drought assessment", "မိုးခေါင်မှု သုံးသပ်ချက်"],
  flood: ["Flood assessment", "ရေကြီးမှု သုံးသပ်ချက်"],
  agriculture: ["Agriculture context", "စိုက်ပျိုးရေး နောက်ခံ"],
  health: ["Health guidance", "ကျန်းမာရေး လမ်းညွှန်"],
  official: ["Official advisory coverage", "တရားဝင်သတိပေး လွှမ်းခြုံမှု"],
};
export function StateLabel({ state }: { state: DataState }) {
  const { t } = useApp();
  const labels = {
    current: ["Current", "လက်ရှိ"],
    aging: ["Aging", "သက်တမ်းဟောင်းလာ"],
    stale: ["Stale", "သက်တမ်းကျော်"],
    unavailable: ["Unavailable", "မရရှိ"],
  } as const;
  return (
    <span className={`data-state state-${state}`}>
      {t(labels[state][0], labels[state][1])}
    </span>
  );
}
export function Concern({ level }: { level: Severity | "unknown" }) {
  const { t } = useApp();
  const names = {
    normal: ["Low platform risk", "စနစ်အန္တရာယ် နိမ့်"],
    advisory: ["Attention", "သတိပြုရန်"],
    watch: ["Elevated", "မြင့်တက်"],
    warning: ["High", "မြင့်"],
    severe: ["Very high", "အလွန်မြင့်"],
    unknown: ["Insufficient data", "ဒေတာ မလုံလောက်"],
  } as const;
  return (
    <span className={`badge level-${level}`}>
      <span aria-hidden="true">
        {level === "unknown" ? "—" : level === "normal" ? "✓" : "!"}
      </span>
      {t(names[level][0], names[level][1])}
    </span>
  );
}
export function RegionFilter({
  value,
  onChange,
  all = false,
}: {
  value: string;
  onChange: (id: string) => void;
  all?: boolean;
}) {
  const { t, lang } = useApp();
  return (
    <label>
      {t("State / Region", "ပြည်နယ် / တိုင်းဒေသကြီး")}
      <select
        aria-label={t("State / Region", "ပြည်နယ် / တိုင်းဒေသကြီး")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {all && <option value="all">{t("All areas", "ဒေသအားလုံး")}</option>}
        {regions.map(([id]) => (
          <option value={id} key={id}>
            {regionName(id, lang)}
          </option>
        ))}
      </select>
    </label>
  );
}
export function OfficialStatus({ count = 0 }: { count?: number }) {
  const { t, data, now } = useApp();
  return (
    <span className={count ? "official-status" : ""}>
      {count
        ? `${t("Official warning", "တရားဝင်သတိပေးချက်")} · ${count}`
        : coverageCurrent(data, now)
          ? t(
              "No active official warning found",
              "သက်တမ်းရှိ တရားဝင်သတိပေးချက် မတွေ့",
            )
          : t("Data unavailable", "ဒေတာ မရရှိ")}
    </span>
  );
}
export function DataQuality({
  region,
  registry = false,
}: {
  region?: string;
  registry?: boolean;
}) {
  const { t, lang, data, operational: op, now } = useApp();
  const statuses = sourceStatus(op, data, now),
    rows = regionalRows(op, data, now),
    kpi = coverageKpi(rows);
  const weatherRegions = op.weather?.regions.length ?? 0,
    historyRegions = op.history?.regions.length ?? 0;
  return (
    <section className="panel padded data-quality" id="data-quality">
      <h2>
        {t("Data quality & coverage", "ဒေတာအရည်အသွေးနှင့် လွှမ်းခြုံမှု")}
      </h2>
      <div className="quality-stats">
        <p>
          <strong>
            {kpi.available}/{kpi.expected}
          </strong>{" "}
          {t("usable coverage cells", "အသုံးပြုနိုင်သော ဒေတာကွက်")}
        </p>
        <p>
          {t("Monitoring", "စောင့်ကြည့်ဒေတာ")}{" "}
          <strong>
            {kpi.monitoring}/{kpi.monitoringExpected}
          </strong>{" "}
          · {t("Context / guidance", "နောက်ခံ / လမ်းညွှန်")}{" "}
          <strong>
            {kpi.context}/{kpi.contextExpected}
          </strong>
        </p>
      </div>
      <p className="meta">
        {t(
          "15 regions × 8 categories. Current and aging count; stale and missing do not. Context is not a local measurement. Coverage is not a safety score.",
          "ဒေသ ၁၅ ခု × အမျိုးအစား ၈ မျိုး။ လက်ရှိနှင့် သက်တမ်းဟောင်းလာသောဒေတာကိုသာ ရေတွက်သည်။ နောက်ခံသည် ဒေသတိုင်းတာချက် မဟုတ်ပါ။ လွှမ်းခြုံမှုသည် ဘေးကင်းရေးအမှတ် မဟုတ်ပါ။",
        )}
      </p>
      <div className="quality-stats">
        {(["current", "aging", "stale", "unavailable"] as const).map(
          (state) => (
            <p key={state}>
              <StateLabel state={state} />{" "}
              <strong>
                {statuses.filter((s) => s.state === state).length}
              </strong>
            </p>
          ),
        )}
        <p>
          {t("Failed last check", "နောက်ဆုံးရယူမှု မအောင်မြင်")}{" "}
          <strong>{statuses.filter((s) => s.failed).length}</strong>
        </p>
      </div>
      <p>
        {t(
          "Forecast / reanalysis geographic coverage",
          "ခန့်မှန်းချက် / ပြန်လည်ဆန်းစစ် ဒေသလွှမ်းခြုံမှု",
        )}
        : {weatherRegions}/15 · {historyRegions}/15
      </p>
      <p className="meta">
        {t("Last system update", "စနစ် နောက်ဆုံးမွမ်းမံချိန်")}:{" "}
        {op.generatedAt.startsWith("1970")
          ? t("Unavailable", "မရရှိ")
          : mmt(op.generatedAt, lang)}
        <br />
        {t(
          "Next scheduled check (publication may be delayed)",
          "နောက်စီစဉ်ထားသော စစ်ဆေးချိန် (ထုတ်ပြန်မှု နောက်ကျနိုင်)",
        )}
        : {mmt(nextScheduledUpdate(now), lang)}
      </p>
      <details open={!!region}>
        <summary>
          {t("Coverage by category", "အမျိုးအစားအလိုက် လွှမ်းခြုံမှု")}
          {region ? ` · ${regionName(region, lang)}` : ""}
        </summary>
        {region ? (
          <dl className="coverage-list">
            {coverageFor(op, data, region, now).map((c) => (
              <div key={c.category}>
                <dt>{t(...coverageLabels[c.category])}</dt>
                <dd>
                  <StateLabel state={c.state} />
                  {c.sourceId && (
                    <>
                      {" "}
                      ·{" "}
                      <SourceLink href={sourceById(c.sourceId).url}>
                        {sourceById(c.sourceId).organization}
                      </SourceLink>
                    </>
                  )}
                  {c.period && <small>{c.period}</small>}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="table-scroll">
            <table className="coverage-table">
              <caption>
                {t(
                  "Every region, including missing data",
                  "ဒေတာမရှိသော ဒေသအပါအဝင် ဒေသအားလုံး",
                )}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t("State / Region", "ပြည်နယ် / တိုင်း")}</th>
                  {rows[0].coverage.map((c) => (
                    <th scope="col" key={c.category}>
                      {t(...coverageLabels[c.category])}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">
                      <a href={`#/region/${r.id}`}>{regionName(r.id, lang)}</a>
                    </th>
                    {r.coverage.map((c) => (
                      <td key={c.category}>
                        <StateLabel state={c.state} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
      <details open={registry}>
        <summary>
          {t(
            "Source registry & last checks",
            "ရင်းမြစ်စာရင်းနှင့် နောက်ဆုံးစစ်ဆေးချိန်",
          )}
        </summary>
        <p>
          {t(
            "Tier 1 Myanmar authorities → Tier 2 ASEAN → Tier 3 international operational → Tier 4 research. Context and research never become official Myanmar warnings. Same-source dated fallback only; no model substitution.",
            "အဆင့် ၁ မြန်မာဌာန → အဆင့် ၂ ASEAN → အဆင့် ၃ နိုင်ငံတကာ လုပ်ငန်းသုံး → အဆင့် ၄ သုတေသန။ နောက်ခံနှင့် သုတေသနကို မြန်မာတရားဝင်သတိပေးချက်အဖြစ် မပြောင်းပါ။ မရယူနိုင်လျှင် ရင်းမြစ်တူ ယခင်အတည်ပြုဒေတာကိုသာ ထားသည်။",
          )}
        </p>
        <div className="source-cards">
          {statuses.map((s) => (
            <article key={s.id}>
              <div className="row spread">
                <strong>{s.organization}</strong>
                <StateLabel state={s.state} />
              </div>
              <p>
                {t("Tier", "အဆင့်")} {s.tier} ·{" "}
                <SourceLink href={s.url}>{s.dataset}</SourceLink>
              </p>
              {s.failed && (
                <p className="failed-source">
                  {t(
                    "Latest source check failed; retained evidence keeps its original dates.",
                    "နောက်ဆုံးရင်းမြစ်ရယူမှု မအောင်မြင်ပါ။ သိမ်းဒေတာ မူရင်းရက်စွဲ မပြောင်းပါ။",
                  )}
                </p>
              )}
              <dl>
                <dt>{t("Data period", "ဒေတာကာလ")}</dt>
                <dd>{s.period ?? t("Unavailable", "မရရှိ")}</dd>
                <dt>{t("Retrieved / reviewed", "ရယူ / ပြန်စစ်ချိန်")}</dt>
                <dd>
                  {s.retrievedAt
                    ? mmt(s.retrievedAt, lang)
                    : t("Unavailable", "မရရှိ")}
                </dd>
                {s.checkedAt && (
                  <>
                    <dt>{t("Latest check", "နောက်ဆုံး စစ်ဆေးချိန်")}</dt>
                    <dd>{mmt(s.checkedAt, lang)}</dd>
                  </>
                )}
              </dl>
              <details>
                <summary>{t("Technical metadata", "နည်းပညာအချက်အလက်")}</summary>
                <p>
                  {s.geography} · {s.temporal}
                </p>
                <p>
                  {s.cadence} · {s.license}
                </p>
                <p>{s.method}</p>
                <p>{s.limitations}</p>
              </details>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
export function RegionalContext() {
  const { t, operational, data, now } = useApp();
  const s = sourceStatus(operational, data, now).find((s) => s.id === "asmc")!;
  return (
    <section className="panel padded regional-context">
      <p className="eyebrow">{t(...contextNotice)}</p>
      <h2>
        {t(
          "Seasonal context · Southeast Asia",
          "ရာသီအလိုက် နောက်ခံ · အရှေ့တောင်အာရှ",
        )}
      </h2>
      <StateLabel state={s.state} />
      <p>
        {t(
          "ASMC’s September–November 2026 outlook favours warmer conditions across much of Southeast Asia. Mainland rainfall signals have limited model agreement; this does not assign probabilities to Myanmar regions.",
          "ASMC ၂၀၂၆ စက်တင်ဘာ–နိုဝင်ဘာ သုံးသပ်ချက်အရ အရှေ့တောင်အာရှ နေရာအများအပြားတွင် ပိုပူနိုင်သည်။ ကုန်းမကြီးမိုးရေအတွက် မော်ဒယ်များ သဘောတူမှု နည်းသည်။ မြန်မာဒေသများ၏ ဖြစ်နိုင်နှုန်းကို မသတ်မှတ်ပါ။",
        )}
      </p>
      <p className="meta">
        {t(
          "Issued 2 September 2026 · valid September–November · manually reviewed 2 October 2026. ENSO, monsoon circulation, IOD, MJO and local terrain can all influence weather.",
          "၂၀၂၆ စက်တင်ဘာ ၂ ထုတ်ပြန် · စက်တင်ဘာ–နိုဝင်ဘာအတွက် · အောက်တိုဘာ ၂ တွင် လူဖြင့်ပြန်စစ်။ ENSO၊ မုတ်သုံ၊ IOD၊ MJO နှင့် ဒေသမြေပြင်တို့က မိုးလေဝသကို လွှမ်းမိုးနိုင်သည်။",
        )}
      </p>
      <SourceLink href={s.url}>ASMC</SourceLink>
    </section>
  );
}
export function RegionEvidence({ id }: { id: string }) {
  const { t, operational: op, data, now, lang } = useApp();
  const row = regionalRows(op, data, now).find((r) => r.id === id)!;
  return (
    <>
      <section className="panel padded">
        <h2>{t("Why am I seeing this?", "ဘာကြောင့် ဤအခြေအနေကို ပြသသလဲ။")}</h2>
        <Concern level={row.level} />
        <p>
          {row.evidenceCount}/4{" "}
          {t(
            "independent screening inputs: heat, heavy rain, precipitation deficit and wind. Highest available level; a missing input cannot create a low-risk status. Official Myanmar warnings always take precedence.",
            "သီးခြားစစ်ဆေးဒေတာ — အပူ၊ မိုးသည်း၊ မိုးရေလျော့နည်းမှုနှင့် လေ။ ရရှိသော အမြင့်ဆုံးအဆင့်ကို သုံးသည်။ ဒေတာမရှိပါက အန္တရာယ်နိမ့်ဟု မသတ်မှတ်ပါ။ မြန်မာတရားဝင်သတိပေးချက်ကို အမြဲဦးစားပေးသည်။",
          )}
        </p>
        <OfficialStatus count={row.official.length} />
        <p>
          {t(
            "Confidence: not calibrated against Myanmar impacts. Three sampled grid cells do not resolve every township. Drought, river flooding, fire and disease surveillance remain unavailable.",
            "ယုံကြည်နိုင်မှု — မြန်မာသက်ရောက်မှုဒေတာဖြင့် မချိန်ညှိရသေးပါ။ နမူနာကွက် သုံးခုက မြို့နယ်အားလုံးကို မဖော်ပြနိုင်ပါ။ မိုးခေါင်၊ မြစ်ရေကြီး၊ မီးနှင့် ရောဂါစောင့်ကြည့်ဒေတာ မရရှိပါ။",
          )}
        </p>
        <a href="#/data">
          {t(
            "Variables, thresholds, baselines and limitations",
            "ကိန်းရှင်၊ သတ်မှတ်ချက်၊ အခြေခံကာလနှင့် အကန့်အသတ်",
          )}
        </a>
      </section>
      <section className="panel padded">
        <h2>
          {t(
            "Agriculture & health implications",
            "စိုက်ပျိုးရေးနှင့် ကျန်းမာရေးဆိုင်ရာ",
          )}
        </h2>
        <h3>
          {t(
            "National crop calendar context",
            "နိုင်ငံအဆင့် သီးနှံပြက္ခဒိန် နောက်ခံ",
          )}
        </h3>
        <StateLabel
          state={sourceStatus(op, data, now).find((s) => s.id === "fao")!.state}
        />
        <p>
          {t(
            "FAO’s 18 September 2026 brief expects main paddy harvest from late October and secondary paddy planting from October. Actual timing varies by locality. Climate pressure must be combined with crop exposure and growth stage; these are not measured here.",
            "FAO ၂၀၂၆ စက်တင်ဘာ ၁၈ စာတမ်းအရ မိုးစပါးရိတ်သိမ်းမှု အောက်တိုဘာနှောင်းပိုင်းနှင့် နွေစပါးစိုက်ပျိုးမှု အောက်တိုဘာမှ စတင်နိုင်သည်။ ဒေသအလိုက် အချိန်ကွာသည်။ ရာသီဥတုဖိအားကို သီးနှံထိတွေ့မှု၊ ကြီးထွားအဆင့်နှင့် တွဲသုံးရမည်။ ဤစနစ်တွင် ထိုဒေတာ မတိုင်းတာပါ။",
          )}
        </p>
        <SourceLink href={sourceById("fao").url}>
          FAO GIEWS · Myanmar
        </SourceLink>
        <h3>
          {t(
            "Health preparedness, not an outbreak forecast",
            "ရောဂါခန့်မှန်းချက်မဟုတ်သော ကျန်းမာရေးပြင်ဆင်မှု",
          )}
        </h3>
        <p>{t(...sectorEvidence.health.why)}</p>
        <p>{t(...sectorEvidence.health.prepare)}</p>
        <SourceLink href={sourceById("who").url}>
          WHO · Heat and health
        </SourceLink>
        <p className="meta">
          {t("Retrieved / reviewed", "ရယူ / ပြန်စစ်")}:{" "}
          {mmt(
            sourceStatus(op, data, now).find((s) => s.id === "who")!
              .retrievedAt!,
            lang,
          )}
        </p>
        <a href={`#/impacts?sector=health&region=${id}&evidence=all`}>
          {t(
            "Explore dated evidence and preparedness",
            "ရက်စွဲပါ အထောက်အထားနှင့် ပြင်ဆင်မှုကို ကြည့်ရန်",
          )}
        </a>
      </section>
      <DataQuality region={id} />
    </>
  );
}
// Shared imports above deliberately have no map or geometry dependencies.
export { PageTitle, Notice, sources };
