import { useState } from "react";
import { useApp } from "../app/context";
import { PageTitle, Notice, SourceLink, AlertCard } from "../components/shared";
import { RegionFilter, Concern } from "../components/Intelligence";
import {
  historicalRecords,
  filterRecords,
  recordHazards,
} from "../data/records";
import { sourceById } from "../data/sources";
import { regionName } from "../data/regions";
import { mmt } from "../data/operational";
const names = [
  ["ENSO", "ENSO"],
  ["Heat", "အပူ"],
  ["Drought", "မိုးခေါင်"],
  ["Rainfall extremes", "မိုးသည်းထန်မှု"],
  ["Flood", "ရေကြီး"],
  ["Agriculture", "စိုက်ပျိုးရေး"],
  ["Health", "ကျန်းမာရေး"],
  ["Fire / haze", "မီး / မီးခိုးမြူ"],
  ["Water", "ရေ"],
] as const;
export default function Records() {
  const { t, lang, archive, archiveError, archiveCached, now } = useApp();
  const [filter, setFilter] = useState({
    year: "all",
    region: "all",
    hazard: "all",
    phase: "all",
    evidence: "all",
  });
  const change = (key: keyof typeof filter, value: string) =>
    setFilter({ ...filter, [key]: value });
  const records = filterRecords(historicalRecords, filter);
  const years = [
    ...new Set(
      historicalRecords.flatMap((r) =>
        Array.from(
          {
            length: Number(r.end.slice(0, 4)) - Number(r.start.slice(0, 4)) + 1,
          },
          (_, i) => String(Number(r.start.slice(0, 4)) + i),
        ),
      ),
    ),
  ]
    .sort()
    .reverse();
  const archivedBulletins = archive.bulletins.filter(
    (a) =>
      Date.parse(a.validUntil) <= now &&
      (filter.region === "all" || a.regionId === filter.region) &&
      (filter.year === "all" || a.issuedAt.startsWith(filter.year)) &&
      (filter.hazard === "all" || a.type === filter.hazard) &&
      (filter.phase === "all" || filter.phase === "Not attributed") &&
      (filter.evidence === "all" || filter.evidence === "official-assessment"),
  );
  const available = new Set(historicalRecords.flatMap((r) => r.hazards));
  const snapshots = archive.snapshots
    .filter(
      (s) =>
        (filter.year === "all" || s.recordedAt.startsWith(filter.year)) &&
        (filter.evidence === "all" ||
          filter.evidence === "platform-snapshot") &&
        (filter.phase === "all" || s.enso?.includes(filter.phase)) &&
        (filter.hazard === "all" ||
          ["heat", "rainfall", "enso"].includes(filter.hazard)),
    )
    .slice()
    .reverse();
  return (
    <>
      <PageTitle
        eyebrow={t("EVIDENCE ARCHIVE", "အထောက်အထား မှတ်တမ်း")}
        title={t("Records & history", "ဖြစ်ရပ်နှင့် သမိုင်းမှတ်တမ်းများ")}
        description={t(
          "Past reported impacts and dated platform snapshots. Coverage gaps remain visible; this is not a complete disaster inventory.",
          "ယခင်တင်ပြသက်ရောက်မှုနှင့် ရက်စွဲပါ စနစ်မှတ်တမ်း။ လွှမ်းခြုံမှု ကွက်လပ်များကို ပြထားပြီး သဘာဝဘေးစာရင်း အပြည့်အစုံ မဟုတ်ပါ။",
        )}
      />
      <Notice>
        {t(
          "HISTORICAL EVIDENCE · Historical analog — not a deterministic forecast. Event timing does not establish ENSO causation.",
          "သမိုင်းအထောက်အထား · သမိုင်းဖြစ်ရပ်တူ နှိုင်းယှဉ်မှုသည် မဖြစ်မနေဖြစ်မည့် ခန့်မှန်းချက် မဟုတ်ပါ။ တစ်ချိန်တည်းဖြစ်ခြင်းက ENSO ကြောင့်ဟု မအတည်ပြုပါ။",
        )}
      </Notice>
      <div className="filter-row record-filters">
        <label>
          {t("Year", "နှစ်")}
          <select
            aria-label={t("Year", "နှစ်")}
            value={filter.year}
            onChange={(e) => change("year", e.target.value)}
          >
            <option value="all">{t("All years", "နှစ်အားလုံး")}</option>
            {[
              ...new Set([
                ...years,
                ...archive.snapshots.map((s) => s.recordedAt.slice(0, 4)),
              ]),
            ]
              .sort()
              .reverse()
              .map((y) => (
                <option key={y}>{y}</option>
              ))}
          </select>
        </label>
        <RegionFilter
          value={filter.region}
          onChange={(v) => change("region", v)}
          all
        />
        <label>
          {t("Hazard", "အန္တရာယ်")}
          <select
            aria-label={t("Hazard", "အန္တရာယ်")}
            value={filter.hazard}
            onChange={(e) => change("hazard", e.target.value)}
          >
            <option value="all">{t("All hazards", "အန္တရာယ်အားလုံး")}</option>
            {recordHazards.map((h, i) => (
              <option value={h} key={h}>
                {t(names[i][0], names[i][1])}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("ENSO phase", "ENSO အခြေအနေ")}
          <select
            aria-label={t("ENSO phase", "ENSO အခြေအနေ")}
            value={filter.phase}
            onChange={(e) => change("phase", e.target.value)}
          >
            <option value="all">{t("All phases", "အခြေအနေအားလုံး")}</option>
            {["El Niño", "La Niña", "Neutral", "Not attributed"].map((p, i) => (
              <option value={p} key={p}>
                {t(
                  p,
                  ["အယ်လ်နီညို", "လာနီညာ", "ကြားနေ", "ဆက်စပ်မှု မသတ်မှတ်"][i],
                )}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Evidence type", "အထောက်အထားအမျိုးအစား")}
          <select
            aria-label={t("Evidence type", "အထောက်အထားအမျိုးအစား")}
            value={filter.evidence}
            onChange={(e) => change("evidence", e.target.value)}
          >
            <option value="all">
              {t("All evidence", "အထောက်အထားအားလုံး")}
            </option>
            <option value="reported-impact">
              {t("Reported impact", "တင်ပြထားသော သက်ရောက်မှု")}
            </option>
            <option value="official-assessment">
              {t("Official assessment", "တရားဝင် သုံးသပ်ချက်")}
            </option>
            <option value="platform-snapshot">
              {t("Platform snapshot", "စနစ်သိမ်းမှတ်တမ်း")}
            </option>
          </select>
        </label>
        <button
          onClick={() =>
            setFilter({
              year: "all",
              region: "all",
              hazard: "all",
              phase: "all",
              evidence: "all",
            })
          }
        >
          {t("Reset filters", "စစ်ထုတ်မှု ပြန်စရန်")}
        </button>
      </div>
      <h2>
        {t("Reported historical impacts", "တင်ပြထားသော သမိုင်းသက်ရောက်မှု")}
      </h2>
      <p role="status">
        {records.length} {t("matching records", "ကိုက်ညီသောမှတ်တမ်း")}
      </p>
      {filter.region !== "all" && (
        <p>
          {t(
            "Region filters show only explicitly named areas; national reports are not assigned to every region.",
            "ဒေသစစ်ထုတ်မှုတွင် အတိအကျ ဖော်ပြဒေသသာ ပါသည်။ နိုင်ငံအဆင့်စာတမ်းကို ဒေသတိုင်းသို့ မသတ်မှတ်ပါ။",
          )}
        </p>
      )}
      <div className="record-grid">
        {records.map((r) => (
          <article className="panel padded historical-record" key={r.id}>
            <p className="eyebrow">
              {t("HISTORICAL EVIDENCE", "သမိုင်းအထောက်အထား")}
            </p>
            <h3>{t(...r.title)}</h3>
            <p className="meta">
              {r.start.slice(0, 7)} → {r.end.slice(0, 7)} ·{" "}
              {r.phase === "Not attributed"
                ? t("ENSO not attributed", "ENSO ဆက်စပ်မှု မသတ်မှတ်")
                : r.phase}
            </p>
            <p>
              {r.regionIds.length
                ? r.regionIds.map((id) => regionName(id, lang)).join(" · ")
                : t(
                    "Myanmar national; no region assignment",
                    "မြန်မာနိုင်ငံအဆင့်၊ ဒေသမသတ်မှတ်",
                  )}
            </p>
            <p>{t(...r.summary)}</p>
            <p>{t(...r.limitation)}</p>
            <SourceLink href={sourceById(r.sourceId).url}>
              {sourceById(r.sourceId).organization} ·{" "}
              {r.publishedPrecision === "month"
                ? r.publishedAt.slice(0, 7)
                : r.publishedAt}
            </SourceLink>
            <p className="meta">
              {t("Reviewed", "ပြန်စစ်ချိန်")}: {mmt(r.reviewedAt, lang)}
            </p>
          </article>
        ))}
      </div>
      {!records.length && (
        <Notice>
          {t(
            "No sourced record matches. This means missing archive evidence, not that no event occurred.",
            "ကိုက်ညီသော ရင်းမြစ်ပါမှတ်တမ်း မရှိပါ။ မှတ်တမ်းဒေတာ မရှိခြင်းဖြစ်၍ ဖြစ်ရပ်မဖြစ်ခဲ့ဟု မဆိုလိုပါ။",
          )}
        </Notice>
      )}
      <section className="panel padded">
        <h2>
          {t("Historical coverage gaps", "သမိုင်းလွှမ်းခြုံမှု ကွက်လပ်များ")}
        </h2>
        <p>
          {recordHazards
            .filter((h) => !available.has(h))
            .map((h) =>
              t(
                names[recordHazards.indexOf(h)][0],
                names[recordHazards.indexOf(h)][1],
              ),
            )
            .join(" · ")}
        </p>
        <p>
          {t(
            "No validated Myanmar event records for these categories are included yet. Drought declarations, heat records, health outbreaks and haze exposure require dedicated evidence; dry conditions are not relabeled as drought.",
            "ဤအမျိုးအစားများအတွက် အတည်ပြုမြန်မာဖြစ်ရပ်မှတ်တမ်း မပါသေးပါ။ မိုးခေါင်ကြေညာမှု၊ အပူစံချိန်၊ ရောဂါနှင့် မီးခိုးထိတွေ့မှုအတွက် သီးခြားအထောက်အထားလိုသည်။ ခြောက်သွေ့မှုကို မိုးခေါင်ဟု အမည်မပြောင်းပါ။",
          )}
        </p>
      </section>
      <section className="panel padded snapshot-history">
        <h2>
          {t("Validated platform snapshots", "အတည်ပြု စနစ်သိမ်းမှတ်တမ်းများ")}
        </h2>
        <p>
          {t(
            "Recorded screening states, not observed disasters. Up to 124 distinct snapshots are retained; full source versions remain in Git history. A missing entry is not a normal condition.",
            "မှတ်တမ်းတင်စစ်ဆေးအခြေအနေဖြစ်၍ တိုင်းတာသဘာဝဘေး မဟုတ်ပါ။ ကွဲပြားမှတ်တမ်း ၁၂၄ ခုအထိ သိမ်းသည်။ ရင်းမြစ်မူအပြည့်ကို Git သမိုင်းတွင် ထားသည်။ မှတ်တမ်းမရှိခြင်းသည် ပုံမှန်ဟု မဆိုလိုပါ။",
          )}
        </p>
        {(archiveError || archiveCached) && (
          <Notice>
            {t(
              "History is cached or unavailable; retain the original record times.",
              "မှတ်တမ်းသည် သိမ်းဒေတာဖြစ် သို့မဟုတ် မရရှိပါ။ မူရင်းရက်စွဲကို စစ်ဆေးပါ။",
            )}
          </Notice>
        )}
        {!snapshots.length && (
          <p>
            {t(
              "No matching validated snapshots.",
              "ကိုက်ညီသော အတည်ပြုမှတ်တမ်း မရှိပါ။",
            )}
          </p>
        )}
        {snapshots.map((s) => (
          <details key={s.recordedAt}>
            <summary>
              {mmt(s.recordedAt, lang)} · {s.coverage}/120
            </summary>
            <p>
              {t("Forecast period", "ခန့်မှန်းကာလ")}: {s.weatherPeriod ?? "—"}
              <br />
              {t("Reanalysis period", "ပြန်လည်ဆန်းစစ်ကာလ")}:{" "}
              {s.historyPeriod ?? "—"} · 1991–2020
            </p>
            <p>
              {s.enso ?? t("ENSO unavailable", "ENSO မရရှိ")} ·{" "}
              {s.ensoIssuedAt ?? "—"}
            </p>
            <ul>
              {s.regions
                .filter(
                  (r) => filter.region === "all" || r.id === filter.region,
                )
                .map((r) => (
                  <li key={r.id}>
                    {regionName(r.id, lang)} ·{" "}
                    <Concern
                      level={
                        filter.hazard === "heat"
                          ? r.heat
                          : filter.hazard === "rainfall"
                            ? r.rain
                            : r.level
                      }
                    />{" "}
                    · {r.evidenceCount}/4
                  </li>
                ))}
            </ul>
            <p className="meta">
              {s.method} ·{" "}
              {s.sourceIds.map((id) => sourceById(id).organization).join(" · ")}
            </p>
          </details>
        ))}
        <a href="https://github.com/Wai-999/El-Nino-Warning-System/commits/main/public/data/operational.json">
          {t(
            "Full source-version audit trail",
            "ရင်းမြစ်မူ ပြောင်းလဲမှုမှတ်တမ်း",
          )}
        </a>
      </section>
      {archivedBulletins.length > 0 && (
        <section>
          <h2>
            {t("Archived official bulletins", "တရားဝင်ကြေညာချက် မှတ်တမ်း")}
          </h2>
          {archivedBulletins.map((a) => (
            <div key={a.id}>
              <p>
                {t(
                  "HISTORICAL EVIDENCE — expired bulletin",
                  "သမိုင်းအထောက်အထား — သက်တမ်းကျော်ကြေညာချက်",
                )}
              </p>
              <AlertCard alert={a} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}
