import type { Operational, DataState } from "../data/operational.ts";
import { weatherState, historyState, DAY } from "../data/operational.ts";
import type { Snapshot, Severity } from "../data/schema.ts";
import { regions } from "../data/regions.ts";
import { sources, reviewedAt, reviewedState } from "../data/sources.ts";
import { activeAlerts, coverageCurrent, freshness, rank } from "./engine.ts";
import { signalsFor, type Signal } from "./signals.ts";
export const categories = [
  "temperature",
  "precipitation",
  "forecast",
  "drought",
  "flood",
  "agriculture",
  "health",
  "official",
] as const;
export type Category = (typeof categories)[number];
export type CoverageCell = {
  category: Category;
  state: DataState;
  sourceId: string | null;
  kind: "monitoring" | "context";
  period: string | null;
  retrievedAt: string | null;
};
export const usable = (s: DataState) => s === "current" || s === "aging";
export function sourceStatus(op: Operational, data: Snapshot, now: number) {
  return sources
    .filter((s) => s.id !== "fao2016")
    .map((s) => {
      let state: DataState = "unavailable",
        period: string | null = null,
        retrievedAt: string | null = null;
      if (s.id === "ecmwf") {
        state = weatherState(op.weather, now);
        period = op.weather
          ? `${op.weather.validAt} → ${op.weather.through}`
          : null;
        retrievedAt = op.weather?.fetchedAt ?? null;
      }
      if (s.id === "era5") {
        state = historyState(op.history, now);
        period = op.history ? `${op.history.start} → ${op.history.end}` : null;
        retrievedAt = op.history?.fetchedAt ?? null;
      }
      if (s.id === "noaa" && data.enso) {
        state =
          freshness(data.enso.issuedAt, data.enso.validUntil, now) === "current"
            ? now - Date.parse(data.enso.issuedAt) >= 21 * DAY
              ? "aging"
              : "current"
            : "stale";
        period = `${data.enso.issuedAt} → ${data.enso.validUntil}`;
        retrievedAt = data.enso.source.retrievedAt;
      }
      if (s.id === "nino34" && op.nino) {
        const m = op.nino.months.at(-1)!;
        state = reviewedState(`${m.month}-01T00:00:00Z`, 62, 93, now);
        period = m.month;
        retrievedAt = op.nino.fetchedAt;
      }
      if (s.id === "fao") {
        state = reviewedState("2026-09-18T00:00:00Z", 45, 90, now);
        period = "2026/27 · 2026-09-18";
        retrievedAt = reviewedAt;
      }
      if (s.id === "who") {
        state = reviewedState(reviewedAt, 90, 180, now);
        period = "2026-07-31";
        retrievedAt = reviewedAt;
      }
      if (s.id === "asmc") {
        state =
          now >= Date.parse("2026-12-01T00:00:00+06:30")
            ? "stale"
            : reviewedState("2026-09-02T00:00:00Z", 35, 62, now);
        period = "2026-09 → 2026-11";
        retrievedAt = reviewedAt;
      }
      if (s.id === "dmh") {
        state = coverageCurrent(data, now)
          ? "current"
          : data.regionalCheckedAt
            ? "stale"
            : "unavailable";
        period = data.regionalCheckedAt;
        retrievedAt = data.regionalCheckedAt;
      }
      if (["fao", "who", "asmc"].includes(s.id) && now < Date.parse(reviewedAt))
        state = "unavailable";
      const health = op.health[s.id];
      return {
        ...s,
        state,
        period,
        retrievedAt,
        failed:
          s.id === "noaa" ? data.ensoFetch === "failed" : health?.ok === false,
        error: health?.error ?? null,
        checkedAt:
          health?.checkedAt ?? (s.id === "noaa" ? data.checkedAt : null),
        lastSuccess: health?.lastSuccess ?? null,
      };
    });
}
export function coverageFor(
  op: Operational,
  data: Snapshot,
  id: string,
  now: number,
): CoverageCell[] {
  const states = sourceStatus(op, data, now);
  return categories.map((category) => {
    const sourceId = (
      {
        temperature: "era5",
        precipitation: "era5",
        forecast: "ecmwf",
        drought: null,
        flood: null,
        agriculture: "fao",
        health: "who",
        official: "dmh",
      } as const
    )[category];
    const source = states.find((s) => s.id === sourceId);
    let state = source?.state ?? "unavailable";
    if (sourceId === "era5" && !op.history?.regions.some((r) => r.id === id))
      state = "unavailable";
    if (sourceId === "ecmwf" && !op.weather?.regions.some((r) => r.id === id))
      state = "unavailable";
    return {
      category,
      sourceId,
      state,
      kind:
        category === "agriculture" || category === "health"
          ? "context"
          : "monitoring",
      period: source?.period ?? null,
      retrievedAt: source?.retrievedAt ?? null,
    };
  });
}
export function overallLevel(signals: Signal[]): Severity | "unknown" {
  const independent = signals.filter((s) =>
    ["heat", "rain", "dryness", "wind"].includes(s.hazard),
  );
  const known = independent
    .filter((s) => s.level !== "unknown")
    .sort((a, b) => rank[b.level as Severity] - rank[a.level as Severity]);
  if (!known.length) return "unknown";
  if (
    known[0].level === "normal" &&
    (independent.length < 4 || independent.some((s) => s.level === "unknown"))
  )
    return "unknown";
  return known[0].level;
}
export function regionalRows(
  op: Operational,
  data: Snapshot,
  now = Date.now(),
) {
  const alerts = activeAlerts(data, now);
  return regions.map(([id]) => {
    const signals = signalsFor(op, data, id, now),
      coverage = coverageFor(op, data, id, now);
    const official = alerts.filter((a) => a.regionId === id),
      level = overallLevel(signals);
    const independent = signals.filter((s) =>
      ["heat", "rain", "dryness", "wind"].includes(s.hazard),
    );
    const evidenceCount = independent.filter(
      (s) => s.level !== "unknown",
    ).length;
    const states = coverage
      .filter((c) =>
        ["temperature", "precipitation", "forecast"].includes(c.category),
      )
      .map((c) => c.state);
    const state: DataState = states.includes("unavailable")
      ? "unavailable"
      : states.includes("stale")
        ? "stale"
        : states.includes("aging")
          ? "aging"
          : "current";
    return {
      id,
      signals,
      coverage,
      official,
      level,
      evidenceCount,
      state,
      partial: evidenceCount < 4,
      updatedAt: op.weather?.fetchedAt ?? op.history?.fetchedAt ?? null,
    };
  });
}
export type RegionRow = ReturnType<typeof regionalRows>[number];
export function sortRows(rows: RegionRow[], sort = "concern") {
  return [...rows].sort((a, b) => {
    if (sort === "az")
      return regions
        .find((r) => r[0] === a.id)![1]
        .localeCompare(regions.find((r) => r[0] === b.id)![1]);
    if (sort === "newest")
      return (
        Math.max(0, ...b.official.map((x) => Date.parse(x.issuedAt))) -
          Math.max(0, ...a.official.map((x) => Date.parse(x.issuedAt))) ||
        a.id.localeCompare(b.id)
      );
    return (
      Number(!!b.official.length) - Number(!!a.official.length) ||
      (b.level === "unknown" ? -1 : rank[b.level]) -
        (a.level === "unknown" ? -1 : rank[a.level]) ||
      a.id.localeCompare(b.id)
    );
  });
}
export function coverageKpi(rows: RegionRow[]) {
  const cells = rows.flatMap((r) => r.coverage);
  return {
    available: cells.filter((c) => usable(c.state)).length,
    expected: cells.length,
    monitoring: cells.filter((c) => c.kind === "monitoring" && usable(c.state))
      .length,
    monitoringExpected: cells.filter((c) => c.kind === "monitoring").length,
    context: cells.filter((c) => c.kind === "context" && usable(c.state))
      .length,
    contextExpected: cells.filter((c) => c.kind === "context").length,
    highPriority: rows.filter(
      (r) => r.official.length || (r.level !== "unknown" && rank[r.level] >= 2),
    ).length,
  };
}
export function nextScheduledUpdate(now: number) {
  const d = new Date(now);
  for (let day = 0; day < 2; day++)
    for (const hour of [4, 10, 16, 22]) {
      const n = Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate() + day,
        hour,
        17,
      );
      if (n > now) return new Date(n).toISOString();
    }
  throw Error("No schedule");
}
