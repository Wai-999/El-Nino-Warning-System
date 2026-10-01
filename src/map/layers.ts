import type { Operational } from "../data/operational";
import { weatherFresh, historyFresh } from "../data/operational";
import type { Snapshot } from "../data/schema";
import { regionalLevel, rank } from "../risk/engine";
import { signalsFor, leadingSignal } from "../risk/signals";
export const layers = [
  ["overall", "Overall risk", "စုစုပေါင်းအန္တရာယ်", "level"],
  ["temperature", "Temperature", "အပူချိန်", "°C"],
  ["temperatureAnomaly", "Temperature anomaly", "အပူချိန်ကွာဟချက်", "°C"],
  ["rain", "Rainfall · next 24 h", "မိုးရေ · လာမည့် ၂၄ နာရီ", "mm"],
  ["rainAnomaly", "Rainfall anomaly · 30 d", "မိုးရေကွာဟချက် · ရက် ၃၀", "%"],
  ["heat", "Heat risk", "အပူဒဏ်အန္တရာယ်", "level"],
  ["dryness", "Dryness tendency", "ခြောက်သွေ့မှုအလားအလာ", "level"],
  ["agriculture", "Agriculture stress", "စိုက်ပျိုးရေးဖိအား", "level"],
  ["official", "Official warnings", "တရားဝင်သတိပေးချက်", "level"],
  ["system", "System risk signals", "စနစ်အန္တရာယ်ညွှန်းကိန်း", "level"],
] as const;
export type Layer = (typeof layers)[number][0];
export function layerValue(
  layer: Layer,
  op: Operational,
  data: Snapshot,
  id: string,
  now: number,
): { value: number | null; label: string } {
  const w = weatherFresh(op.weather, now)
      ? op.weather!.regions.find((r) => r.id === id)
      : undefined,
    h = historyFresh(op.history, now)
      ? op.history!.regions.find((r) => r.id === id)
      : undefined;
  const signals = signalsFor(op, data, id, now);
  let level = leadingSignal(signals)?.level ?? "unknown";
  const official = regionalLevel(data, id, now);
  if (layer === "official") level = official;
  else if (
    layer === "overall" &&
    official !== "unknown" &&
    (level === "unknown" || rank[official] > rank[level])
  )
    level = official;
  else if (["heat", "dryness", "agriculture"].includes(layer))
    level = signals.find((s) => s.hazard === layer)?.level ?? "unknown";
  let v: number | null = level === "unknown" ? null : rank[level];
  if (layer === "temperature") v = w?.now.temperature ?? null;
  if (layer === "temperatureAnomaly") v = h?.temperatureAnomaly ?? null;
  if (layer === "rain") v = w?.next24.rain ?? null;
  if (layer === "rainAnomaly") v = h?.rainPercent ?? null;
  return {
    value: v,
    label:
      layers.find((l) => l[0] === layer)?.[3] === "level"
        ? level
        : v === null
          ? "unknown"
          : v.toFixed(1),
  };
}
export function layerScale(layer: Layer) {
  if (layer === "temperature")
    return {
      cuts: [20, 28, 32, 36],
      colors: ["#e0eeea", "#b6d5c6", "#f0d999", "#dcad65", "#bd724f"],
      labels: ["<20", "20–28", "28–32", "32–36", "≥36"],
    };
  if (layer === "temperatureAnomaly" || layer === "rainAnomaly")
    return {
      cuts:
        layer === "temperatureAnomaly"
          ? [-2, -0.5, 0.5, 2]
          : [-50, -25, 25, 50],
      colors:
        layer === "temperatureAnomaly"
          ? ["#4c9893", "#9ec9c3", "#e7e9e2", "#ddc1a4", "#9b7657"]
          : ["#9b7657", "#ddc1a4", "#e7e9e2", "#9ec9c3", "#4c9893"],
      labels:
        layer === "temperatureAnomaly"
          ? ["<−2", "−2…−0.5", "−0.5…+0.5", "+0.5…+2", "≥+2"]
          : ["<−50", "−50…−25", "−25…+25", "+25…+50", "≥+50"],
    };
  if (layer === "rain")
    return {
      cuts: [1, 20, 50, 100],
      colors: ["#e7eee8", "#c0ded7", "#85b8b1", "#4d8e87", "#24615d"],
      labels: ["<1", "1–20", "20–50", "50–100", "≥100"],
    };
  return {
    cuts: [1, 2, 3, 4],
    colors: ["#c8ded4", "#f3dc9b", "#edbb71", "#dd864e", "#b54242"],
    labels: ["Normal", "Advisory", "Watch", "Warning", "Severe"],
  };
}
