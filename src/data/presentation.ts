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
export function condition(code: number): readonly [string, string] {
  if (code === 0) return ["Clear skies", "ကောင်းကင်ကြည်လင်"] as const;
  if (code <= 3) return ["Partly cloudy", "တိမ်အသင့်အတင့်"] as const;
  if (code <= 48) return ["Foggy", "မြူဆိုင်း"] as const;
  if (code <= 57) return ["Drizzle", "မိုးဖွဲ"] as const;
  if (code <= 67) return ["Rain", "မိုးရွာ"] as const;
  if (code <= 77) return ["Snow", "နှင်းကျ"] as const;
  if (code <= 82) return ["Rain showers", "နေရာကွက်ကျား မိုးရွာ"] as const;
  if (code <= 86) return ["Snow showers", "နှင်းပွင့်ကျ"] as const;
  return ["Thunderstorms", "မိုးကြိုးမုန်တိုင်း"] as const;
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
