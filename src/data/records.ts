import { z } from "zod";
import { regionIds } from "./regions.ts";
import { reviewedAt, sourceById } from "./sources.ts";
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (d) =>
      Number.isFinite(Date.parse(d)) &&
      new Date(d).toISOString().slice(0, 10) === d,
    "Invalid calendar date",
  );
const bilingual = z.tuple([z.string().min(1), z.string().min(1)]);
export const recordHazards = [
  "enso",
  "heat",
  "drought",
  "rainfall",
  "flood",
  "agriculture",
  "health",
  "fire",
  "water",
] as const;
export const recordSchema = z
  .object({
    id: z.string(),
    start: date,
    end: date,
    eventPrecision: z.literal("month"),
    publishedAt: date,
    publishedPrecision: z.enum(["day", "month"]),
    reviewedAt: z.string().datetime({ offset: true }),
    regionIds: z.array(
      z
        .string()
        .refine((id) => regionIds.includes(id as (typeof regionIds)[number])),
    ),
    scope: z.enum([
      "Myanmar national; regions not assigned",
      "Named parts of regions",
    ]),
    hazards: z.array(z.enum(recordHazards)),
    phase: z.enum(["El Niño", "La Niña", "Neutral", "Not attributed"]),
    evidence: z.enum(["reported-impact", "official-assessment"]),
    sourceId: z.string().refine((id) => {
      try {
        sourceById(id);
        return true;
      } catch {
        return false;
      }
    }, "Unknown source ID"),
    title: bilingual,
    summary: bilingual,
    limitation: bilingual,
  })
  .superRefine((r, c) => {
    if (
      r.end < r.start ||
      r.publishedAt < r.end ||
      Date.parse(r.reviewedAt) < Date.parse(r.publishedAt)
    )
      c.addIssue({ code: "custom", message: "Invalid historical period" });
    if (new Set(r.regionIds).size !== r.regionIds.length)
      c.addIssue({ code: "custom", message: "Duplicate record region" });
  });
export type HistoricalRecord = z.infer<typeof recordSchema>;
export const historicalRecords: HistoricalRecord[] = z
  .array(recordSchema)
  .parse([
    {
      id: "mm-enso-2015-16",
      start: "2015-07-01",
      end: "2016-03-01",
      publishedAt: "2016-03-01",
      publishedPrecision: "month",
      eventPrecision: "month",
      reviewedAt,
      regionIds: [],
      scope: "Myanmar national; regions not assigned",
      hazards: ["enso", "rainfall", "flood", "water", "agriculture"],
      phase: "El Niño",
      evidence: "reported-impact",
      sourceId: "fao2016",
      title: [
        "2015–16: wet and dry pressures in one El Niño period",
        "၂၀၁၅–၁၆ — အယ်လ်နီညိုကာလတစ်ခုအတွင်း ရေများ/ရေနည်း ဖိအား",
      ],
      summary: [
        "FAO described Myanmar recovering from July–August 2015 floods while facing drier conditions from November and water-shortage concerns in early 2016.",
        "FAO အရ မြန်မာသည် ၂၀၁၅ ဇူလိုင်–ဩဂုတ် ရေကြီးမှုမှ ပြန်လည်ထူထောင်နေရင်း နိုဝင်ဘာမှစ၍ ခြောက်သွေ့မှုနှင့် ၂၀၁၆ အစောပိုင်း ရေရှားပါးနိုင်မှုကို ရင်ဆိုင်ခဲ့ရသည်။",
      ],
      limitation: [
        "National report, not a measured state-level drought index. No proof that ENSO caused any particular flood; no local probability or crop-loss estimate. Publication precision: March 2016.",
        "နိုင်ငံအဆင့် အစီရင်ခံစာဖြစ်ပြီး တိုင်း/ပြည်နယ် မိုးခေါင်ညွှန်းကိန်း မဟုတ်ပါ။ ရေကြီးမှုကို ENSO ကြောင့်ဟု မအတည်ပြုပါ။ ဒေသဖြစ်နိုင်နှုန်းနှင့် သီးနှံဆုံးရှုံးမှု မတွက်ပါ။ ထုတ်ပြန်ကာလ — ၂၀၁၆ မတ်။",
      ],
    },
    {
      id: "mm-crops-2026-jul-aug",
      start: "2026-07-01",
      end: "2026-08-31",
      publishedAt: "2026-09-18",
      publishedPrecision: "day",
      eventPrecision: "month",
      reviewedAt,
      regionIds: ["MM-16", "MM-01", "MM-07"],
      scope: "Named parts of regions",
      hazards: ["rainfall", "flood", "agriculture"],
      phase: "Not attributed",
      evidence: "reported-impact",
      sourceId: "fao",
      title: [
        "2026: localized crop impacts after heavy rain and flooding",
        "၂၀၂၆ — မိုးသည်းနှင့် ရေကြီးပြီးနောက် အချို့ဒေသ သီးနှံသက်ရောက်မှု",
      ],
      summary: [
        "FAO’s September brief reports localized crop losses after July–August rainfall and flooding in parts of Rakhine, Sagaing and Ayeyarwady.",
        "FAO စက်တင်ဘာစာတမ်းတွင် ဇူလိုင်–ဩဂုတ် မိုးရေနှင့် ရေကြီးမှုအပြီး ရခိုင်၊ စစ်ကိုင်းနှင့် ဧရာဝတီ အချို့ဒေသ သီးနှံဆုံးရှုံးမှုကို ဖော်ပြထားသည်။",
      ],
      limitation: [
        "Named areas are not whole-region loss estimates. No ENSO attribution is assigned. This is a past reported impact, not an active flood bulletin or current forecast.",
        "ဖော်ပြဒေသများသည် ဒေသတစ်ခုလုံး ဆုံးရှုံးမှုခန့်မှန်းချက် မဟုတ်ပါ။ ENSO နှင့် အကြောင်းရင်းဆက်စပ်မှု မသတ်မှတ်ပါ။ ယခင်ဖြစ်ရပ်မှတ်တမ်းဖြစ်၍ လက်ရှိရေကြီးကြေညာချက် သို့မဟုတ် ခန့်မှန်းချက် မဟုတ်ပါ။",
      ],
    },
  ]);
export type RecordFilter = {
  year: string;
  region: string;
  hazard: string;
  phase: string;
  evidence: string;
};
export function filterRecords(
  records: HistoricalRecord[],
  filter: RecordFilter,
) {
  return records.filter(
    (r) =>
      (filter.year === "all" ||
        (Number(filter.year) >= Number(r.start.slice(0, 4)) &&
          Number(filter.year) <= Number(r.end.slice(0, 4)))) &&
      (filter.region === "all" || r.regionIds.includes(filter.region)) &&
      (filter.hazard === "all" ||
        r.hazards.includes(filter.hazard as (typeof recordHazards)[number])) &&
      (filter.phase === "all" || r.phase === filter.phase) &&
      (filter.evidence === "all" || r.evidence === filter.evidence),
  );
}
