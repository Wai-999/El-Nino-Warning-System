import type { Lang } from "../app/context";
import type { Alert } from "./schema";
import { freshness } from "../risk/engine";
import { localDigits } from "./locale";
export function number(
  value: number | null | undefined,
  lang: Lang,
  digits = 1,
) {
  return value == null || !Number.isFinite(value)
    ? "—"
    : localDigits(
        new Intl.NumberFormat("en-GB", {
          maximumFractionDigits: digits,
        }).format(value),
        lang,
      );
}
type WeatherKind =
  "sun" | "cloud" | "overcast" | "fog" | "rain" | "snow" | "unknown";
// Provider WMO interpretation codes; descriptions never create an official warning.
const weatherDescriptions: {
  codes: number[];
  text: readonly [string, string];
  kind: WeatherKind;
}[] = [
  { codes: [0], text: ["Clear skies", "ကောင်းကင်ကြည်လင်"], kind: "sun" },
  {
    codes: [1],
    text: ["Mainly clear", "အများအားဖြင့် ကောင်းကင်ကြည်လင်"],
    kind: "cloud",
  },
  { codes: [2], text: ["Partly cloudy", "တိမ်အသင့်အတင့်"], kind: "cloud" },
  { codes: [3], text: ["Overcast", "တိမ်ထူထပ်"], kind: "overcast" },
  { codes: [45, 48], text: ["Foggy", "မြူဆိုင်း"], kind: "fog" },
  { codes: [51, 53, 55], text: ["Drizzle", "မိုးဖွဲ"], kind: "rain" },
  {
    codes: [56, 57],
    text: ["Freezing drizzle", "ရေခဲဖြစ်စေသော မိုးဖွဲ"],
    kind: "rain",
  },
  { codes: [61, 63, 65], text: ["Rain", "မိုးရွာ"], kind: "rain" },
  {
    codes: [66, 67],
    text: ["Freezing rain", "ရေခဲဖြစ်စေသော မိုး"],
    kind: "rain",
  },
  { codes: [71, 73, 75, 77], text: ["Snow", "နှင်းကျ"], kind: "snow" },
  {
    codes: [80, 81, 82],
    text: ["Rain showers", "နေရာကွက်ကျား မိုးရွာ"],
    kind: "rain",
  },
  { codes: [85, 86], text: ["Snow showers", "နှင်းပွင့်ကျ"], kind: "snow" },
  {
    codes: [95, 97],
    text: ["Thunderstorms", "မိုးကြိုးမုန်တိုင်း"],
    kind: "rain",
  },
  {
    codes: [96, 99],
    text: ["Thunderstorms with hail", "မိုးသီးပါ မိုးကြိုးမုန်တိုင်း"],
    kind: "rain",
  },
];
export function condition(code: number): readonly [string, string] {
  return (
    weatherDescriptions.find((row) => row.codes.includes(code))?.text || [
      "Condition unavailable",
      "မိုးလေဝသအခြေအနေ မရရှိပါ",
    ]
  );
}
export function weatherKind(code: number): WeatherKind {
  return (
    weatherDescriptions.find((row) => row.codes.includes(code))?.kind ||
    "unknown"
  );
}
export function alertState(
  a: Alert,
  now: number,
): "active" | "expired" | "unverified" {
  const state = freshness(a.issuedAt, a.validUntil, now);
  return state === "stale"
    ? "expired"
    : state === "current" && Date.parse(a.validFrom) <= now
      ? "active"
      : "unverified";
}
export function download(
  name: string,
  data: unknown,
  type = "application/json",
) {
  const blob = new Blob(
    [
      type === "application/json"
        ? JSON.stringify(data, null, 2)
        : String(data),
    ],
    { type: `${type};charset=utf-8` },
  );
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csv(rows: unknown[][]) {
  // Quote every cell and neutralize spreadsheet formulas in external text fields.
  return rows
    .map((row) =>
      row
        .map((v) => {
          let s = String(v ?? "");
          if (/^[=+@]/.test(s) || /^-[^\d]/.test(s)) s = "'" + s;
          return '"' + s.replaceAll('"', '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
}
