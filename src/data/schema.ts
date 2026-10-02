import { z } from "zod";
import { regionIds, resolveRegion } from "./regions.ts";
const timestamp = z.string().datetime({ offset: true });
const localized = z.object({ en: z.string().min(1), my: z.string().min(1) });
const source = z.object({
  name: z.string().min(1),
  url: z
    .string()
    .url()
    .refine((u) => u.startsWith("https://")),
  retrievedAt: timestamp,
});
export const severitySchema = z.enum([
  "normal",
  "advisory",
  "watch",
  "warning",
  "severe",
]);
export const alertSchema = z
  .object({
    id: z.string().min(1),
    regionId: z
      .string()
      .refine((id) => regionIds.includes(id as (typeof regionIds)[number])),
    severity: severitySchema,
    type: z.enum([
      "heat",
      "rainfall",
      "drought",
      "water",
      "agriculture",
      "health",
      "energy",
      "fire",
    ]),
    title: localized,
    description: localized,
    impacts: localized,
    affected: localized,
    actions: z.array(localized).min(3).max(5),
    prepare: z.array(localized).min(1),
    issuedAt: timestamp,
    validFrom: timestamp,
    validUntil: timestamp,
    confidence: z.enum(["low", "medium", "high", "not-provided"]),
    confidenceReason: localized,
    source: source.extend({
      publisher: z.enum(["DMH", "WMO", "FAO", "WHO"]),
      originalSeverity: z.string().min(1),
    }),
    country: z.literal("MM"),
    sourceId: z.literal("dmh"),
    sourceLocation: z.string().min(1),
    kind: z.literal("official-bulletin"),
    change: localized,
  })
  .superRefine((a, c) => {
    if (
      Date.parse(a.validUntil) <= Date.parse(a.validFrom) ||
      Date.parse(a.issuedAt) > Date.parse(a.validUntil)
    )
      c.addIssue({ code: "custom", message: "Invalid alert validity period" });
    if (a.source.publisher !== "DMH")
      c.addIssue({
        code: "custom",
        message:
          "Only Myanmar issuing authorities may publish Myanmar official warnings",
      });
    try {
      if (resolveRegion(a.sourceLocation) !== a.regionId)
        c.addIssue({
          code: "custom",
          message: "Source location does not match canonical region",
        });
    } catch {
      c.addIssue({
        code: "custom",
        message: "Unknown source location; manual geographic review required",
      });
    }
    if (Date.parse(a.source.retrievedAt) < Date.parse(a.issuedAt))
      c.addIssue({ code: "custom", message: "Retrieval precedes issue" });
    const hosts: { [key: string]: string[] } = {
      DMH: ["dmh.gov.mm"],
      WMO: ["wmo.int", "public.wmo.int"],
      FAO: ["fao.org", "www.fao.org"],
      WHO: ["who.int", "www.who.int"],
    };
    if (
      !hosts[a.source.publisher].some(
        (h) =>
          new URL(a.source.url).hostname === h ||
          new URL(a.source.url).hostname.endsWith("." + h),
      )
    )
      c.addIssue({
        code: "custom",
        message: "Publisher does not match source hostname",
      });
  });
export const bulletinSchema = z
  .object({
    status: z.enum([
      "El Niño Advisory",
      "La Niña Advisory",
      "El Niño Watch",
      "La Niña Watch",
      "Not Active",
    ]),
    issuedAt: timestamp,
    validUntil: timestamp,
    source,
    outlook: z
      .object({
        percent: z.number().min(0).max(100),
        greaterThan: z.boolean(),
        period: z.string().max(160),
      })
      .nullable()
      .optional(),
    kind: z.literal("official-assessment"),
    resolution: z.literal("Tropical Pacific; not a Myanmar forecast"),
  })
  .refine(
    (d) => Date.parse(d.validUntil) > Date.parse(d.issuedAt),
    "Invalid bulletin interval",
  );
export const snapshotSchema = z
  .object({
    version: z.literal(1),
    checkedAt: timestamp,
    enso: bulletinSchema.nullable(),
    ensoFetch: z.enum(["ok", "failed", "unavailable"]),
    regionalCoverage: z.enum(["unavailable", "partial", "complete"]),
    regionalCheckedAt: timestamp.nullable(),
    alerts: z.array(alertSchema),
    history: z.array(alertSchema),
  })
  .superRefine((d, c) => {
    for (const list of [d.alerts, d.history])
      if (new Set(list.map((x) => x.id)).size !== list.length)
        c.addIssue({ code: "custom", message: "Duplicate alert IDs" });
    if (d.regionalCoverage !== "unavailable" && !d.regionalCheckedAt)
      c.addIssue({ code: "custom", message: "Coverage requires a timestamp" });
    if (d.enso && Date.parse(d.enso.issuedAt) > Date.parse(d.checkedAt))
      c.addIssue({ code: "custom", message: "Future ENSO issue time" });
    if (
      d.enso &&
      Date.parse(d.enso.source.retrievedAt) > Date.parse(d.checkedAt)
    )
      c.addIssue({ code: "custom", message: "Future retrieval time" });
    for (const a of [...d.alerts, ...d.history])
      if (
        Date.parse(a.issuedAt) > Date.parse(d.checkedAt) ||
        Date.parse(a.source.retrievedAt) > Date.parse(d.checkedAt)
      )
        c.addIssue({ code: "custom", message: "Future alert timestamp" });
  });
export type Snapshot = z.infer<typeof snapshotSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type Severity = z.infer<typeof severitySchema>;
export const emptySnapshot: Snapshot = {
  version: 1,
  checkedAt: "1970-01-01T00:00:00Z",
  enso: null,
  ensoFetch: "unavailable",
  regionalCoverage: "unavailable",
  regionalCheckedAt: null,
  alerts: [],
  history: [],
};
