import { Info, ExternalLink, ShieldAlert } from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import type { Alert, Severity } from "../data/schema";
import { regionName } from "../data/regions";
export function Level({ level }: { level: Severity | "unknown" }) {
  const { t } = useApp();
  const names = {
    unknown: t("Not assessed", "မသတ်မှတ်နိုင်သေး"),
    normal: t("Normal", "ပုံမှန်"),
    advisory: t("Advisory", "အသိပေးချက်"),
    watch: t("Watch", "စောင့်ကြည့်ရန်"),
    warning: t("Warning", "သတိပေးချက်"),
    severe: t("Severe", "ပြင်းထန်"),
  };
  return (
    <span className={`badge level-${level}`}>
      <span aria-hidden="true">
        {level === "unknown" ? "—" : level === "normal" ? "✓" : "!"}
      </span>
      {names[level]}
    </span>
  );
}
export function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const { t } = useApp();
  return (
    <a className="source-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <ExternalLink size={13} aria-hidden="true" />
      <span className="sr-only">
        {" "}
        {t("(opens in a new tab)", "(တက်ဘ်အသစ်တွင် ဖွင့်မည်)")}
      </span>
    </a>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="notice">
      <Info size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
export function AlertCard({ alert }: { alert: Alert }) {
  const { lang, t } = useApp();
  const conf = {
    low: t("Low", "နိမ့်"),
    medium: t("Medium", "အလယ်အလတ်"),
    high: t("High", "မြင့်"),
    "not-provided": t("Not provided by source", "ရင်းမြစ်တွင် မဖော်ပြထား"),
  };
  return (
    <article className={`panel alert-card level-border-${alert.severity}`}>
      <div className="row spread">
        <span className="eyebrow">{regionName(alert.regionId, lang)}</span>
        <Level level={alert.severity} />
      </div>
      <p className="eyebrow">{t("OFFICIAL WARNING", "တရားဝင် သတိပေးချက်")}</p>
      <h2>
        <ShieldAlert size={21} />
        {alert.title[lang]}
      </h2>
      <p>{alert.description[lang]}</p>
      <p className="meta">
        {dateLabel(alert.validFrom, lang)} – {dateLabel(alert.validUntil, lang)}
      </p>
      <p>
        <strong>{t("Who may be affected", "ထိခိုက်နိုင်သူများ")}:</strong>{" "}
        {alert.affected[lang]}
      </p>
      <p>{alert.impacts[lang]}</p>
      <h3>{t("What to do now", "ယခုလုပ်ဆောင်ရန်")}</h3>
      <ol>
        {alert.actions.map((a, i) => (
          <li key={i}>{a[lang]}</li>
        ))}
      </ol>
      <details>
        <summary>
          {t(
            "Why am I seeing this warning?",
            "ဤသတိပေးချက်ကို ဘာကြောင့် ပြသသလဲ။",
          )}
        </summary>
        <p>
          {t(
            "This is a sourced bulletin, not an automatically inferred local forecast.",
            "ဤသည် ရင်းမြစ်ပါသော ကြေညာချက်ဖြစ်ပြီး အလိုအလျောက် ခန့်မှန်းထားသော ဒေသသတိပေးချက် မဟုတ်ပါ။",
          )}
        </p>
        <p>
          {t("Confidence", "ယုံကြည်နိုင်မှု")}: {conf[alert.confidence]} ·{" "}
          {alert.confidenceReason[lang]}
        </p>
        <p>
          {t("Original severity", "မူရင်းအဆင့်")}:{" "}
          {alert.source.originalSeverity}
        </p>
        <h3>{t("Prepare next", "ဆက်လက်ပြင်ဆင်ရန်")}</h3>
        <ul>
          {alert.prepare.map((x, i) => (
            <li key={i}>{x[lang]}</li>
          ))}
        </ul>
      </details>
      <div className="source-row">
        <SourceLink href={alert.source.url}>{alert.source.name}</SourceLink>
        <span>
          {t("Issued", "ထုတ်ပြန်")} {dateLabel(alert.issuedAt, lang)}
        </span>
      </div>
    </article>
  );
}
