import type { Operational } from "../data/operational";
import type { Snapshot, Severity } from "../data/schema";
import type { Bilingual } from "../data/impactEvidence";
import { regionalRows, coverageKpi, sourceStatus } from "./intelligence";
import { activeAlerts, coverageCurrent, rank } from "./engine";
export function decisionKpis(op: Operational, data: Snapshot, now: number) {
  const rows = regionalRows(op, data, now),
    coverage = coverageKpi(rows),
    alerts = activeAlerts(data, now);
  const known = rows
    .filter((r) => r.level !== "unknown")
    .sort((a, b) => rank[b.level as Severity] - rank[a.level as Severity]);
  const periods =
    [
      op.weather ? `${op.weather.validAt} → ${op.weather.through}` : null,
      op.history ? `${op.history.start} → ${op.history.end}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || null;
  const updated =
    [op.weather?.fetchedAt, op.history?.fetchedAt]
      .filter((s): s is string => !!s)
      .sort()
      .at(-1) ?? null;
  const officialPeriod =
    [...new Set(alerts.map((a) => `${a.issuedAt} → ${a.validUntil}`))].join(
      " · ",
    ) || data.regionalCheckedAt;
  const officialUpdated =
    [data.regionalCheckedAt, ...alerts.map((a) => a.source.retrievedAt)]
      .filter((s): s is string => !!s)
      .sort()
      .at(-1) ?? null;
  const watchPeriod =
    [periods, officialPeriod].filter(Boolean).join(" · ") || null;
  const watchUpdated =
    [updated, officialUpdated]
      .filter((s): s is string => !!s)
      .sort()
      .at(-1) ?? null;
  const full =
    rows.every((r) => r.evidenceCount === 4) && coverageCurrent(data, now);
  return [
    {
      id: "concern",
      label: [
        "Highest assessed platform concern",
        "စစ်ဆေးပြီး စနစ်အဆင့် အမြင့်ဆုံး",
      ] as Bilingual,
      value: known[0]?.level ?? null,
      region: known[0]?.id,
      unit: ["ordinal screening level", "စစ်ဆေးအဆင့်"] as Bilingual,
      period: periods,
      updatedAt: updated,
      source: ["ECMWF IFS + ERA5", "ECMWF IFS + ERA5"] as Bilingual,
      href: "#/warnings",
      method: [
        "Maximum known independent hazard level across 15 regions; no ENSO multiplier. Partial evidence cannot produce an all-clear.",
        "ဒေသ ၁၅ ခု၏ သီးခြားဘေးအဆင့် အမြင့်ဆုံး။ ENSO မြှောက်ကိန်း မသုံး။ ဒေတာမစုံလျှင် ဘေးကင်းဟု မဆိုနိုင်။",
      ] as Bilingual,
      why: [
        "Prioritize the strongest available signal and inspect its location.",
        "ရရှိသော အပြင်းဆုံးညွှန်းကိန်းကို ဦးစားပေး၍ နေရာ စစ်ဆေးရန်။",
      ] as Bilingual,
    },
    {
      id: "watch",
      label: ["Regions to watch", "စောင့်ကြည့်ရန် ဒေသ"] as Bilingual,
      value:
        known.length || alerts.length
          ? `${full ? "" : "≥ "}${coverage.highPriority}/15`
          : null,
      unit: [
        "regions (not affected people)",
        "ဒေသ (ထိခိုက်လူဦးရေ မဟုတ်)",
      ] as Bilingual,
      period: watchPeriod,
      updatedAt: watchUpdated,
      source: [
        "ECMWF IFS + ERA5; connected official bulletins",
        "ECMWF IFS + ERA5၊ ချိတ်ဆက်ထားသော တရားဝင်ကြေညာချက်",
      ] as Bilingual,
      href: "#/warnings",
      method: [
        "Count of canonical regions with an active official bulletin or screening at watch or above. ≥ denotes incomplete inputs; unassessed regions may also need attention.",
        "သက်တမ်းရှိ တရားဝင်ကြေညာချက် သို့မဟုတ် စောင့်ကြည့်အဆင့်နှင့်အထက်ရှိ ဒေသအရေအတွက်။ ≥ သည် ဒေတာမစုံကြောင်းပြပြီး မစစ်ဆေးနိုင်သောဒေသလည်း သတိပြုရန် လိုနိုင်သည်။",
      ] as Bilingual,
      why: [
        "Direct attention to regions needing a closer evidence review.",
        "အထောက်အထား ပိုစစ်ဆေးရန်လိုသော ဒေသများကို အာရုံစိုက်ရန်။",
      ] as Bilingual,
    },
    {
      id: "official",
      label: [
        "Official active warnings",
        "သက်တမ်းရှိ တရားဝင်သတိပေးချက်",
      ] as Bilingual,
      value: coverageCurrent(data, now)
        ? String(alerts.length)
        : alerts.length
          ? `≥ ${alerts.length}`
          : null,
      unit: ["validated bulletins", "အတည်ပြု ကြေညာချက်"] as Bilingual,
      period: officialPeriod,
      updatedAt: officialUpdated,
      source: [
        "Myanmar DMH / validated official feed",
        "မြန်မာ မိုး/ဇလ / အတည်ပြုတရားဝင်ရင်းမြစ်",
      ] as Bilingual,
      href: "#/warnings",
      method: [
        "Count only active, geographically resolved official bulletins. Zero requires verified current coverage; otherwise the total is unavailable or a lower bound.",
        "သက်တမ်းရှိ၍ ဒေသကုဒ်အတည်ပြုသော တရားဝင်ကြေညာချက်သာ ရေတွက်သည်။ သုညဖော်ပြရန် လက်ရှိလွှမ်းခြုံမှု အတည်ပြုရမည်။ မရှိပါက မရရှိနိုင် သို့မဟုတ် အနည်းဆုံးအရေအတွက်သာ ဖြစ်သည်။",
      ] as Bilingual,
      why: [
        "Official instructions take priority over platform screening.",
        "တရားဝင်ညွှန်ကြားချက်ကို စနစ်စစ်ဆေးမှုထက် ဦးစားပေးရန်။",
      ] as Bilingual,
    },
    {
      id: "coverage",
      label: ["Data coverage", "ဒေတာ လွှမ်းခြုံမှု"] as Bilingual,
      value: `${coverage.available}/${coverage.expected}`,
      unit: [
        "usable / expected region-category cells",
        "အသုံးပြုနိုင် / မျှော်မှန်း ဒေသ-ကဏ္ဍကွက်",
      ] as Bilingual,
      period: new Date(now).toISOString(),
      updatedAt:
        sourceStatus(op, data, now)
          .map((s) => s.retrievedAt)
          .filter((s): s is string => !!s)
          .sort()
          .at(-1) ?? null,
      source: [
        "Source registry: monitoring + reviewed context",
        "ရင်းမြစ်စာရင်း — စောင့်ကြည့် + ပြန်စစ်ထားသော နောက်ခံ",
      ] as Bilingual,
      href: "#/data",
      method: [
        `${coverage.monitoring}/${coverage.monitoringExpected} monitoring + ${coverage.context}/${coverage.contextExpected} context cells. Current/aging count; stale/unavailable do not. Expected: 15 regions × 8 categories. Guidance is not disease surveillance.`,
        `စောင့်ကြည့် ${coverage.monitoring}/${coverage.monitoringExpected} + နောက်ခံ ${coverage.context}/${coverage.contextExpected} ကွက်။ လက်ရှိ/ဟောင်းလာသာ ရေတွက်၍ သက်တမ်းကျော်/မရရှိ မရေတွက်။ ဒေသ ၁၅ × ကဏ္ဍ ၈။ လမ်းညွှန်သည် ရောဂါစောင့်ကြည့်မှု မဟုတ်ပါ။`,
      ] as Bilingual,
      why: [
        "Expose blind spots before interpreting a low screening level.",
        "စစ်ဆေးအဆင့်နိမ့်ကို အဓိပ္ပာယ်မဖွင့်မီ ဒေတာကွက်လပ် သိရှိရန်။",
      ] as Bilingual,
    },
  ];
}
