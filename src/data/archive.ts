import { z } from "zod";
import { regionIds } from "./regions.ts";
import { alertSchema, type Snapshot } from "./schema.ts";
import type { Operational } from "./operational.ts";
import { regionalRows, coverageKpi } from "../risk/intelligence.ts";
const stamp = z.string().datetime({ offset: true });
const level = z.enum([
  "normal",
  "advisory",
  "watch",
  "warning",
  "severe",
  "unknown",
]);
const row = z.object({
  id: z.enum(regionIds as [string, ...string[]]),
  level,
  heat: level,
  rain: level,
  dryness: level,
  wind: level,
  evidenceCount: z.number().int().min(0).max(4),
});
export const summarySchema = z
  .object({
    method: z.literal("screening-2.1"),
    recordedAt: stamp,
    weatherPeriod: z.string().nullable(),
    historyPeriod: z.string().nullable(),
    sourceIds: z
      .array(z.enum(["ecmwf", "era5", "noaa"]))
      .max(3)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "Duplicate source IDs",
      ),
    units: z.literal("temperature °C; rainfall mm; departure %; gust km/h"),
    baseline: z.literal("ERA5 1991–2020"),
    enso: z.string().nullable(),
    ensoIssuedAt: stamp.nullable(),
    officialIds: z.array(z.string()),
    coverage: z.number().int().min(0).max(120),
    regions: z
      .array(row)
      .length(15)
      .refine(
        (r) => new Set(r.map((x) => x.id)).size === 15,
        "Duplicate/missing archive regions",
      ),
  })
  .superRefine((s, c) => {
    if (s.weatherPeriod) {
      const [start, end] = s.weatherPeriod.split(" → ");
      if (
        !stamp.safeParse(start).success ||
        !stamp.safeParse(end).success ||
        Date.parse(end) - Date.parse(start) !== 86400000 ||
        Date.parse(start) > Date.parse(s.recordedAt) + 3600000
      )
        c.addIssue({ code: "custom", message: "Invalid forecast period" });
    }
    if (s.historyPeriod) {
      const [start, end] = s.historyPeriod.split(" → ");
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
        Date.parse(end) - Date.parse(start) !== 29 * 86400000 ||
        Date.parse(end + "T23:59:59+06:30") >= Date.parse(s.recordedAt)
      )
        c.addIssue({ code: "custom", message: "Invalid reanalysis period" });
    }
    if (
      (s.weatherPeriod && !s.sourceIds.includes("ecmwf")) ||
      (s.historyPeriod && !s.sourceIds.includes("era5")) ||
      (s.enso && !s.sourceIds.includes("noaa"))
    )
      c.addIssue({ code: "custom", message: "Missing source ID" });
  });
export const archiveSchema = z
  .object({
    version: z.literal(1),
    snapshots: z.array(summarySchema).max(124),
    bulletins: z.array(alertSchema),
  })
  .superRefine((a, c) => {
    for (let i = 1; i < a.snapshots.length; i++)
      if (
        Date.parse(a.snapshots[i].recordedAt) <=
        Date.parse(a.snapshots[i - 1].recordedAt)
      )
        c.addIssue({
          code: "custom",
          message: "Unordered/duplicate snapshot time",
        });
    if (new Set(a.bulletins.map((b) => b.id)).size !== a.bulletins.length)
      c.addIssue({ code: "custom", message: "Duplicate archive bulletin" });
  });
export type Archive = z.infer<typeof archiveSchema>;
export type Summary = z.infer<typeof summarySchema>;
export const emptyArchive: Archive = {
  version: 1,
  snapshots: [],
  bulletins: [],
};
export function validateArchive(input: unknown, now = Date.now()) {
  const a = archiveSchema.parse(input);
  if (
    a.snapshots.some(
      (s) =>
        Date.parse(s.recordedAt) > now + 60000 ||
        (s.ensoIssuedAt &&
          Date.parse(s.ensoIssuedAt) > Date.parse(s.recordedAt)),
    )
  )
    throw Error("Future archive date");
  return a;
}
export function buildSummary(
  op: Operational,
  data: Snapshot,
  now: number,
): Summary {
  const rows = regionalRows(op, data, now);
  return summarySchema.parse({
    method: "screening-2.1",
    recordedAt: new Date(now).toISOString(),
    weatherPeriod: op.weather
      ? `${op.weather.validAt} → ${op.weather.through}`
      : null,
    historyPeriod: op.history
      ? `${op.history.start} → ${op.history.end}`
      : null,
    sourceIds: [
      ...(op.weather ? ["ecmwf"] : []),
      ...(op.history ? ["era5"] : []),
      ...(data.enso ? ["noaa"] : []),
    ],
    units: "temperature °C; rainfall mm; departure %; gust km/h",
    baseline: "ERA5 1991–2020",
    enso: data.enso?.status ?? null,
    ensoIssuedAt: data.enso?.issuedAt ?? null,
    officialIds: rows.flatMap((r) => r.official.map((a) => a.id)),
    coverage: coverageKpi(rows).available,
    regions: rows.map((r) => ({
      id: r.id,
      level: r.level,
      evidenceCount: r.evidenceCount,
      ...Object.fromEntries(
        r.signals
          .filter((s) => ["heat", "rain", "dryness", "wind"].includes(s.hazard))
          .map((s) => [s.hazard, s.level]),
      ),
    })),
  });
}
export function summaryIdentity(s: Summary) {
  return JSON.stringify({ ...s, recordedAt: undefined });
}
export function appendSummary(
  a: Archive,
  s: Summary,
  bulletins: Snapshot["alerts"],
): Archive {
  const previous = a.snapshots.at(-1);
  const snapshots =
    previous && summaryIdentity(previous) === summaryIdentity(s)
      ? a.snapshots
      : [...a.snapshots, s].slice(-124);
  const saved = new Map([...a.bulletins, ...bulletins].map((b) => [b.id, b]));
  return validateArchive(
    {
      version: 1,
      snapshots,
      bulletins: [...saved.values()].filter(
        (b) =>
          Date.parse(b.validUntil) > Date.parse(s.recordedAt) - 365 * 86400000,
      ),
    },
    Date.parse(s.recordedAt),
  );
}
export function compareSummaries(previous: Summary, current: Summary) {
  if (previous.method !== current.method) return null;
  const changes = current.regions.flatMap((r) => {
    const old = previous.regions.find((p) => p.id === r.id)!;
    return (["heat", "rain", "dryness", "wind"] as const).flatMap((hazard) => {
      if (old[hazard] === r[hazard]) return [];
      const ranks = ["normal", "advisory", "watch", "warning", "severe"];
      const direction =
        r[hazard] === "unknown"
          ? "data-lost"
          : old[hazard] === "unknown"
            ? "data-restored"
            : ranks.indexOf(r[hazard]) > ranks.indexOf(old[hazard])
              ? "increased"
              : "decreased";
      return [
        { id: r.id, hazard, before: old[hazard], after: r[hazard], direction },
      ];
    });
  });
  return {
    changes,
    newOfficial: current.officialIds.filter(
      (id) => !previous.officialIds.includes(id),
    ),
    endedOfficial: previous.officialIds.filter(
      (id) => !current.officialIds.includes(id),
    ),
    ensoChanged:
      current.enso !== previous.enso ||
      current.ensoIssuedAt !== previous.ensoIssuedAt,
  };
}
