import { lazy, Suspense, useState } from "react";
import { MapPin, ShieldQuestion, History } from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import { regions, regionName } from "../data/regions";
import {
  regionalLevel,
  activeAlerts,
  warningHistory,
  coverageCurrent,
} from "../risk/engine";
import {
  Level,
  PageTitle,
  Notice,
  SourceLink,
  AlertCard,
} from "../components/shared";
import { actions, sources } from "../data/content";
const MyanmarMap = lazy(() => import("../map/MyanmarMap"));
export function RegionSelector({
  value,
  onChange,
  all = false,
}: {
  value: string;
  onChange: (v: string) => void;
  all?: boolean;
}) {
  const { t, lang } = useApp();
  return (
    <label className="region-select">
      <MapPin size={18} />
      <span>{t("State / Region", "ပြည်နယ် / တိုင်းဒေသကြီး")}</span>
      <select
        aria-label={t("State / Region", "ပြည်နယ် / တိုင်းဒေသကြီး")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {all && <option value="all">{t("All areas", "ဒေသအားလုံး")}</option>}
        {regions.map((r) => (
          <option key={r[0]} value={r[0]}>
            {r[lang === "en" ? 1 : 2]}
          </option>
        ))}
      </select>
    </label>
  );
}
export function LocalSummary({
  selected,
  full = false,
}: {
  selected: string;
  full?: boolean;
}) {
  const { t, lang, data, now } = useApp();
  const alerts = activeAlerts(data, now).filter((a) => a.regionId === selected);
  return (
    <div className="local-summary">
      <div className="row">
        <MapPin size={20} />
        <p className="eyebrow">{t("LOCAL OUTLOOK", "ဒေသအခြေအနေ")}</p>
      </div>
      <h2>{regionName(selected, lang)}</h2>
      <Level level={regionalLevel(data, selected, now)} />
      <p>
        {t(
          "A Pacific El Niño advisory does not establish a warning for this area. Check local bulletins before making weather-sensitive decisions.",
          "ပစိဖိတ် အယ်လ်နီညိုအသိပေးချက်သည် ဤဒေသအတွက် သတိပေးချက် မဟုတ်ပါ။ ရာသီဥတုနှင့်ဆိုင်သော ဆုံးဖြတ်ချက်မချမီ ဒေသကြေညာချက်ကို စစ်ဆေးပါ။",
        )}
      </p>
      {selected === "MM-18" && (
        <Notice>
          {t(
            "Nay Pyi Taw is selectable, but this boundary dataset does not map it separately. No substitute polygon is shown.",
            "နေပြည်တော်ကို ရွေးနိုင်သော်လည်း ဤမြေပုံအချက်အလက်တွင် သီးခြားနယ်နိမိတ် မပါပါ။ အစားထိုးနယ်နိမိတ် မပြထားပါ။",
          )}
        </Notice>
      )}
      <dl className="indicator-list">
        {[
          t("Upcoming local risk", "လာမည့် ဒေသအန္တရာယ်"),
          t("Temperature trend", "အပူချိန်အလားအလာ"),
          t("Rainfall trend", "မိုးရေအလားအလာ"),
          t("Water availability", "ရေရရှိနိုင်မှု"),
        ].map((label) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{t("Unavailable", "မရရှိနိုင်")}</dd>
          </div>
        ))}
        <div>
          <dt>{t("Assessment confidence", "သုံးသပ်ချက် ယုံကြည်နိုင်မှု")}</dt>
          <dd>{t("Insufficient evidence", "အထောက်အထား မလုံလောက်")}</dd>
        </div>
        <div>
          <dt>{t("Last regional update", "နောက်ဆုံး ဒေသအချက်အလက်")}</dt>
          <dd>
            {data.regionalCheckedAt
              ? dateLabel(data.regionalCheckedAt, lang)
              : t("No verified update", "အတည်ပြုအချက်အလက် မရှိ")}
          </dd>
        </div>
      </dl>
      <h3>{t("Useful preparations", "အသုံးဝင်သော ပြင်ဆင်မှုများ")}</h3>
      <ul className="plain-actions">
        {actions.slice(0, full ? 3 : 2).map((a, i) => (
          <li key={i}>{t(...a)}</li>
        ))}
      </ul>
      <SourceLink href={sources.dmh}>
        {t("Check official DMH bulletins", "တရားဝင် မိုး/ဇလ ကြေညာချက်များ")}
      </SourceLink>
      {!full && (
        <a
          className="button secondary full-width"
          href={`#/region/${selected}`}
        >
          {t("Full area profile", "ဒေသအချက်အလက် အပြည့်အစုံ")}
        </a>
      )}
      {alerts.map((a) => (
        <AlertCard key={a.id} alert={a} />
      ))}
    </div>
  );
}
export function MapPage({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  const { t } = useApp();
  return (
    <>
      <PageTitle
        eyebrow={t("LOCATION & RISK", "ဒေသနှင့် အန္တရာယ်")}
        title={t("Your area, in context.", "သင့်ဒေသ အခြေအနေကို သိရှိပါ။")}
        description={t(
          "Select an area to see available evidence and what you can prepare.",
          "ရရှိနိုင်သော အချက်အလက်နှင့် ပြင်ဆင်ရန်အတွက် ဒေသရွေးပါ။",
        )}
      />
      <RegionSelector value={selected} onChange={onSelect} />
      <div className="full-map-grid">
        <section className="panel">
          <Suspense
            fallback={
              <p role="status">{t("Loading map…", "မြေပုံ ဖွင့်နေသည်…")}</p>
            }
          >
            <MyanmarMap selected={selected} onSelect={onSelect} />
          </Suspense>
        </section>
        <aside className="panel local-panel" aria-live="polite">
          <LocalSummary selected={selected} />
        </aside>
      </div>
      <Notice>
        {t(
          "Hatching means insufficient regional data, not low risk. District and township layers are unavailable because no validated data supports that precision.",
          "မျဉ်းစင်းများသည် ဒေသအချက်အလက် မလုံလောက်ခြင်းကို ဆိုလိုသည်။ အန္တရာယ်နည်းဟု မဆိုလိုပါ။ အတည်ပြုအချက်အလက် မရှိသဖြင့် ခရိုင်နှင့် မြို့နယ်အဆင့် မဖော်ပြပါ။",
        )}
      </Notice>
    </>
  );
}
export function RegionPage({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  const { t } = useApp();
  return (
    <>
      <PageTitle
        eyebrow={t("AREA PROFILE", "ဒေသအချက်အလက်")}
        title={t(
          "What does this mean for my area?",
          "သင့်ဒေသအတွက် ဘာကိုဆိုလိုသလဲ။",
        )}
        description={t(
          "Local evidence comes first. General guidance is clearly separated.",
          "ဒေသအချက်အလက်ကို ဦးစားပေးပြီး အထွေထွေလမ်းညွှန်ချက်ကို သီးခြားဖော်ပြထားသည်။",
        )}
      />
      <RegionSelector
        value={selected}
        onChange={(id) => {
          onSelect(id);
          location.hash = `/region/${id}`;
        }}
      />
      <div className="two-columns">
        <section className="panel padded">
          <LocalSummary selected={selected} full />
        </section>
        <section className="panel padded">
          <p className="eyebrow">
            {t(
              "GENERAL PREPAREDNESS · NOT A FORECAST",
              "အထွေထွေပြင်ဆင်ရေး · ခန့်မှန်းချက် မဟုတ်",
            )}
          </p>
          <h2>{t("Plan around your needs", "သင့်လိုအပ်ချက်အလိုက် စီစဉ်ပါ")}</h2>
          {[
            [
              t("Health", "ကျန်းမာရေး"),
              t(
                "Plan cooling, water, and help for people sensitive to heat.",
                "အပူဒဏ်ခံနိုင်ရည်နည်းသူများအတွက် အေးမြရာ၊ ရေနှင့် အကူအညီ စီစဉ်ပါ။",
              ),
            ],
            [
              t("Agriculture", "စိုက်ပျိုးရေး"),
              t(
                "Check crop-stage needs and local irrigation availability with an adviser.",
                "သီးနှံအဆင့်အလိုက် လိုအပ်ချက်နှင့် ဒေသဆည်ရေရရှိမှုကို ပညာရှင်နှင့် စစ်ဆေးပါ။",
              ),
            ],
            [
              t("Water", "ရေ"),
              t(
                "Identify safe supplies before an interruption occurs.",
                "ရေမပြတ်မီ သန့်ရှင်းသောရေ ရရှိနိုင်မည့်နေရာ သိထားပါ။",
              ),
            ],
          ].map(([title, desc]) => (
            <div className="divided" key={title}>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
          <a className="button primary" href="#/prepare">
            {t("Make a preparedness plan", "ကြိုတင်ပြင်ဆင်ရန်")}
          </a>
        </section>
      </div>
    </>
  );
}
export function WarningsPage() {
  const { t, lang, data, now } = useApp();
  const [area, setArea] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [history, setHistory] = useState(false);
  const list = (
    history ? warningHistory(data, now) : activeAlerts(data, now)
  ).filter(
    (a) =>
      (area === "all" || a.regionId === area) &&
      (severity === "all" || a.severity === severity),
  );
  return (
    <>
      <PageTitle
        eyebrow={t("VERIFIED BULLETINS", "အတည်ပြု ကြေညာချက်များ")}
        title={t("Warnings & updates", "သတိပေးချက်နှင့် နောက်ဆုံးသတင်း")}
        description={t(
          "Location, validity, source, and next steps together.",
          "ဒေသ၊ သက်တမ်း၊ ရင်းမြစ်နှင့် လုပ်ဆောင်ရန် အချက်များ",
        )}
      />
      <Notice>
        {t(
          "The regional warning feed is not connected. This page cannot confirm whether official warnings exist in your area. Consult Myanmar DMH and local authorities.",
          "ဒေသသတိပေးချက်စနစ်နှင့် မချိတ်ဆက်ရသေးပါ။ သင့်ဒေသတွင် တရားဝင်သတိပေးချက်ရှိမရှိ ဤစာမျက်နှာက အတည်မပြုနိုင်ပါ။ မိုး/ဇလနှင့် ဒေသတာဝန်ရှိသူများ၏ သတင်းကို စစ်ဆေးပါ။",
        )}
      </Notice>
      <div className="filter-row">
        <RegionSelector value={area} onChange={setArea} all />
        <label>
          {t("Severity", "အဆင့်")}
          <select
            aria-label={t("Severity", "အဆင့်")}
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="all">{t("All levels", "အဆင့်အားလုံး")}</option>
            {["advisory", "watch", "warning", "emergency"].map((s) => (
              <option key={s} value={s}>
                {
                  {
                    advisory: t("Advisory", "အသိပေးချက်"),
                    watch: t("Watch", "စောင့်ကြည့်ရန်"),
                    warning: t("Warning", "သတိပေးချက်"),
                    emergency: t("Emergency", "အရေးပေါ်"),
                  }[s]
                }
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="segmented">
        <button aria-pressed={!history} onClick={() => setHistory(false)}>
          {t("Active bulletins", "သက်တမ်းရှိ ကြေညာချက်များ")}
        </button>
        <button aria-pressed={history} onClick={() => setHistory(true)}>
          <History size={16} />
          {t("History", "မှတ်တမ်း")}
        </button>
      </div>
      {!list.length ? (
        <section className="panel empty-state">
          <ShieldQuestion size={40} />
          <h2>
            {history
              ? t("No archived bulletins", "ကြေညာချက်မှတ်တမ်း မရှိသေး")
              : coverageCurrent(data, now)
                ? t(
                    "No matching active warnings",
                    "ကိုက်ညီသော လက်ရှိသတိပေးချက် မရှိ",
                  )
                : t(
                    "Regional warning status is unavailable",
                    "ဒေသသတိပေးအခြေအနေ မရရှိနိုင်သေး",
                  )}
          </h2>
          <p>
            {history
              ? t(
                  "History begins when verified regional bulletins are added. No alert history has been invented.",
                  "အတည်ပြု ဒေသကြေညာချက်များ ထည့်သွင်းချိန်မှ မှတ်တမ်းစတင်မည်။ မှတ်တမ်းကို ဖန်တီးမထားပါ။",
                )
              : t(
                  "An empty list is not an all-clear. You can still check official information and prepare for heat or water interruptions.",
                  "စာရင်းဗလာဖြစ်ခြင်းသည် အန္တရာယ်ကင်းဟု မဆိုလိုပါ။ တရားဝင်သတင်း စစ်ဆေးခြင်း၊ အပူဒဏ်နှင့် ရေပြတ်မှုအတွက် ပြင်ဆင်ခြင်းတို့ကို လုပ်နိုင်ပါသည်။",
                )}
          </p>
          <SourceLink href={sources.dmh}>
            {t(
              "Official Myanmar weather information",
              "မြန်မာနိုင်ငံ တရားဝင် မိုးလေဝသသတင်း",
            )}
          </SourceLink>
          <a className="button secondary" href="#/prepare">
            {t("Review my preparations", "ပြင်ဆင်မှုများ စစ်ဆေးရန်")}
          </a>
        </section>
      ) : (
        <div className="warning-list">
          {list.map((a) => (
            <div key={a.id}>
              {history && (
                <p className="history-label">
                  {t(
                    "ARCHIVED · NOT AN ACTIVE WARNING",
                    "မှတ်တမ်း · လက်ရှိသတိပေးချက် မဟုတ်",
                  )}{" "}
                  · {a.change[lang]}
                </p>
              )}
              <AlertCard alert={a} />
            </div>
          ))}
        </div>
      )}
      <details className="panel padded">
        <summary>
          {t(
            "What do the warning levels mean?",
            "သတိပေးအဆင့်များက ဘာကိုဆိုလိုသလဲ။",
          )}
        </summary>
        <div className="levels">
          {(
            ["normal", "advisory", "watch", "warning", "emergency"] as const
          ).map((l, i) => (
            <div key={l}>
              <Level level={l} />
              <p>
                {
                  [
                    t(
                      "Verified complete coverage, with no active elevated warning.",
                      "အချက်အလက် ပြည့်စုံစွာစစ်ဆေးထားပြီး သတိပေးချက် မြင့်တက်မှုမရှိ။",
                    ),
                    t(
                      "Read the advice and review basic preparations.",
                      "အကြံပြုချက်ဖတ်၍ အခြေခံပြင်ဆင်မှု စစ်ဆေးပါ။",
                    ),
                    t(
                      "Conditions may develop. Prepare and follow updates.",
                      "အခြေအနေ ဖြစ်ပေါ်လာနိုင်သဖြင့် ပြင်ဆင်၍ သတင်းစောင့်ကြည့်ပါ။",
                    ),
                    t(
                      "A hazard is expected or occurring. Follow the source’s instructions.",
                      "အန္တရာယ် ဖြစ်ပေါ်နိုင် သို့မဟုတ် ဖြစ်နေသဖြင့် မူရင်းညွှန်ကြားချက်ကို လိုက်နာပါ။",
                    ),
                    t(
                      "An issuing authority describes an emergency. Follow its urgent instructions.",
                      "ထုတ်ပြန်သူက အရေးပေါ်ဟု သတ်မှတ်ထားသဖြင့် အရေးပေါ်ညွှန်ကြားချက်ကို လိုက်နာပါ။",
                    ),
                  ][i]
                }
              </p>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
