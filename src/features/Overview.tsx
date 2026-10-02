import { useApp } from "../app/context";
import { PageTitle, Notice, AlertCard } from "../components/shared";
import { EnsoPanel } from "../components/Enso";
import {
  Concern,
  OfficialStatus,
  StateLabel,
  DataQuality,
  RegionalContext,
} from "../components/Intelligence";
import { Changes } from "../components/Changes";
import { regionalRows, sortRows, coverageKpi } from "../risk/intelligence";
import { activeAlerts, coverageCurrent, rank } from "../risk/engine";
import { regionName } from "../data/regions";
import { leadingSignal, hazardNames, actions } from "../risk/signals";
export default function Overview() {
  const { t, lang, operational: op, data, now } = useApp();
  const rows = sortRows(regionalRows(op, data, now)),
    kpi = coverageKpi(rows),
    alerts = activeAlerts(data, now);
  const priorities = rows.filter(
    (r) => r.official.length || (r.level !== "unknown" && rank[r.level] >= 2),
  );
  const lead = rows
    .filter((r) => r.level !== "unknown")
    .sort(
      (a, b) =>
        rank[b.level as keyof typeof rank] - rank[a.level as keyof typeof rank],
    )[0];
  const signal = lead ? leadingSignal(lead.signals) : undefined;
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
          "A national briefing from dated regional evidence. Independent preparedness information, not a government warning service.",
          "ရက်စွဲပါ ဒေသအထောက်အထားအပေါ် အခြေခံသော နိုင်ငံအကျဉ်းချုပ်။ အစိုးရသတိပေးစနစ်မဟုတ်သော လွတ်လပ်သည့် ပြင်ဆင်ရေးအချက်အလက်။",
        )}
      />
      {alerts[0] && <AlertCard alert={alerts[0]} />}
      <EnsoPanel />
      <section
        className="national-strip"
        aria-label={t("National snapshot", "နိုင်ငံအကျဉ်းချုပ်")}
      >
        <div>
          <span>
            {t(
              "Highest assessed platform concern",
              "စစ်ဆေးပြီး စနစ်အဆင့် အမြင့်ဆုံး",
            )}
          </span>
          <Concern level={lead?.level ?? "unknown"} />
          <small>
            {lead
              ? regionName(lead.id, lang)
              : t("Insufficient data", "ဒေတာ မလုံလောက်")}
          </small>
          <a href="#/warnings">
            {t("See hazard evidence", "အန္တရာယ်အထောက်အထား ကြည့်ရန်")}
          </a>
        </div>
        <div>
          <span>{t("Regions to watch", "စောင့်ကြည့်ရန် ဒေသ")}</span>
          <strong>{kpi.highPriority}/15</strong>
          <small>
            {t(
              "Official alert or elevated+ screening",
              "တရားဝင်သတိပေး သို့မဟုတ် မြင့်တက်အဆင့်နှင့်အထက်",
            )}
          </small>
          <a href="#/warnings">
            {t("Review all regions", "ဒေသအားလုံး စစ်ဆေးရန်")}
          </a>
        </div>
        <div>
          <span>
            {t("Official active warnings", "သက်တမ်းရှိ တရားဝင်သတိပေးချက်")}
          </span>
          <strong>
            {alerts.length || coverageCurrent(data, now)
              ? alerts.length
              : t("Coverage unavailable", "လွှမ်းခြုံဒေတာ မရရှိ")}
          </strong>
          <a href="#/warnings">
            {t(
              "Official coverage & sources",
              "တရားဝင် လွှမ်းခြုံမှုနှင့် ရင်းမြစ်",
            )}
          </a>
        </div>
        <div>
          <span>{t("Data coverage", "ဒေတာ လွှမ်းခြုံမှု")}</span>
          <strong>
            {kpi.available}/{kpi.expected}
          </strong>
          <small>
            {t(
              "Monitoring + context cells, not risk",
              "စောင့်ကြည့် + နောက်ခံဒေတာကွက်၊ အန္တရာယ်အမှတ် မဟုတ်",
            )}
          </small>
          <a href="#/data">
            {t("Inspect completeness", "ပြည့်စုံမှု စစ်ဆေးရန်")}
          </a>
        </div>
      </section>
      <section className="panel padded">
        <div className="row spread">
          <h2>{t("Regions to watch", "စောင့်ကြည့်ရန် ဒေသ")}</h2>
          <a href="#/warnings">{t("All 15 regions", "ဒေသ ၁၅ ခုလုံး")}</a>
        </div>
        <p className="meta">
          {t(
            "Official bulletins first; then maximum independent screening level, with region ID breaking ties. Counts are not probabilities.",
            "တရားဝင်ကြေညာချက် ဦးစွာ၊ ထို့နောက် သီးခြားစစ်ဆေးအဆင့် အမြင့်ဆုံး၊ တူပါက ဒေသကုဒ်အစီအစဉ်။ အရေအတွက်သည် ဖြစ်နိုင်နှုန်း မဟုတ်ပါ။",
          )}
        </p>
        <ol className="watch-list">
          {priorities.slice(0, 5).map((r) => {
            const s = leadingSignal(r.signals);
            return (
              <li key={r.id}>
                <div>
                  <a href={`#/region/${r.id}`}>
                    <strong>{regionName(r.id, lang)}</strong>
                  </a>
                  <p>
                    {s
                      ? t(...hazardNames[s.hazard])
                      : t("Official bulletin", "တရားဝင်ကြေညာချက်")}
                  </p>
                  {s && <small>{t(...s.evidence)}</small>}
                </div>
                <div>
                  <Concern level={r.level} />
                  <p>
                    <OfficialStatus count={r.official.length} />
                  </p>
                </div>
                <div>
                  <StateLabel state={r.state} />
                  <small>
                    {r.evidenceCount}/4 {t("independent inputs", "သီးခြားဒေတာ")}
                  </small>
                </div>
              </li>
            );
          })}
        </ol>
        {!priorities.length && (
          <p>
            {t(
              "No elevated screening or active official bulletin is available in this snapshot. Review coverage; unassessed hazards may still exist.",
              "ဤမှတ်တမ်းတွင် မြင့်တက်စစ်ဆေးအဆင့် သို့မဟုတ် သက်တမ်းရှိ တရားဝင်ကြေညာချက် မရရှိပါ။ လွှမ်းခြုံမှု စစ်ဆေးပါ။ မစစ်ဆေးရသေးသော အန္တရာယ် ရှိနိုင်သည်။",
            )}
          </p>
        )}
      </section>
      <Changes />
      <section className="action-strip">
        <h2>{t("Prepare today", "ယနေ့ ပြင်ဆင်ရန်")}</h2>
        <p>
          {signal
            ? t(...actions[signal.hazard])
            : t(
                "Review local weather and check household preparations.",
                "ဒေသမိုးလေဝသနှင့် အိမ်ထောင်စု ပြင်ဆင်မှုကို စစ်ဆေးပါ။",
              )}
        </p>
        <a href="#/prepare">
          {t(
            "Open your preparedness checklist",
            "သင့်ပြင်ဆင်ရန်စာရင်း ဖွင့်ရန်",
          )}
        </a>
      </section>
      <section className="panel padded">
        <h2>{t("Official advisories", "တရားဝင် အသိပေးချက်များ")}</h2>
        {alerts.length ? (
          alerts.slice(1).map((a) => <AlertCard key={a.id} alert={a} />)
        ) : (
          <Notice>
            <OfficialStatus /> ·{" "}
            {t(
              "Check Myanmar DMH and local authorities. No connected bulletin is not the same as no risk.",
              "မိုး/ဇလနှင့် ဒေသတာဝန်ရှိသူများ၏ သတင်းကို စစ်ဆေးပါ။ ကြေညာချက်နှင့် မချိတ်ဆက်ရသေးခြင်းသည် အန္တရာယ်မရှိဟု မဆိုလိုပါ။",
            )}{" "}
            <a href="https://www.dmh.gov.mm/">Myanmar DMH</a>
          </Notice>
        )}
        {alerts.length === 1 && (
          <p>
            {t(
              "The active official advisory is shown at the top of this briefing.",
              "သက်တမ်းရှိ တရားဝင်အသိပေးချက်ကို ဤအကျဉ်းချုပ်ထိပ်တွင် ပြထားသည်။",
            )}
          </p>
        )}
      </section>
      <RegionalContext />
      <DataQuality />
    </>
  );
}
