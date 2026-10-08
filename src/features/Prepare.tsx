import { useState } from "react";
import { Check, Printer, LockKeyhole } from "lucide-react";
import { useApp } from "../app/context";
import { checklists } from "../data/content";
import { Notice, PageTitle, SourceLink } from "../components/shared";
export default function Prepare() {
  const { t } = useApp();
  const [group, setGroup] = useState("household");
  const [saved, setSaved] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const v = JSON.parse(localStorage.getItem("mokinn-checklist") || "{}");
      return v && typeof v === "object" && !Array.isArray(v)
        ? Object.fromEntries(
            Object.entries(v)
              .filter(([, v]) => typeof v === "boolean")
              .map(([k, v]) => [k, Boolean(v)]),
          )
        : {};
    } catch {
      return {};
    }
  });
  const list = checklists.find((c) => c.id === group)!;
  const completed = list.items.filter(
    (_, i) => checked[`${group}-${i}`],
  ).length;
  function toggle(key: string) {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    try {
      localStorage.setItem("mokinn-checklist", JSON.stringify(next));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow={t("PREPAREDNESS CENTER", "ကြိုတင်ပြင်ဆင်ရေး")}
        title={t(
          "A little preparation goes a long way.",
          "ကြိုတင်ပြင်ဆင်မှုက အထောက်အကူပြုပါသည်။",
        )}
        description={t(
          "Simple checklists for your household, livelihood, and community.",
          "အိမ်ထောင်စု၊ အသက်မွေးဝမ်းကျောင်းနှင့် ရပ်ရွာအတွက် ရိုးရှင်းသော စစ်ဆေးရန်စာရင်းများ",
        )}
      />
      <div className="prepare-layout">
        <nav
          className="checklist-nav"
          aria-label={t("Preparedness groups", "ပြင်ဆင်ရေးအုပ်စုများ")}
        >
          {checklists.map((c) => (
            <button
              key={c.id}
              aria-pressed={group === c.id}
              onClick={() => setGroup(c.id)}
            >
              {t(...c.name)}
              <span>
                {c.items.filter((_, i) => checked[`${c.id}-${i}`]).length}/
                {c.items.length}
              </span>
            </button>
          ))}
        </nav>
        <section className="panel checklist-panel">
          <div className="row spread">
            <p className="eyebrow">
              {t("MY PREPAREDNESS PLAN", "ကျွန်ုပ်၏ ပြင်ဆင်ရေးအစီအစဉ်")}
            </p>
            <button
              className="icon-button"
              onClick={() => window.print()}
              aria-label={t("Print checklist", "စာရင်း ပုံနှိပ်ရန်")}
            >
              <Printer size={19} />
            </button>
          </div>
          <h2>{t(...list.name)}</h2>
          <p aria-live="polite">
            {completed} / {list.items.length}{" "}
            {t("steps complete", "ချက် ပြီးစီးပြီ")}
          </p>
          <progress
            value={completed}
            max={list.items.length}
            aria-label={t("Checklist completion", "စာရင်းပြီးစီးမှု")}
          />
          <div className="checklist-items">
            {list.items.map((item, i) => (
              <label
                key={`${group}-${i}`}
                className={checked[`${group}-${i}`] ? "is-done" : ""}
              >
                <input
                  type="checkbox"
                  checked={!!checked[`${group}-${i}`]}
                  onChange={() => toggle(`${group}-${i}`)}
                />
                <span>{t(...item)}</span>
                {checked[`${group}-${i}`] && (
                  <Check size={16} aria-hidden="true" />
                )}
              </label>
            ))}
          </div>
          <div className="source-row">
            <SourceLink href={list.source}>
              {t("Guidance source", "လမ်းညွှန် ရင်းမြစ်")}
            </SourceLink>
            <span className="row">
              <LockKeyhole size={14} />
              {saved
                ? t("Saved only on this device", "ဤစက်တွင်သာ သိမ်းဆည်းသည်")
                : t(
                    "Storage blocked: saved for this visit only",
                    "သိမ်းဆည်းခွင့်မရှိ၍ ယခုဖွင့်ချိန်တွင်သာ ရှိမည်",
                  )}
            </span>
          </div>
        </section>
      </div>
      <section className="panel padded">
        <h2>
          {t(
            "Recognize urgent health signs",
            "အရေးပေါ်ကျန်းမာရေးလက္ခဏာ သိထားပါ",
          )}
        </h2>
        <p>
          {t(
            "Save the Health guide with your emergency plan. Heatstroke needs immediate medical help and cooling.",
            "အရေးပေါ်အစီအစဉ်နှင့်အတူ ကျန်းမာရေးလမ်းညွှန် သိမ်းထားပါ။ အပူလျှပ်လျှင် ချက်ချင်းဆေးအကူအညီနှင့် အအေးပေးခြင်း လိုသည်။",
          )}
        </p>
        <a href="#/health?topic=heatstroke">
          {t(
            "Symptoms, safe first aid and emergency red flags → Health",
            "လက္ခဏာ၊ ရှေးဦးပြုစုမှုနှင့် အရေးပေါ်အချက် → ကျန်းမာရေး",
          )}
        </a>
      </section>
      <Notice>
        {t(
          "These are general preparations, not a local forecast or a personalised medical plan. Follow current local guidance and your clinician’s advice.",
          "ဤသည် အထွေထွေပြင်ဆင်ရေးဖြစ်ပြီး ဒေသခန့်မှန်းချက် သို့မဟုတ် တစ်ဦးချင်းဆေးကုသမှုအစီအစဉ် မဟုတ်ပါ။ လက်ရှိဒေသညွှန်ကြားချက်နှင့် ဆရာဝန်၏အကြံပြုချက်ကို လိုက်နာပါ။",
        )}
      </Notice>
    </>
  );
}
