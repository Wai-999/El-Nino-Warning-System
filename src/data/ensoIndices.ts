import { z } from "zod";
import { DAY } from "./operational.ts";
import { seasons } from "./climate.ts";

export const indexDefinitions = {
  oni: {
    name: "ONI · ERSSTv6",
    unit: "°C",
    source:
      "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/",
    en: "Three-month Niño 3.4 SST anomaly with centered 30-year baselines updated every five years. Recent estimates can be revised. Distinct from relative RONI; this app does not classify ENSO from ONI.",
    my: "Niño 3.4 ပင်လယ်မျက်နှာပြင်အပူချိန်၏ သုံးလကွာဟချက်ဖြစ်ပြီး နှစ် 30 အခြေခံကာလကို ငါးနှစ်တစ်ကြိမ် ပြောင်းသည်။ နောက်ဆုံးတန်ဖိုး ပြန်ပြင်နိုင်သည်။ နှိုင်းရ RONI နှင့် မတူဘဲ ဤအက်ပ်က ONI ဖြင့် ENSO အဆင့် မသတ်မှတ်ပါ။",
  },
  soi: {
    name: "SOI · CPC standardized",
    unit: "standardized index",
    source: "https://www.cpc.ncep.noaa.gov/data/indices/soi",
    en: "CPC standardized Tahiti-minus-Darwin sea-level-pressure index (the source’s STANDARDIZED DATA block). It is not the raw pressure-anomaly block or the Australian Bureau’s differently scaled SOI. CPC’s FAQ has differing general/SOI baseline wording; no unverified common baseline is asserted here.",
    my: "CPC ရင်းမြစ်၏ STANDARDIZED DATA အပိုင်းမှ တဟီတီနှင့် ဒါဝင် ပင်လယ်ရေမျက်နှာပြင် လေဖိအားခြားနားမှု စံပြုညွှန်းကိန်းဖြစ်သည်။ မူရင်းလေဖိအားကွာဟချက် သို့မဟုတ် ဩစတြေးလျ SOI စကေးနှင့် မတူပါ။ CPC FAQ တွင် အခြေခံကာလဖော်ပြချက် ကွဲပြားသဖြင့် တူညီသောကာလဟု မယူဆပါ။",
  },
  mei: {
    name: "MEI.v2 · NOAA PSL",
    unit: "standardized index",
    source: "https://psl.noaa.gov/enso/mei/data/meiv2.data",
    en: "Published overlapping two-month multivariate ENSO index combining five Pacific ocean/atmosphere fields. January’s column is Dec–Jan, not January alone. PSL documents the JRA55-to-JRA3Q reanalysis transition; the source series may be revised.",
    my: "ပစိဖိတ် သမုဒ္ဒရာနှင့် လေထုဒေတာ ငါးမျိုးပါဝင်သော ထုတ်ပြန်ပြီး နှစ်လထပ်ဆုံ ENSO ညွှန်းကိန်းဖြစ်သည်။ ဇန်နဝါရီကော်လံသည် ဒီဇင်ဘာ–ဇန်နဝါရီ နှစ်လဖြစ်ပြီး ဇန်နဝါရီတစ်လတည်း မဟုတ်ပါ။ PSL က JRA55 မှ JRA3Q ပြောင်းလဲမှုကို ဖော်ပြထားပြီး ရင်းမြစ်ဒေတာ ပြန်ပြင်နိုင်သည်။",
  },
} as const;
export type EnsoIndexId = keyof typeof indexDefinitions;
export const indexIds: EnsoIndexId[] = ["oni", "soi", "mei"];
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const pointSchema = z.object({
  label: z.string().min(1),
  startMonth: month,
  endMonth: month,
  completedAt: z.string().datetime(),
  value: z.number().finite().min(-20).max(20),
});
const seriesSchema = z.object({
  source: z.string().url(),
  retrievedAt: z.string().datetime(),
  points: z.array(pointSchema).min(360).max(4000),
});
export const ensoIndicesSchema = z
  .object({
    version: z.literal(1),
    checkedAt: z.string().datetime(),
    series: z.object({
      oni: seriesSchema.nullable(),
      soi: seriesSchema.nullable(),
      mei: seriesSchema.nullable(),
    }),
    health: z.record(
      z.string(),
      z.object({
        ok: z.boolean(),
        checkedAt: z.string().datetime(),
        error: z.string().nullable(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const bad = (message: string) => ctx.addIssue({ code: "custom", message });
    for (const id of indexIds) {
      const series = data.series[id];
      if (!series) continue;
      if (series.source !== indexDefinitions[id].source)
        bad("Wrong index source");
      for (const [i, point] of series.points.entries()) {
        const start = new Date(point.startMonth + "-01T00:00:00Z"),
          end = new Date(point.endMonth + "-01T00:00:00Z");
        const width =
          (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
          end.getUTCMonth() -
          start.getUTCMonth() +
          1;
        end.setUTCMonth(end.getUTCMonth() + 1);
        if (
          width !== { oni: 3, soi: 1, mei: 2 }[id] ||
          end.toISOString() !== point.completedAt ||
          +end > Date.parse(series.retrievedAt) ||
          (i > 0 && point.completedAt <= series.points[i - 1].completedAt)
        )
          bad("Incomplete, duplicated or mislabelled index period");
      }
    }
  });
export type EnsoIndices = z.infer<typeof ensoIndicesSchema>;
export const emptyEnsoIndices: EnsoIndices = {
  version: 1,
  checkedAt: "1970-01-01T00:00:00.000Z",
  series: { oni: null, soi: null, mei: null },
  health: {},
};
export function validateEnsoIndices(input: unknown, now = Date.now()) {
  const data = ensoIndicesSchema.parse(input);
  if (
    [
      data.checkedAt,
      ...indexIds.map((id) => data.series[id]?.retrievedAt),
    ].some((time) => time && Date.parse(time) > now + 60000)
  )
    throw Error("Future index retrieval timestamp");
  return data;
}
const ym = (date: Date) => date.toISOString().slice(0, 7);
function point(
  year: number,
  endMonth: number,
  length: number,
  value: number,
  label: string,
) {
  return {
    label,
    value,
    startMonth: ym(new Date(Date.UTC(year, endMonth - length + 1, 1))),
    endMonth: ym(new Date(Date.UTC(year, endMonth, 1))),
    completedAt: new Date(Date.UTC(year, endMonth + 1, 1)).toISOString(),
  };
}
export function parseOniV6(html: string, retrievedAt: string) {
  if (!/ERSSTv6|ERSST\.v6/.test(html))
    throw Error("ONI version not identified");
  const table = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)]
    .map((match) => match[1])
    .find((text) => /DJF/.test(text) && /NDJ/.test(text));
  if (!table) throw Error("ONI season table missing");
  const points: z.infer<typeof pointSchema>[] = [];
  const rows = [
    ...table.matchAll(
      /<tr\b[^>]*>([\s\S]*?)(?=<tr\b|<\/tr>|<\/tbody>|<\/table>|$)/gi,
    ),
  ]
    .map((row) =>
      [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
        cell[1]
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;|&#160;/g, " ")
          .trim(),
      ),
    )
    .filter((cells) => /^\d{4}$/.test(cells[0] || ""));
  for (const [rowIndex, cells] of rows.entries()) {
    if (
      cells.length < 2 ||
      cells.length > 13 ||
      (rowIndex < rows.length - 1 && cells.length !== 13)
    )
      throw Error("Malformed ONI year row");
    let gap = false;
    for (let i = 0; i < 12; i++) {
      const cell = cells[i + 1];
      if (!cell) {
        gap = true;
        continue;
      }
      if (gap || !/^-?\d+(\.\d+)?$/.test(cell))
        throw Error("Malformed ONI value or internal gap");
      points.push(
        point(
          Number(cells[0]),
          i + 1,
          3,
          Number(cell),
          `${seasons[i]} ${cells[0]}`,
        ),
      );
    }
  }
  return seriesSchema.parse({
    source: indexDefinitions.oni.source,
    retrievedAt,
    points,
  });
}
export function parseMonthlyIndex(
  text: string,
  id: "soi" | "mei",
  retrievedAt: string,
) {
  if (id === "soi") {
    const split = text.split(/STANDARDIZED\s+DATA/);
    if (split.length !== 2 || !/STAND TAHITI - STAND DARWIN/.test(text))
      throw Error("Standardized SOI block missing or ambiguous");
    text = split[1];
  } else if (
    !/Multivariate ENSO Index Version 2|Row values are 2 month seasons/.test(
      text,
    )
  )
    throw Error("MEI.v2 identity missing");
  const points: z.infer<typeof pointSchema>[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (id === "mei" && /^\s*\d{4}\s+\d{4}\s*$/.test(line)) continue;
    if (!/^\s*(19|20|21)\d{2}(?:\s|[-+])/.test(line)) continue;
    const year = Number(line.trim().slice(0, 4));
    const values = line
      .trim()
      .slice(4)
      .match(/[-+]?\d+(?:\.\d+)?/g);
    if (!values || values.length !== 12)
      throw Error("Malformed monthly index year");
    for (const [i, token] of values.entries()) {
      const value = Number(token);
      if (value === -999.9 || value === -999) continue;
      const p = point(
        year,
        i,
        id === "mei" ? 2 : 1,
        value,
        id === "mei"
          ? `${["DJ", "JF", "FM", "MA", "AM", "MJ", "JJ", "JA", "AS", "SO", "ON", "ND"][i]} ${year}`
          : `${year}-${String(i + 1).padStart(2, "0")}`,
      );
      points.push(p);
    }
  }
  return seriesSchema.parse({
    source: indexDefinitions[id].source,
    retrievedAt,
    points,
  });
}
export function indexFresh(
  series: EnsoIndices["series"][EnsoIndexId],
  now = Date.now(),
) {
  return (
    !!series &&
    Date.parse(series.retrievedAt) <= now + 60000 &&
    now - Date.parse(series.retrievedAt) < 45 * DAY &&
    now - Date.parse(series.points.at(-1)!.completedAt) < 93 * DAY
  );
}
export async function loadEnsoIndices() {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/enso-indices.json`,
    { cache: "no-store", signal: AbortSignal.timeout(12000) },
  );
  if (!response.ok) throw Error("ENSO indices unavailable");
  return {
    data: validateEnsoIndices(await response.json()),
    cached: response.headers.get("X-Mokinn-Cache") === "true",
  };
}
