import { useEffect, useState } from "react";
import { useApp, dateLabel } from "../app/context";
import {
  emptyHealthAdvisories,
  healthFeedFresh,
  recentHealthItems,
} from "../data/healthAdvisories";
import { loadHealthAdvisories } from "../data/loadHealthAdvisories";
import { mmt } from "../data/operational";
import { Source, Unavailable } from "./Service";
export default function OfficialHealth() {
  const { t, lang, now } = useApp(),
    [result, setResult] = useState({
      data: emptyHealthAdvisories,
      cached: false,
      error: false,
    });
  useEffect(() => {
    let active = true;
    void loadHealthAdvisories().then((x) => {
      if (active) setResult(x);
    });
    return () => {
      active = false;
    };
  }, []);
  const recent = recentHealthItems(result.data, now),
    fresh = healthFeedFresh(result.data, now),
    historical = result.data.items.filter((i) => !recent.includes(i));
  const cards = (items: typeof recent) =>
    items.map((i) => (
      <article key={i.id} className="official-health-item">
        <a href={i.url} target="_blank" rel="noreferrer" lang="en">
          {i.title}
        </a>
        <p>
          {t(
            "WHO · original English title · published",
            "WHO · မူရင်းအင်္ဂလိပ်ခေါင်းစဉ် · ထုတ်ပြန်ရက်",
          )}{" "}
          {dateLabel(i.issuedAt.slice(0, 10) + "T12:00:00+06:30", lang)}
        </p>
        <p className="small muted">
          {t(
            "Expiry, severity and township applicability are not supplied. Published bulletin, not an active local alert.",
            "သက်တမ်းကုန်ရက်၊ အဆင့်နှင့် မြို့နယ်အကျုံးဝင်မှု မပေးထားပါ။ ထုတ်ပြန်စာဖြစ်ပြီး လက်ရှိဒေသသတိပေးချက် မဟုတ်ပါ။",
          )}
        </p>
      </article>
    ));
  return (
    <section
      className="surface padded official-health"
      aria-labelledby="official-health-title"
    >
      <p className="eyebrow">
        {t(
          "OFFICIAL HEALTH PUBLICATIONS · SEPARATE SOURCE",
          "တရားဝင် ကျန်းမာရေးထုတ်ပြန်စာ · သီးခြားရင်းမြစ်",
        )}
      </p>
      <h2 id="official-health-title">
        {t(
          "WHO updates for Myanmar",
          "မြန်မာနိုင်ငံအတွက် WHO ထုတ်ပြန်ချက်များ",
        )}
      </h2>
      <p>
        {t(
          "This limited monitor checks WHO Disease Outbreak News country tags. It does not cover every national health advisory and cannot establish your local health status. Weather never generates these notices.",
          "ဤစနစ်သည် WHO Disease Outbreak News ၏ နိုင်ငံသတ်မှတ်ချက်ကိုသာ စစ်သည်။ နိုင်ငံလုံးဆိုင်ရာကျန်းမာရေးထုတ်ပြန်ချက်အားလုံး မလွှမ်းခြုံသကဲ့သို့ သင့်ဒေသကျန်းမာရေးအခြေအနေကို မသတ်မှတ်နိုင်ပါ။ မိုးလေဝသမှ ဤကြေညာချက်များ မဖန်တီးပါ။",
        )}
      </p>
      {(!fresh || result.cached || !result.data.ok) && (
        <Unavailable>
          {t(
            "Health source delayed, unavailable or previously cached. Original publication dates are retained; current local advisory status is unknown.",
            "ကျန်းမာရေးရင်းမြစ် နောက်ကျ၊ မရရှိ သို့မဟုတ် ယခင်သိမ်းထားသောဒေတာဖြစ်သည်။ မူရင်းထုတ်ပြန်ရက် ထိန်းထားပြီး လက်ရှိဒေသသတိပေးအခြေအနေ မသိပါ။",
          )}
        </Unavailable>
      )}
      {recent.length ? (
        cards(recent)
      ) : (
        <p className="health-empty">
          {result.data.retrievedAt
            ? t(
                "This source returned no Myanmar-tagged publications from the past 30 days. This does not mean there are no health risks or official advisories.",
                "ဤရင်းမြစ်မှ ပြီးခဲ့သည့် ရက် 30 အတွင်း မြန်မာနိုင်ငံသတ်မှတ် ထုတ်ပြန်စာ မရရှိပါ။ ကျန်းမာရေးအန္တရာယ် သို့မဟုတ် တရားဝင်ထုတ်ပြန်ချက် မရှိဟု မဆိုလိုပါ။",
              )
            : t(
                "The official publication source is unavailable. No current advisory status can be inferred.",
                "တရားဝင်ထုတ်ပြန်စာ ရင်းမြစ် မရရှိပါ။ လက်ရှိသတိပေးအခြေအနေကို မခန့်မှန်းနိုင်ပါ။",
              )}
        </p>
      )}
      {result.data.retrievedAt && (
        <p className="small muted">
          {t(
            "Last successful source check",
            "နောက်ဆုံး အောင်မြင်ရင်းမြစ်စစ်ချိန်",
          )}{" "}
          {mmt(result.data.retrievedAt, lang)} ·{" "}
          {t(
            "30 days is a display filter, not an expiry date.",
            "ရက် 30 သည် ပြသမှုစစ်ထုတ်ခြင်းသာဖြစ်ပြီး သက်တမ်းကုန်ရက် မဟုတ်ပါ။",
          )}
        </p>
      )}
      {historical.length > 0 && (
        <details className="inner-details">
          <summary>
            {t(
              "Historical WHO publications · not current advisories",
              "WHO သမိုင်းထုတ်ပြန်စာ · လက်ရှိသတိပေးချက် မဟုတ်",
            )}
          </summary>
          {cards(historical)}
        </details>
      )}
      <Source id="health-advisories" />
      <p>
        <a
          href="https://www.who.int/myanmar/emergencies"
          target="_blank"
          rel="noreferrer"
        >
          {t(
            "WHO Myanmar emergency information",
            "WHO မြန်မာနိုင်ငံ အရေးပေါ်သတင်းအချက်အလက်",
          )}{" "}
          ↗
        </a>
      </p>
    </section>
  );
}
