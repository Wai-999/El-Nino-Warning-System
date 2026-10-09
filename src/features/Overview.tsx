import { useApp } from "../app/context";
import { PageTitle, Notice } from "../components/shared";
import { EnsoPanel } from "../components/Enso";
import {
  Concern,
  OfficialStatus,
  StateLabel,
  DataSummary,
} from "../components/Intelligence";
import { DecisionKpis } from "../components/DecisionKpis";
import { Changes } from "../components/Changes";
import { regionalRows, sortRows } from "../risk/intelligence";
import { activeAlerts, rank } from "../risk/engine";
import { regionName } from "../data/regions";
import { leadingSignal, hazardNames, actions } from "../risk/signals";
export default function Overview() {
  const { t, lang, operational: op, data, now } = useApp();
  const rows = sortRows(regionalRows(op, data, now)),
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
          "အခြေအနေအလိုက် ပြင်ဆင်ပါ",
        )}
        description={t(
          "A national briefing from dated regional evidence. Independent preparedness information, not a government warning service.",
          "အထောက်အထားအပေါ် အခြေခံသော ရက်စွဲပါဒေသအလိုက် အကျဉ်းချုပ်။ လွတ်လပ်သည့် သတိပေးအချက်အလက်များ။",
        )}
      />

      <EnsoPanel />
      <DecisionKpis />
      <section className="panel padded">
        <div className="row spread">
          <h2>{t("Regions to watch", "စောင့်ကြည့်ရန် ဒေသ")}</h2>
          <a href="#/warnings">{t("All 15 regions", "ဒေသ ၁၅ ခုလုံး")}</a>
        </div>
        <p className="meta">
          {t(
            "Official bulletins first; then maximum independent screening level, with region ID breaking ties. Counts are not probabilities.",
            "ပဏာမ တရားဝင်ကြေညာချက်၊ နောက် အမြင့်ဆုံးသော သီးခြားစစ်ဆေးသည့်အဆင့်၊ ဒေသဆိ့င်ရာကုဒ် တူညီပါက အရေအတွက်သည် ဖြစ်နိုင်ချေများ မဟုတ်ပါ။",
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
              "No elevated screening or active official bulletin is available in this snapshot.",
              "ဤမှတ်တမ်းတွင် လက်ရှိတရားဝင်ကြေညာချက် မရရှိပါ။",
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
                "ဒေသမိုးလေဝသနှင့် အိမ်ထောင်စုအလိုက်ပြင်ဆင်မှုကို စစ်ဆေးနိုင်သည်။",
              )}
        </p>
        <a href="#/prepare">
          {t(
            "Open your preparedness checklist",
            "သင့်ပြင်ဆင်ရန်စာရင်း ဖွင့်ရန်",
          )}
        </a>
      </section>
      <Notice>
        <OfficialStatus count={alerts.length} /> ·{" "}
        <a href="#/warnings">
          {t(
            "Official bulletins and coverage → Warnings",
            "တရားဝင်ကြေညာချက်နှင့် လွှမ်းခြုံမှု → သတိပေးချက်များ",
          )}
        </a>
      </Notice>
      <p>
        <a href="#/learn">
          {t(
            "ASEAN seasonal context and other climate drivers → Learn",
            "အာဆီယံရာသီဥတုနောက်ခံနှင့် အခြားရာသီဥတုအကြောင်းရင်း → လေ့လာရန်",
          )}
        </a>
      </p>
      <DataSummary />
    </>
  );
}
