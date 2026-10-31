import { z } from "zod";
import { DAY } from "./operational.ts";

export const RONI_URL =
  "https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt";
export const PROBABILITY_URL =
  "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities/";
export const seasons = [
  "DJF",
  "JFM",
  "FMA",
  "MAM",
  "AMJ",
  "MJJ",
  "JJA",
  "JAS",
  "ASO",
  "SON",
  "OND",
  "NDJ",
] as const;
const roniPoint = z.object({
  season: z.enum(seasons),
  year: z.number().int().min(1950).max(2200),
  anomaly: z.number().finite().min(-10).max(10),
});
export const roniSchema = z
  .object({
    source: z.literal(RONI_URL),
    retrievedAt: z.string().datetime(),
    points: z.array(roniPoint).min(360).max(3012),
  })
  .superRefine((d, c) => {
    const keys = d.points.map((p) => p.year * 12 + seasons.indexOf(p.season));
    if (keys.some((k, i) => i > 0 && k <= keys[i - 1]))
      c.addIssue({
        code: "custom",
        message: "RONI series must be unique and chronological",
      });
    // A centered three-month season cannot be complete until its final month ends.
    if (
      d.points.some(
        (p) =>
          Date.UTC(p.year, seasons.indexOf(p.season) + 2, 1) >
          Date.parse(d.retrievedAt),
      )
    )
      c.addIssue({ code: "custom", message: "Incomplete RONI season" });
  });
export const probabilitySchema = z
  .object({
    source: z.literal(PROBABILITY_URL),
    retrievedAt: z.string().datetime(),
    issueMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
    rows: z
      .array(
        z.object({
          season: z.enum(seasons),
          laNina: z.number().int().min(0).max(100),
          neutral: z.number().int().min(0).max(100),
          elNino: z.number().int().min(0).max(100),
        }),
      )
      .length(9),
  })
  .superRefine((d, c) => {
    if (Date.parse(d.issueMonth + "-01T00:00:00Z") > Date.parse(d.retrievedAt))
      c.addIssue({ code: "custom", message: "Future outlook issue month" });
    for (const [i, r] of d.rows.entries()) {
      if (r.laNina + r.neutral + r.elNino !== 100)
        c.addIssue({
          code: "custom",
          message: "Probabilities must sum to 100",
        });
      if (
        i > 0 &&
        (seasons.indexOf(r.season) -
          seasons.indexOf(d.rows[i - 1].season) +
          12) %
          12 !==
          1
      )
        c.addIssue({
          code: "custom",
          message: "Outlook seasons must be consecutive",
        });
    }
  });
export const climateSchema = z.object({
  version: z.literal(1),
  checkedAt: z.string().datetime(),
  roni: roniSchema.nullable(),
  probabilities: probabilitySchema.nullable(),
  health: z.record(
    z.string(),
    z.object({
      ok: z.boolean(),
      checkedAt: z.string().datetime(),
      error: z.string().nullable(),
    }),
  ),
});
export type ClimateSnapshot = z.infer<typeof climateSchema>;
export const emptyClimate: ClimateSnapshot = {
  version: 1,
  checkedAt: "1970-01-01T00:00:00.000Z",
  roni: null,
  probabilities: null,
  health: {},
};
export function validateClimate(input: unknown, now = Date.now()) {
  const d = climateSchema.parse(input);
  if (
    [d.checkedAt, d.roni?.retrievedAt, d.probabilities?.retrievedAt].some(
      (s) => s && Date.parse(s) > now + 60000,
    )
  )
    throw Error("Future climate retrieval timestamp");
  return d;
}
export function roniFresh(data: ClimateSnapshot["roni"], now: number) {
  if (!data) return false;
  const latest = data.points.at(-1)!;
  const completed = Date.UTC(
    latest.year,
    seasons.indexOf(latest.season) + 2,
    1,
  );
  return (
    Date.parse(data.retrievedAt) <= now + 60000 &&
    now - Date.parse(data.retrievedAt) < 45 * DAY &&
    completed <= now &&
    now - completed < 75 * DAY
  );
}
export function probabilitiesFresh(
  data: ClimateSnapshot["probabilities"],
  now: number,
) {
  // The source provides only an issue month: no fabricated precise issue/expiry time.
  return (
    !!data &&
    Date.parse(data.retrievedAt) <= now + 60000 &&
    now - Date.parse(data.issueMonth + "-01T00:00:00Z") < 62 * DAY
  );
}
export async function loadClimate() {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}data/climate.json`, {
      cache: "no-cache",
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) throw Error("Climate snapshot unavailable");
    const data = validateClimate(await r.json());
    try {
      localStorage.setItem("el-nino-climate", JSON.stringify(data));
    } catch {
      /* Optional cache. */
    }
    return {
      data,
      cached: r.headers.get("X-Mokinn-Cache") === "true",
      error: false,
    };
  } catch {
    try {
      const data = validateClimate(
        JSON.parse(localStorage.getItem("el-nino-climate") || "null"),
      );
      return { data, cached: true, error: true };
    } catch {
      return { data: emptyClimate, cached: false, error: true };
    }
  }
}
