import { useApp } from "../app/context";
import { compareSummaries } from "../data/archive";
import { mmt } from "../data/operational";
import { regionName } from "../data/regions";
import { hazardNames } from "../risk/signals";
import { Concern } from "./Intelligence";
import { Notice } from "./shared";
export function Changes() {
  const { t, lang, archive, archiveError, archiveCached } = useApp();
  const [previous, current] = archive.snapshots.slice(-2),
    changes = previous && current ? compareSummaries(previous, current) : null;
  return (
    <section className="panel padded changes-panel">
      <h2>{t("What changed?", "ဘာတွေ ပြောင်းလဲသလဲ။")}</h2>
      {archiveError && (
        <Notice>
          {t(
            "Latest history could not be loaded. Any retained comparison keeps its original timestamps.",
            "နောက်ဆုံးမှတ်တမ်း မရယူနိုင်ပါ။ သိမ်းထားသော နှိုင်းယှဉ်မှု မူရင်းရက်စွဲ မပြောင်းပါ။",
          )}
        </Notice>
      )}
      {archiveCached && (
        <p>{t("Saved comparison", "သိမ်းထားသော နှိုင်းယှဉ်မှု")}</p>
      )}
      {!changes ? (
        <p>
          {t(
            "A comparison requires two distinct validated snapshots. No earlier change is assumed when history is missing or only a baseline is available.",
            "နှိုင်းယှဉ်ရန် ကွဲပြားသော အတည်ပြုမှတ်တမ်း နှစ်ခုလိုသည်။ သမိုင်းမရှိ သို့မဟုတ် အခြေခံတစ်ခုသာ ရှိပါက ယခင်ပြောင်းလဲမှုကို မခန့်မှန်းပါ။",
          )}
        </p>
      ) : (
        <>
          <p className="meta">
            {mmt(previous.recordedAt, lang)} → {mmt(current.recordedAt, lang)}
          </p>
          <p>
            {t(
              "Changes between recorded screening snapshots, not an observed trend. Forecast windows may differ; missing/restored data are separate from hazard changes.",
              "သိမ်းထားသော စစ်ဆေးမှတ်တမ်းပြောင်းလဲမှုဖြစ်ပြီး တိုင်းတာထားသော ရေရှည်လမ်းကြောင်း မဟုတ်ပါ။ ခန့်မှန်းကာလ ကွာနိုင်သည်။ ဒေတာပျောက်/ပြန်ရခြင်းကို အန္တရာယ်ပြောင်းလဲမှုနှင့် သီးခြားထားသည်။",
            )}
          </p>
          <p>
            {changes.ensoChanged
              ? t(
                  "ENSO bulletin or status changed.",
                  "ENSO ကြေညာချက် သို့မဟုတ် အခြေအနေ ပြောင်းလဲသည်။",
                )
              : t(
                  "ENSO bulletin and status unchanged.",
                  "ENSO ကြေညာချက်နှင့် အခြေအနေ မပြောင်းပါ။",
                )}{" "}
            {changes.newOfficial.length}{" "}
            {t("new official bulletins", "တရားဝင်ကြေညာချက်အသစ်")} ·{" "}
            {changes.endedOfficial.length}{" "}
            {t(
              "no longer active in this snapshot",
              "ဤမှတ်တမ်းတွင် သက်တမ်းမရှိတော့",
            )}
          </p>
          {changes.changes.length ? (
            <ul className="change-list">
              {changes.changes.slice(0, 12).map((c) => (
                <li key={c.id + c.hazard}>
                  <a href={`#/region/${c.id}`}>{regionName(c.id, lang)}</a> ·{" "}
                  {t(...hazardNames[c.hazard])}
                  <div>
                    <Concern level={c.before} /> → <Concern level={c.after} />
                  </div>
                  <small>
                    {t(
                      c.direction === "data-lost"
                        ? "Data became unavailable"
                        : c.direction === "data-restored"
                          ? "Data restored"
                          : c.direction === "increased"
                            ? "Screening level increased"
                            : "Screening level decreased",
                      c.direction === "data-lost"
                        ? "ဒေတာ မရရှိတော့"
                        : c.direction === "data-restored"
                          ? "ဒေတာ ပြန်ရရှိ"
                          : c.direction === "increased"
                            ? "စစ်ဆေးအဆင့် မြင့်တက်"
                            : "စစ်ဆေးအဆင့် လျော့နည်း",
                    )}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              {t(
                "No independent hazard thresholds changed.",
                "သီးခြားအန္တရာယ် သတ်မှတ်အဆင့် မပြောင်းပါ။",
              )}
            </p>
          )}
          {changes.changes.length > 12 && (
            <p>
              {changes.changes.length}{" "}
              {t(
                "total changes; see snapshots for all region levels.",
                "စုစုပေါင်းပြောင်းလဲမှု — ဒေသအားလုံးအတွက် သိမ်းမှတ်တမ်းကြည့်ပါ။",
              )}
            </p>
          )}
        </>
      )}
      <a href="#/records">
        {t("Inspect dated snapshots", "ရက်စွဲပါ သိမ်းမှတ်တမ်းများ")}
      </a>
    </section>
  );
}
