import { useApp, dateLabel } from "../app/context";
import { SourceLink } from "./shared";
import { freshness } from "../risk/engine";
import { value } from "./Operational";
import { mmt, DAY } from "../data/operational";
export function EnsoPanel() {
  const { t, lang, data, operational: op, now, lowData } = useApp();
  const enso = data.enso;
  const statusLabels = {
    "El Niño Advisory": "အယ်လ်နီညို ဖြစ်ပေါ်နေမှု အသိပေးချက်",
    "El Niño Watch": "အယ်လ်နီညို စောင့်ကြည့်ရန်",
    "La Niña Advisory": "လာနီညာ ဖြစ်ပေါ်နေမှု အသိပေးချက်",
    "La Niña Watch": "လာနီညာ စောင့်ကြည့်ရန်",
    "Not Active": "လက်ရှိ ENSO အသိပေးချက် မရှိ",
  };
  const nino = op.nino,
    latest = nino?.months.at(-1),
    prior = nino?.months.at(-2);
  return (
    <section className="panel padded enso-v2">
      <p className="eyebrow">
        {t(
          "OFFICIAL ENSO ASSESSMENT · TROPICAL PACIFIC",
          "တရားဝင် ENSO သုံးသပ်ချက် · အပူပိုင်းပစိဖိတ်",
        )}
      </p>
      <h2>
        {enso
          ? t(enso.status, statusLabels[enso.status])
          : t("ENSO assessment unavailable", "ENSO သုံးသပ်ချက် မရရှိနိုင်")}
      </h2>
      {enso && (
        <>
          <p className="meta">
            {t("Issued", "ထုတ်ပြန်")}: {dateLabel(enso.issuedAt, lang)} ·{" "}
            {freshness(enso.issuedAt, enso.validUntil, now) === "current"
              ? t("Current assessment", "သက်တမ်းရှိ သုံးသပ်ချက်")
              : t("Stale assessment", "သက်တမ်းကျော် သုံးသပ်ချက်")}{" "}
            · {t("Next discussion", "နောက်ထုတ်ပြန်ရက်")}:{" "}
            {dateLabel(enso.validUntil.slice(0, 10) + "T00:00:00+06:30", lang)}
          </p>
          {enso.outlook && (
            <p>
              {t("Seasonal strength outlook", "ရာသီအလိုက် ပြင်းအားအလားအလာ")}:{" "}
              {enso.outlook.greaterThan ? " > " : ""}
              {enso.outlook.percent}% ·{" "}
              {t("Very strong El Niño", "အလွန်အားကောင်းသော အယ်လ်နီညို")} ·{" "}
              {enso.outlook.period}
              <br />
              <small>
                {t(
                  "Probability of Pacific event strength, not a Myanmar weather probability.",
                  "ပစိဖိတ်ဖြစ်ရပ် ပြင်းအားဖြစ်နိုင်နှုန်းဖြစ်ပြီး မြန်မာမိုးလေဝသ ဖြစ်နိုင်နှုန်း မဟုတ်ပါ။",
                )}
              </small>
            </p>
          )}
          <SourceLink href={enso.source.url}>
            NOAA CPC ·{" "}
            {t(
              "Read persistence and outlook",
              "ဆက်လက်တည်ရှိမှုနှင့် အလားအလာ ဖတ်ရန်",
            )}
          </SourceLink>
        </>
      )}
      {latest && (
        <details>
          <summary>
            {t(
              "Niño 3.4 monthly SST anomaly",
              "Niño 3.4 လစဉ် ပင်လယ်မျက်နှာပြင်အပူချိန်ကွာဟချက်",
            )}{" "}
            · {value(latest.anomaly, "°C", true)}
          </summary>
          <p>
            {latest.month} ·{" "}
            {prior && value(latest.anomaly - prior.anomaly, "°C", true)}{" "}
            {t("change from previous month", "ယခင်လနှင့် ကွာခြားမှု")} ·{" "}
            {now - Date.parse(latest.month + "-01") > 100 * DAY
              ? t("Stale", "သက်တမ်းကျော်")
              : t("Monthly historical index", "လစဉ်သမိုင်းညွှန်းကိန်း")}
          </p>
          {!lowData && (
            <p>
              {nino!.months
                .map((m) => `${m.month}: ${value(m.anomaly, "°C", true)}`)
                .join(" · ")}
            </p>
          )}
          <p>
            {t(
              "SST anomaly series, not RONI or ONI; different indices must not be interchanged.",
              "ပင်လယ်မျက်နှာပြင်အပူချိန်ကွာဟချက် ဖြစ်သည်။ RONI၊ ONI တို့နှင့် အစားထိုးမသုံးရပါ။",
            )}
          </p>
          <SourceLink href={nino!.source}>NOAA CPC SST indices</SourceLink>
          <p className="meta">
            {t("Retrieved", "ရယူချိန်")}: {mmt(nino!.fetchedAt, lang)}
          </p>
        </details>
      )}
      <p>
        {t(
          "El Niño can shift the likelihood of heat and rainfall patterns. Today’s local weather needs its own evidence.",
          "အယ်လ်နီညိုသည် အပူနှင့် မိုးရေဖြစ်နိုင်ခြေကို ပြောင်းလဲစေနိုင်သည်။ ယနေ့ဒေသမိုးလေဝသအတွက် ဒေသအထောက်အထားကို သီးခြားကြည့်ရမည်။",
        )}
      </p>
    </section>
  );
}
export function Updates() {
  const { t, lang, data, now } = useApp();
  const e = data.enso;
  return (
    <section className="panel padded">
      <p className="eyebrow">
        {t("LATEST AUTHORITATIVE UPDATE", "နောက်ဆုံးရ တရားဝင်ရင်းမြစ် သတင်း")}
      </p>
      {e ? (
        <article>
          <span className="badge">
            {t("INFORMATIONAL UPDATE", "အချက်အလက် သတင်း")}
          </span>
          <h3>
            NOAA CPC · {t("ENSO diagnostic discussion", "ENSO သုံးသပ်ချက်")}
          </h3>
          <p>
            {e.status} ·{" "}
            {t(
              "Tropical Pacific / climate context",
              "အပူပိုင်းပစိဖိတ် / ရာသီဥတုနောက်ခံ",
            )}
          </p>
          <p>
            {t(
              "The latest verified CPC bulletin sets the official ENSO alert state. Read the original for the seasonal outlook and expected persistence.",
              "နောက်ဆုံးအတည်ပြု CPC ကြေညာချက်က တရားဝင် ENSO အခြေအနေကို ဖော်ပြသည်။ ရာသီအလားအလာနှင့် ဆက်လက်တည်ရှိမှုအတွက် မူရင်းကို ဖတ်ပါ။",
            )}
          </p>
          <p className="meta">
            {t("Published", "ထုတ်ပြန်")}: {dateLabel(e.issuedAt, lang)} ·{" "}
            {freshness(e.issuedAt, e.validUntil, now) === "current"
              ? t("Current", "သက်တမ်းရှိ")
              : t("Stale", "သက်တမ်းကျော်")}
          </p>
          <SourceLink href={e.source.url}>
            NOAA Climate Prediction Center
          </SourceLink>
        </article>
      ) : (
        <p>
          {t("No verified update available.", "အတည်ပြုသတင်း မရရှိနိုင်ပါ။")}
        </p>
      )}
      <p className="meta">
        {t(
          "Allowlist: NOAA CPC. This feed does not provide complete Myanmar emergency coverage.",
          "ခွင့်ပြုရင်းမြစ် — NOAA CPC။ ဤသတင်းစာရင်းသည် မြန်မာနိုင်ငံ အရေးပေါ်သတင်းအားလုံးကို မဖော်ပြနိုင်ပါ။",
        )}
      </p>
    </section>
  );
}
