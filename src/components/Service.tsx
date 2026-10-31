import { useApp } from "../app/context";
import { mmt, weatherFresh } from "../data/operational";
import { number, condition, alertState } from "../data/presentation";
import { regionName } from "../data/regions";
import type { Alert } from "../data/schema";
import {
  ArrowUpRight,
  CloudSun,
  Droplets,
  Wind,
  Info,
  Clock3,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import type { ReactNode } from "react";
import WeatherScene from "./WeatherScene";

export function Source({ id }: { id: string }) {
  const { t } = useApp();
  return (
    <a className="metric-source" href={`#/sources?indicator=${id}`}>
      {t("Source & method", "ရင်းမြစ်နှင့် နည်းလမ်း")}{" "}
      <ArrowUpRight size={12} />
    </a>
  );
}
export function Unavailable({ children }: { children: ReactNode }) {
  return (
    <div className="unavailable">
      <Info size={18} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
export function SectionHeading({
  title,
  link,
  href,
}: {
  title: string;
  link?: string;
  href?: string;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {href && (
        <a href={href}>
          {link}
          <ArrowRight size={16} />
        </a>
      )}
    </div>
  );
}
export function Stale({ stamp }: { stamp?: string }) {
  const { t, lang } = useApp();
  return (
    <span className="status-pill delayed">
      <Clock3 size={13} />
      {t("Delayed snapshot", "နောက်ကျနေသောဒေတာ")}
      {stamp && ` · ${mmt(stamp, lang)}`}
    </span>
  );
}
export function WeatherSymbol({
  code = 0,
  size = 44,
}: {
  code?: number;
  size?: number;
}) {
  return code >= 51 ? (
    <Droplets size={size} strokeWidth={1.4} aria-hidden="true" />
  ) : (
    <CloudSun size={size} strokeWidth={1.4} aria-hidden="true" />
  );
}
export function WeatherSummary({ compact = false }: { compact?: boolean }) {
  const { operational: op, selected, t, lang, now } = useApp();
  const w = op.weather?.regions.find((r) => r.id === selected),
    fresh = weatherFresh(op.weather, now);
  return (
    <section
      className={`weather-summary ${compact ? "compact-weather" : ""}`}
      aria-label={t("Weather summary", "မိုးလေဝသ အကျဉ်းချုပ်")}
    >
      {w && <WeatherScene code={w.now.code} />}
      <div className="weather-main">
        <div>
          <p className="eyebrow">
            {t("YOUR LOCAL OUTLOOK", "သင့်ဒေသ မိုးလေဝသ")}
          </p>
          <h2>{regionName(selected, lang)}</h2>
          <p className="weather-condition">
            {w
              ? t(...condition(w.now.code))
              : t("Weather unavailable", "မိုးလေဝသဒေတာ မရရှိပါ")}
          </p>
        </div>
        <WeatherSymbol code={w?.now.code} size={72} />
      </div>
      {w && op.weather ? (
        <>
          <div className="temperature-line">
            <span className="big-temperature">
              {number(w.now.temperature, lang, 0)}
              <span>°C</span>
            </span>
            <div>
              <p>
                {t("Feels like", "ခံစားရသည့်အပူချိန်")}{" "}
                <strong>{number(w.now.apparent, lang, 0)}°</strong>
              </p>
              <p>
                {t("High", "အမြင့်ဆုံး")} {number(w.days[0].max, lang, 0)}°{" "}
                <span className="divider">/</span> {t("Low", "အနိမ့်ဆုံး")}{" "}
                {number(w.days[0].min, lang, 0)}°
              </p>
            </div>
          </div>
          <div className="weather-stats">
            <div>
              <Droplets size={17} />
              <span>{t("Rain · next 24h", "လာမည့် ၂၄ နာရီ မိုးရေ")}</span>
              <strong>
                {number(w.next24.rain, lang)} <small>mm</small>
              </strong>
            </div>
            <div>
              <Wind size={17} />
              <span>{t("Wind", "လေတိုက်နှုန်း")}</span>
              <strong>
                {number(w.now.wind, lang)} <small>km/h</small>
              </strong>
            </div>
            <div>
              <Droplets size={17} />
              <span>{t("Humidity", "စိုထိုင်းဆ")}</span>
              <strong>
                {number(w.now.humidity, lang, 0)}
                <small>%</small>
              </strong>
            </div>
          </div>
          <div className="weather-meta">
            <span className={`status-pill ${fresh ? "modelled" : "delayed"}`}>
              {fresh
                ? t("Model estimate", "မော်ဒယ်ခန့်မှန်းတန်ဖိုး")
                : t("Delayed · not current", "နောက်ကျဒေတာ · လက်ရှိမဟုတ်")}
            </span>
            <span>{mmt(op.weather.validAt, lang)}</span>
          </div>
        </>
      ) : (
        <Unavailable>
          {t(
            "The forecast source is unavailable. Try refreshing later; no sample readings are substituted.",
            "ခန့်မှန်းဒေတာရင်းမြစ် မရရှိပါ။ နောက်မှ ပြန်ယူပါ။ အစားထိုး စိတ်ကူးယဉ်ဒေတာ မပြသပါ။",
          )}
        </Unavailable>
      )}
      <div className="source-footer">
        <Source id="temperature" />
        <span>
          {t("Regional samples · 0.25° grid", "ဒေသနမူနာများ · ၀.၂၅° ဇယားကွက်")}
        </span>
      </div>
    </section>
  );
}
export function OfficialNotice({ alert }: { alert: Alert }) {
  const { lang, t, now } = useApp();
  const state = alertState(alert, now);
  return (
    <article className={`official-notice ${state}`}>
      <div className="row spread">
        <span className="eyebrow">
          <ShieldAlert size={16} />
          {t("OFFICIAL WARNING", "တရားဝင် သတိပေးချက်")}
        </span>
        <span className="status-pill">
          {state === "active"
            ? t("Active", "သက်တမ်းရှိ")
            : state === "expired"
              ? t("Expired", "သက်တမ်းကုန်")
              : t("Unverified", "အတည်မပြုနိုင်")}
        </span>
      </div>
      <h2>{alert.title[lang]}</h2>
      <p>{alert.description[lang]}</p>
      <dl className="facts">
        <div>
          <dt>{t("Issuer / severity", "ထုတ်ပြန်သူ / အဆင့်")}</dt>
          <dd>
            {alert.source.name} · {alert.source.originalSeverity}
          </dd>
        </div>
        <div>
          <dt>{t("Area", "ဒေသ")}</dt>
          <dd>{alert.affected[lang]}</dd>
        </div>
        <div>
          <dt>{t("Issuer urgency", "ထုတ်ပြန်သူ၏ အရေးတကြီးအဆင့်")}</dt>
          <dd>
            {t(
              "Not supplied in this validated record; not inferred from weather or ENSO.",
              "ဤအတည်ပြုမှတ်တမ်းတွင် မပေးထားပါ။ မိုးလေဝသ သို့မဟုတ် ENSO မှ မခန့်မှန်းပါ။",
            )}
          </dd>
        </div>
        <div>
          <dt>{t("Published", "ထုတ်ပြန်ရက်")}</dt>
          <dd>{mmt(alert.issuedAt, lang)}</dd>
        </div>
        <div>
          <dt>{t("Valid period", "သက်တမ်းကာလ")}</dt>
          <dd>
            {mmt(alert.validFrom, lang)} → {mmt(alert.validUntil, lang)}
          </dd>
        </div>
        <div>
          <dt>{t("Retrieved", "ရယူချိန်")}</dt>
          <dd>{mmt(alert.source.retrievedAt, lang)}</dd>
        </div>
      </dl>
      <p>{alert.confidenceReason[lang]}</p>
      <ol>
        {alert.actions.map((a, i) => (
          <li key={i}>{a[lang]}</li>
        ))}
      </ol>
      <a href={alert.source.url} target="_blank" rel="noreferrer">
        {t("Original bulletin", "မူရင်းကြေညာချက်")} <ArrowUpRight size={14} />
      </a>
      <Source id="official-warning" />
    </article>
  );
}
