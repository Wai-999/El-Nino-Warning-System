import { z } from "zod";
import { regionIds } from "./regions.ts";
const stamp = z.string().datetime();
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (d) =>
      Number.isFinite(Date.parse(d)) &&
      new Date(d).toISOString().slice(0, 10) === d,
    "Invalid calendar date",
  );
const temp = z.number().finite().min(-90).max(65);
const rain = z.number().finite().min(0).max(5000);
export const sampleSchema = z.object({
  regionId: z.enum(regionIds as [string, ...string[]]),
  lat: z.number().min(9).max(29),
  lon: z.number().min(92).max(102),
  weight: z.number().positive().max(1),
});
export type Sample = z.infer<typeof sampleSchema>;
const daily = z
  .object({
    date: day,
    min: temp,
    max: temp,
    rain,
    heat: z.number().min(-90).max(100),
    gust: z.number().min(0).max(400),
  })
  .refine((d) => d.min <= d.max, "Reversed temperature range");
export const weatherSchema = z
  .object({
    fetchedAt: stamp,
    validAt: stamp,
    through: stamp,
    model: z.literal("ECMWF IFS 0.25°"),
    regions: z
      .array(
        z.object({
          id: z.enum(regionIds as [string, ...string[]]),
          now: z.object({
            temperature: temp,
            apparent: z.number().min(-100).max(100),
            humidity: z.number().min(0).max(100),
            rain: rain,
            wind: z.number().min(0).max(400),
            gust: z.number().min(0).max(400),
            code: z.number().int().min(0).max(99),
            min: temp,
            max: temp,
          }),
          next24: z.object({
            min: temp,
            max: temp,
            rain,
            maxRain: rain,
            heat: z.number().min(-90).max(100),
            gust: z.number().min(0).max(400),
          }),
          days: z.array(daily).length(7),
        }),
      )
      .length(15),
  })
  .superRefine((d, c) => {
    if (new Set(d.regions.map((r) => r.id)).size !== 15)
      c.addIssue({ code: "custom", message: "Duplicate regions" });
    if (Date.parse(d.through) - Date.parse(d.validAt) !== 24 * 3600000)
      c.addIssue({ code: "custom", message: "Reversed forecast window" });
    for (const r of d.regions)
      if (
        new Set(r.days.map((x) => x.date)).size !== 7 ||
        r.days.some(
          (x, i) =>
            i > 0 &&
            Date.parse(x.date) - Date.parse(r.days[i - 1].date) !== 86400000,
        )
      )
        c.addIssue({ code: "custom", message: "Duplicate forecast days" });
  });
export const historySchema = z
  .object({
    fetchedAt: stamp,
    start: day,
    end: day,
    baseline: z.literal("1991–2020"),
    model: z.literal("ERA5 0.25°"),
    sampleHash: z.string(),
    regions: z
      .array(
        z.object({
          id: z.enum(regionIds as [string, ...string[]]),
          temperature: temp,
          temperatureNormal: temp,
          temperatureAnomaly: z.number().min(-50).max(50),
          rain7: rain,
          rain30: rain,
          rainNormal7: rain,
          rainNormal30: rain,
          rainDifference: z.number().min(-5000).max(5000),
          rainPercent: z.number().min(-100).max(100000).nullable(),
          dryDays: z.number().int().min(0).max(30),
          rainDaily: z.array(rain).length(30),
        }),
      )
      .length(15),
  })
  .superRefine((d, c) => {
    if (Date.parse(d.end + "T23:59:59+06:30") >= Date.parse(d.fetchedAt))
      c.addIssue({
        code: "custom",
        message: "Historical window must be completed before retrieval",
      });
    if (
      new Set(d.regions.map((r) => r.id)).size !== 15 ||
      Date.parse(d.end) - Date.parse(d.start) !== 29 * 86400000
    )
      c.addIssue({
        code: "custom",
        message: "Invalid regional historical coverage",
      });
    for (const r of d.regions) {
      // Stored values are rounded to 0.01 mm; retain the raw-value threshold's
      // possible interval, especially for values rounded to exactly 1 or 10 mm.
      const normal = r.rainNormal30;
      const percentError =
        normal > 0.005
          ? 0.02 + 0.5 / normal + (0.5 * r.rain30) / (normal * (normal - 0.005))
          : 0;
      const percentageConsistent =
        r.rainPercent === null
          ? normal < 10.005
          : normal >= 9.995 &&
            Math.abs(r.rainPercent - (r.rain30 / normal - 1) * 100) <=
              percentError;
      let minDry = 0,
        maxDry = 0;
      for (let i = r.rainDaily.length - 1; i >= 0 && r.rainDaily[i] < 1; i--)
        minDry++;
      for (let i = r.rainDaily.length - 1; i >= 0 && r.rainDaily[i] <= 1; i--)
        maxDry++;
      if (
        !percentageConsistent ||
        r.dryDays < minDry ||
        r.dryDays > maxDry ||
        Math.abs(r.rainDaily.slice(-7).reduce((a, b) => a + b, 0) - r.rain7) >
          0.05 ||
        Math.abs(r.temperature - r.temperatureNormal - r.temperatureAnomaly) >
          0.025 ||
        Math.abs(r.rain30 - r.rainNormal30 - r.rainDifference) > 0.025 ||
        Math.abs(r.rainDaily.reduce((a, b) => a + b, 0) - r.rain30) > 0.16
      )
        c.addIssue({
          code: "custom",
          message: "Inconsistent climate calculations",
        });
    }
  });
export const indexSchema = z
  .object({
    fetchedAt: stamp,
    source: z.literal(
      "https://www.cpc.ncep.noaa.gov/data/indices/sstoi.indices",
    ),
    months: z
      .array(
        z.object({
          month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
          anomaly: z.number().min(-10).max(10),
        }),
      )
      .min(2)
      .max(6),
  })
  .superRefine((d, c) => {
    for (const [i, m] of d.months.entries()) {
      const nextMonth = new Date(m.month + "-01T00:00:00Z");
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
      if (
        nextMonth.getTime() > Date.parse(d.fetchedAt) ||
        (i > 0 &&
          Date.parse(m.month + "-01") <=
            Date.parse(d.months[i - 1].month + "-01"))
      )
        c.addIssue({
          code: "custom",
          message: "Duplicate, unordered or incomplete monthly observation",
        });
    }
  });
export const healthSchema = z.object({
  checkedAt: stamp,
  lastSuccess: stamp.nullable(),
  ok: z.boolean(),
  error: z.string().max(240).nullable(),
});
export const operationalSchema = z.object({
  version: z.literal(2),
  generatedAt: stamp,
  weather: weatherSchema.nullable(),
  history: historySchema.nullable(),
  nino: indexSchema.nullable(),
  health: z.record(healthSchema),
});
export type Operational = z.infer<typeof operationalSchema>;
export type Weather = z.infer<typeof weatherSchema>;
export type History = z.infer<typeof historySchema>;
export const emptyOperational: Operational = {
  version: 2,
  generatedAt: new Date(0).toISOString(),
  weather: null,
  history: null,
  nino: null,
  health: {},
};
export const HOUR = 3600000,
  DAY = 24 * HOUR;
export function weatherFresh(w: Weather | null, now = Date.now()) {
  return (
    !!w &&
    Date.parse(w.fetchedAt) <= now + 60000 &&
    now - Date.parse(w.fetchedAt) < 18 * HOUR &&
    Date.parse(w.validAt) <= now + HOUR &&
    now - Date.parse(w.validAt) < 18 * HOUR &&
    now < Date.parse(w.through)
  );
}
export function historyFresh(h: History | null, now = Date.now()) {
  return (
    !!h &&
    Date.parse(h.fetchedAt) <= now + 60000 &&
    now - Date.parse(h.end + "T23:59:59+06:30") < 10 * DAY &&
    Date.parse(h.end + "T23:59:59+06:30") < now
  );
}
export function mmt(value: string, lang = "en") {
  return (
    new Intl.DateTimeFormat(lang === "my" ? "my-MM" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Yangon",
    }).format(new Date(value)) + " MMT"
  );
}

export type DataState = "current" | "aging" | "stale" | "unavailable";
export function weatherState(w: Weather | null, now = Date.now()): DataState {
  if (!w) return "unavailable";
  if (!weatherFresh(w, now)) return "stale";
  return Math.max(now - Date.parse(w.fetchedAt), now - Date.parse(w.validAt)) >=
    12 * HOUR
    ? "aging"
    : "current";
}
export function historyState(h: History | null, now = Date.now()): DataState {
  if (!h) return "unavailable";
  if (!historyFresh(h, now)) return "stale";
  return now - Date.parse(h.end + "T23:59:59+06:30") >= 8 * DAY
    ? "aging"
    : "current";
}

// Runtime clock checks complement deterministic structural/provider validation.
export function validateOperational(
  input: unknown,
  now = Date.now(),
): Operational {
  const data = operationalSchema.parse(input);
  if (
    [
      data.generatedAt,
      data.weather?.fetchedAt,
      data.history?.fetchedAt,
      data.nino?.fetchedAt,
    ].some((stamp) => stamp && Date.parse(stamp) > now + 60000)
  )
    throw new Error("Snapshot retrieval date is in the future");
  if (data.history && Date.parse(data.history.end + "T23:59:59+06:30") >= now)
    throw new Error("Reanalysis includes an incomplete observation day");
  if (
    data.nino?.months.some((m) => {
      const end = new Date(m.month + "-01T00:00:00Z");
      end.setUTCMonth(end.getUTCMonth() + 1);
      return end.getTime() > now;
    })
  )
    throw new Error("Monthly observation is incomplete");
  return data;
}
