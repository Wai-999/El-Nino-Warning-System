import { ArrowRight, Globe2 } from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import { freshness } from "../risk/engine";
import { roniFresh, probabilitiesFresh } from "../data/climate";
import { number } from "../data/presentation";
import { Source } from "./Service";
export default function ClimateSummary() {
  const { t, lang, data, climate, now } = useApp(),
    b = data.enso,
    r = climate.roni?.points.at(-1),
    p = climate.probabilities;
  const current = b && freshness(b.issuedAt, b.validUntil, now) === "current";
  const statuses: Record<string, string> = {
    "El Niño Advisory": "အယ်လ်နီညို အသိပေးချက်",
    "La Niña Advisory": "လာနီညာ အသိပေးချက်",
    "El Niño Watch": "အယ်လ်နီညို စောင့်ကြည့်ချက်",
    "La Niña Watch": "လာနီညာ စောင့်ကြည့်ချက်",
    "Not Active": "ENSO အသိပေးချက် မရှိ",
  };
  return (
    <section className="climate-summary">
      <div className="row spread">
        <p className="eyebrow">
          {t("THE BIGGER PICTURE", "ရာသီဥတု နောက်ခံအခြေအနေ")}
        </p>
        <Globe2 size={23} strokeWidth={1.4} />
      </div>
      <h2>{t("Understanding ENSO", "ENSO ကို နားလည်ရန်")}</h2>
      <p>
        {t(
          "Pacific conditions influence seasonal patterns. Local weather can still be different.",
          "ပစိဖိတ်အခြေအနေက ရာသီအလိုက် သက်ရောက်နိုင်သည်။ ဒေသမိုးလေဝသမှာ ကွာခြားနိုင်ပါသည်။",
        )}
      </p>
      <div className="enso-status">
        <span
          className={`phase-mark ${b?.status.includes("La Niña") ? "cool" : "warm"}`}
          aria-hidden="true"
        />
        <div>
          <strong>
            {b
              ? lang === "en"
                ? b.status
                : statuses[b.status]
              : t("Assessment unavailable", "သုံးသပ်ချက် မရရှိပါ")}
          </strong>
          <small>
            {b
              ? `${current ? t("NOAA assessment", "NOAA သုံးသပ်ချက်") : t("Expired assessment", "သက်တမ်းကုန် သုံးသပ်ချက်")} · ${dateLabel(b.issuedAt, lang)}`
              : t("No bulletin loaded", "ကြေညာချက် မရရှိပါ")}
          </small>
        </div>
      </div>
      <div className="enso-reading">
        <div>
          <span>
            RONI <Source id="roni" />
          </span>
          <strong>
            {r
              ? `${r.anomaly > 0 ? "+" : ""}${number(r.anomaly, lang, 2)}°C`
              : "—"}
          </strong>
        </div>
        <small>
          {r
            ? `${r.season} ${r.year} · ${roniFresh(climate.roni, now) ? t("Provisional", "ပြင်ဆင်နိုင်သေး") : t("Delayed", "နောက်ကျဒေတာ")}`
            : t("Index unavailable", "ညွှန်းကိန်း မရရှိပါ")}
        </small>
      </div>
      {p && (
        <p className="probability-note">
          {t("First outlook season", "ပထမ မျှော်မှန်းကာလ")}{" "}
          <strong>{p.rows[0].season}</strong> · {t("El Niño", "အယ်လ်နီညို")}{" "}
          <strong>{number(p.rows[0].elNino, lang, 0)}%</strong>
          {!probabilitiesFresh(p, now) &&
            ` · ${t("Archived outlook", "မှတ်တမ်း မျှော်မှန်းချက်")}`}
          <br />
          <small>
            {t("Issue month", "ထုတ်ပြန်လ")} {p.issueMonth} ·{" "}
            {t(
              "Not a Myanmar rain forecast",
              "မြန်မာ မိုးခန့်မှန်းချက် မဟုတ်ပါ",
            )}
          </small>
        </p>
      )}
      <a className="text-link" href="#/climate">
        {t("Explore the climate outlook", "ရာသီဥတု မျှော်မှန်းချက် ကြည့်ရန်")}
        <ArrowRight size={16} />
      </a>
      <Source id="enso-status" />
    </section>
  );
}
