import {
  weatherState,
  historyState,
  type Operational,
} from "../data/operational";
import { usable } from "./intelligence";
import type { Bilingual } from "../data/impactEvidence";
export function nationalImpactMetrics(op: Operational, now: number) {
  const forecast = weatherState(op.weather, now),
    observed = historyState(op.history, now);
  const definitions = [
    {
      id: "heat",
      kind: "forecast",
      state: forecast,
      label: [
        "Next-day regional maximum temperature",
        "လာမည့်နေ့ ဒေသအမြင့်ဆုံးအပူချိန်",
      ] as Bilingual,
      values: op.weather?.regions.map((r) => r.next24.max) ?? [],
      unit: "°C",
      why: [
        "Plan cool breaks; these regional averages can hide local extremes.",
        "အေးသောနေရာတွင် နားချိန်စီစဉ်ပါ။ ဒေသပျမ်းမျှတွင် ဒေသတွင်းအစွန်းရောက်မှု မပေါ်နိုင်ပါ။",
      ] as Bilingual,
    },
    {
      id: "rain",
      kind: "forecast",
      state: forecast,
      label: [
        "Next-day regional rainfall total",
        "လာမည့်နေ့ ဒေသမိုးရေစုစုပေါင်း",
      ] as Bilingual,
      values: op.weather?.regions.map((r) => r.next24.rain) ?? [],
      unit: " mm",
      why: [
        "Monitor wet-weather travel and drainage; rainfall is not flood probability.",
        "မိုးရွာချိန် ခရီးသွားနှင့် ရေနုတ်မြောင်း စောင့်ကြည့်ပါ။ မိုးရေသည် ရေကြီးဖြစ်နိုင်နှုန်း မဟုတ်ပါ။",
      ] as Bilingual,
    },
    {
      id: "anomaly",
      kind: "observed",
      state: observed,
      label: [
        "30-day temperature anomaly",
        "ရက် ၃၀ အပူချိန်ကွာဟချက်",
      ] as Bilingual,
      values: op.history?.regions.map((r) => r.temperatureAnomaly) ?? [],
      unit: "°C",
      why: [
        "Shows recent departure from the local seasonal baseline, not future heat.",
        "ဒေသရာသီပုံမှန်မှ မကြာသေးမီက ကွာဟမှုကို ပြပြီး အနာဂတ်အပူ မဟုတ်ပါ။",
      ] as Bilingual,
    },
    {
      id: "dry",
      kind: "observed",
      state: observed,
      label: [
        "Trailing dry-day count",
        "ဆက်တိုက် မိုးပြတ်ရက်အရေအတွက်",
      ] as Bilingual,
      values: op.history?.regions.map((r) => r.dryDays) ?? [],
      unit: " days",
      why: [
        "Days below 1 mm; capped at 30 (30 means at least 30). A planning proxy, not a drought declaration.",
        "1 mm အောက်ရက်များ၊ အများဆုံး ၃၀ (၃၀ ဆိုလျှင် အနည်းဆုံး ရက် ၃၀)။ စီမံရန်ညွှန်းကိန်း၊ မိုးခေါင်ကြေညာချက် မဟုတ်ပါ။",
      ] as Bilingual,
    },
  ];
  return definitions.map((d) => {
    const valid = usable(d.state) ? d.values.filter(Number.isFinite) : [];
    return {
      ...d,
      count: valid.length,
      range: valid.length
        ? ([Math.min(...valid), Math.max(...valid)] as const)
        : null,
      kindLabel: (d.kind === "forecast"
        ? ["FORECAST", "ခန့်မှန်းချက်"]
        : ["OBSERVED / REANALYSIS", "အတိတ်ပြန်လည်ဆန်းစစ်ဒေတာ"]) as Bilingual,
      baseline: (d.kind === "forecast" || d.id === "dry"
        ? ["Baseline: not applicable", "ရည်ညွှန်းကာလ — မသက်ဆိုင်"]
        : [
            "Baseline: matching dates, 1991–2020",
            "ရည်ညွှန်းကာလ — တူညီရက်များ၊ ၁၉၉၁–၂၀၂၀",
          ]) as Bilingual,
      period:
        d.kind === "forecast"
          ? op.weather
            ? `${op.weather.validAt} → ${op.weather.through}`
            : null
          : op.history
            ? `${op.history.start} → ${op.history.end}`
            : null,
      updatedAt:
        d.kind === "forecast" ? op.weather?.fetchedAt : op.history?.fetchedAt,
      source:
        d.kind === "forecast"
          ? "ECMWF IFS / Open-Meteo"
          : "Copernicus ERA5 / Open-Meteo",
      sourceUrl:
        d.kind === "forecast"
          ? "https://open-meteo.com/en/docs/ecmwf-api"
          : "https://open-meteo.com/en/docs/historical-weather-api",
    };
  });
}
