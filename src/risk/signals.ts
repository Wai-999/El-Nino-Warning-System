import type { Operational } from "../data/operational.ts";
import { weatherFresh, historyFresh } from "../data/operational.ts";
import type { Snapshot, Severity } from "../data/schema.ts";
import { rank, activeAlerts, freshness } from "./engine.ts";
export type Hazard =
  "heat" | "rain" | "dryness" | "water" | "agriculture" | "wind" | "enso";
export const hazardNames: Record<Hazard, [string, string]> = {
  heat: ["Heat stress", "အပူဒဏ်"],
  rain: ["Heavy rain", "မိုးသည်းထန်မှု"],
  dryness: ["Dryness tendency", "ခြောက်သွေ့မှုအလားအလာ"],
  water: ["Water pressure", "ရေအပေါ် ဖိအား"],
  agriculture: ["Crop weather stress", "သီးနှံ ရာသီဥတုဖိအား"],
  wind: ["Strong wind", "လေပြင်း"],
  enso: ["El Niño context", "အယ်လ်နီညို နောက်ခံအခြေအနေ"],
};
export const actions: Record<Hazard, [string, string]> = {
  heat: [
    "Move strenuous work to cooler hours; rest in shade and drink safe water. Check on older people, children and outdoor workers.",
    "အားစိုက်ရသောအလုပ်ကို အေးချမ်းချိန်တွင် လုပ်ပါ။ အရိပ်တွင်နား၍ သန့်ရှင်းသောရေ သောက်ပါ။ သက်ကြီးရွယ်အို၊ ကလေးနှင့် ပြင်ပလုပ်သားများကို ဂရုစိုက်ပါ။",
  ],
  rain: [
    "Avoid crossing floodwater. Check local warnings and keep essential supplies above likely flood levels.",
    "ရေလွှမ်းနေသောနေရာကို မဖြတ်ပါနှင့်။ ဒေသသတိပေးချက် စစ်ဆေးပြီး အရေးကြီးပစ္စည်းများကို ရေမမီရာ၌ ထားပါ။",
  ],
  wind: [
    "Secure loose objects and avoid trees, exposed roofs and power lines during strong winds.",
    "လွင့်နိုင်သောပစ္စည်းများကို ခိုင်မြဲအောင်ထား၍ လေပြင်းချိန်တွင် သစ်ပင်၊ အမိုးနှင့် ဓာတ်ကြိုးအနီးမှ ရှောင်ပါ။",
  ],
  dryness: [
    "Check local water supplies and recent rainfall before changing planting or irrigation plans.",
    "စိုက်ချိန်နှင့် ရေပေးအစီအစဉ် မပြောင်းမီ ဒေသရေရရှိမှုနှင့် မကြာသေးမီမိုးရေကို စစ်ဆေးပါ။",
  ],
  water: [
    "Protect drinking-water supplies, repair leaks and confirm actual local storage levels.",
    "သောက်သုံးရေကို ကာကွယ်သိမ်းဆည်း၍ ယိုစိမ့်မှုများ ပြုပြင်ပါ။ ဒေသရေလက်ကျန်ကို အမှန်တကယ် စစ်ဆေးပါ။",
  ],
  agriculture: [
    "Inspect field drainage and soil moisture; seek local crop-stage advice before irrigation or planting decisions.",
    "လယ်ယာရေစီးဆင်းမှုနှင့် မြေအစိုဓာတ်ကို စစ်ဆေးပါ။ ရေပေးခြင်းနှင့် စိုက်ပျိုးခြင်းအတွက် ဒေသပညာရှင်ထံ အကြံဉာဏ်ရယူပါ။",
  ],
  enso: [
    "Review heat and water preparedness while following local weather. ENSO does not determine an individual weather event.",
    "ဒေသမိုးလေဝသကို စောင့်ကြည့်၍ အပူဒဏ်နှင့် ရေအတွက် ပြင်ဆင်ပါ။ ENSO တစ်ခုတည်းက ရာသီဥတုဖြစ်ရပ်တိုင်းကို မဆုံးဖြတ်ပါ။",
  ],
};
export type Signal = {
  hazard: Hazard;
  level: Severity | "unknown";
  evidence: [string, string];
  source: "ecmwf" | "era5" | "combined" | "noaa";
  historical: boolean;
};
export const threshold = (value: number, cuts: number[]): Severity =>
  (["normal", "advisory", "watch", "warning", "severe"] as const)[
    cuts.filter((c) => value >= c).length
  ];
export function signalsFor(
  op: Operational,
  data: Snapshot,
  id: string,
  now = Date.now(),
): Signal[] {
  const w = weatherFresh(op.weather, now)
    ? op.weather!.regions.find((r) => r.id === id)
    : undefined;
  const h = historyFresh(op.history, now)
    ? op.history!.regions.find((r) => r.id === id)
    : undefined;
  const heat = w
    ? threshold(
        w.next24.heat,
        [80, 90, 103, 125].map((f) => ((f - 32) * 5) / 9),
      )
    : "unknown";
  const rain = w ? threshold(w.next24.maxRain, [20, 50, 100, 200]) : "unknown";
  const wind = w ? threshold(w.next24.gust, [40, 60, 80, 100]) : "unknown";
  let dry: Severity | "unknown" = "unknown";
  if (h) {
    if (h.rainNormal30 >= 30 && h.rainPercent !== null) {
      dry = "normal";
      if (h.rainPercent <= -25) dry = "advisory";
      if (h.rainPercent <= -50 && h.dryDays >= 7) dry = "watch";
      if (h.rainPercent <= -75 && h.dryDays >= 14) dry = "warning";
    }
  }
  const max = (a: Severity | "unknown", b: Severity | "unknown") =>
    a === "unknown" || b === "unknown" ? "unknown" : rank[a] >= rank[b] ? a : b;
  const activeEnso =
    data.enso &&
    freshness(data.enso.issuedAt, data.enso.validUntil, now) === "current" &&
    data.enso.status.startsWith("El Niño");
  const met = max(max(heat, rain), dry);
  return [
    {
      hazard: "heat",
      level: heat,
      source: "ecmwf",
      historical: false,
      evidence: w
        ? [
            `Next 24 h: highest sampled heat index ${w.next24.heat.toFixed(1)}°C (shade).`,
            `လာမည့် ၂၄ နာရီ နမူနာနေရာ အမြင့်ဆုံး အပူဒဏ်ညွှန်းကိန်း ${w.next24.heat.toFixed(1)}°C (အရိပ်တွင်)။`,
          ]
        : [
            "Weather unavailable or stale.",
            "မိုးလေဝသဒေတာ မရရှိ သို့မဟုတ် သက်တမ်းကျော်နေသည်။",
          ],
    },
    {
      hazard: "rain",
      level: rain,
      source: "ecmwf",
      historical: false,
      evidence: w
        ? [
            `Next 24 h: maximum sample rainfall ${w.next24.maxRain.toFixed(1)} mm; regional sampled mean ${w.next24.rain.toFixed(1)} mm.`,
            `လာမည့် ၂၄ နာရီ နမူနာအများဆုံးမိုးရေ ${w.next24.maxRain.toFixed(1)} mm၊ ဒေသနမူနာပျမ်းမျှ ${w.next24.rain.toFixed(1)} mm။`,
          ]
        : [
            "Weather unavailable or stale.",
            "မိုးလေဝသဒေတာ မရရှိ သို့မဟုတ် သက်တမ်းကျော်နေသည်။",
          ],
    },
    {
      hazard: "dryness",
      level: dry,
      source: "era5",
      historical: true,
      evidence: h
        ? [
            `30-day rain departure ${h.rainPercent === null ? "unavailable" : h.rainPercent.toFixed(0) + "%"}; ${h.dryDays} trailing dry days through ${op.history!.end}.`,
            `ရက် ၃၀ မိုးရေကွာဟချက် ${h.rainPercent === null ? "မရရှိ" : h.rainPercent.toFixed(0) + "%"}၊ ${op.history!.end} အထိ မိုးပြတ် ${h.dryDays} ရက်။`,
          ]
        : [
            "Recent reanalysis unavailable or stale.",
            "မကြာသေးမီ ပြန်လည်ဆန်းစစ်ဒေတာ မရရှိ သို့မဟုတ် သက်တမ်းကျော်နေသည်။",
          ],
    },
    {
      hazard: "water",
      level: dry,
      source: "era5",
      historical: true,
      evidence: h
        ? [
            `30-day rainfall ${h.rain30.toFixed(1)} mm; normal ${h.rainNormal30.toFixed(1)} mm; departure ${h.rainPercent === null ? "unavailable" : h.rainPercent.toFixed(0) + "%"}; ${h.dryDays} trailing dry days. Rainfall proxy only; reservoir and river levels are not measured.`,
            `ရက် ၃၀ မိုးရေ ${h.rain30.toFixed(1)} mm၊ ပုံမှန် ${h.rainNormal30.toFixed(1)} mm၊ ကွာဟချက် ${h.rainPercent === null ? "မရရှိ" : h.rainPercent.toFixed(0) + "%"}၊ မိုးပြတ် ${h.dryDays} ရက်။ မိုးရေအခြေခံသာဖြစ်ပြီး ဆည်နှင့် မြစ်ရေကို မတိုင်းတာပါ။`,
          ]
        : [
            "Recent reanalysis unavailable or stale; local water supply is not assessed.",
            "မကြာသေးမီ ပြန်လည်ဆန်းစစ်ဒေတာ မရရှိ သို့မဟုတ် သက်တမ်းကျော်နေ၍ ဒေသရေရရှိမှုကို မသတ်မှတ်နိုင်ပါ။",
          ],
    },
    {
      hazard: "agriculture",
      level: met,
      source: "combined",
      historical: true,
      evidence: [
        "Highest heat, rain or dryness screening level. Crop type, growth stage and losses are not measured.",
        "အပူ၊ မိုးနှင့် ခြောက်သွေ့မှုအဆင့်များထဲမှ အမြင့်ဆုံးဖြစ်သည်။ သီးနှံအမျိုးအစား၊ အဆင့်နှင့် ဆုံးရှုံးမှုကို မတိုင်းတာထားပါ။",
      ],
    },
    {
      hazard: "wind",
      level: wind,
      source: "ecmwf",
      historical: false,
      evidence: w
        ? [
            `Next 24 h: highest sample gust ${w.next24.gust.toFixed(0)} km/h.`,
            `လာမည့် ၂၄ နာရီ နမူနာအမြင့်ဆုံးလေပြင်း ${w.next24.gust.toFixed(0)} km/h။`,
          ]
        : [
            "Weather unavailable or stale.",
            "မိုးလေဝသဒေတာ မရရှိ သို့မဟုတ် သက်တမ်းကျော်နေသည်။",
          ],
    },
    {
      hazard: "enso",
      level: activeEnso ? (met === "unknown" ? "unknown" : met) : "unknown",
      source: "noaa",
      historical: false,
      evidence: [
        activeEnso
          ? "El Niño is relevant background. Local severity is unchanged; event attribution is not established."
          : "No current El Niño assessment supports an enhanced context.",
        "အယ်လ်နီညို နောက်ခံအခြေအနေဖြစ်သည်။ ဒေသအဆင့်ကို မမြှင့်ထားပါ။ ဖြစ်ရပ်တစ်ခုချင်း၏ အကြောင်းရင်းဟု မသတ်မှတ်ပါ။",
      ],
    },
  ];
}
export function leadingSignal(signals: Signal[]) {
  return signals
    .filter(
      (s) =>
        s.level !== "unknown" &&
        !["enso", "agriculture", "water"].includes(s.hazard),
    )
    .sort((a, b) => rank[b.level as Severity] - rank[a.level as Severity])[0];
}
export function priority(op: Operational, data: Snapshot, now = Date.now()) {
  const official = activeAlerts(data, now)[0];
  if (official) return { kind: "official" as const, official };
  const regions = op.weather?.regions ?? op.history?.regions ?? [];
  const signals = regions
    .flatMap((r) =>
      signalsFor(op, data, r.id, now)
        .filter(
          (s) => !s.historical && s.hazard !== "enso" && s.level !== "unknown",
        )
        .map((s) => ({ id: r.id, signal: s })),
    )
    .sort(
      (a, b) =>
        rank[b.signal.level as Severity] - rank[a.signal.level as Severity],
    );
  if (signals[0] && rank[signals[0].signal.level as Severity] >= 3)
    return { kind: "system" as const, ...signals[0] };
  if (
    data.enso &&
    freshness(data.enso.issuedAt, data.enso.validUntil, now) === "current" &&
    data.enso.status.startsWith("El Niño")
  )
    return { kind: "enso" as const };
  return { kind: "overview" as const };
}
