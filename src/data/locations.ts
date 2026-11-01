import { z } from "zod";
import source from "./admin-2024.json" with { type: "json" };
import aliasEvidence from "./township-aliases.json" with { type: "json" };
import settlementSource from "./settlements.json" with { type: "json" };
import settlementAliases from "./settlement-aliases.json" with { type: "json" };
import {
  boundarySubregions,
  canonicalRegions,
  resolveRegion,
  regionName,
} from "./regions.ts";
const row = z.object({
  code: z.string().regex(/^MMR[A-Z0-9]*$/),
  en: z.string().min(1),
  my: z.string().min(1),
  parentCode: z.string().nullable(),
  lat: z.number().min(9).max(29),
  lon: z.number().min(92).max(102),
});
export const geographySchema = z
  .object({
    source: z.literal("https://data.humdata.org/dataset/cod-ab-mmr"),
    license: z.literal("CC BY 3.0 IGO"),
    workbookSha256: z.string().regex(/^[a-f0-9]{64}$/),
    validOn: z.literal("2024-02-15"),
    reviewedOn: z.string(),
    resourceUpdatedAt: z.string(),
    levels: z.object({
      adm0: row.array().length(1),
      adm1: row.array().length(18),
      adm2: row.array().length(80),
      adm3: row.array().length(330),
    }),
  })
  .superRefine((data, context) => {
    const levels = [
      data.levels.adm0,
      data.levels.adm1,
      data.levels.adm2,
      data.levels.adm3,
    ];
    levels.forEach((rows, level) => {
      if (
        new Set(rows.map((r) => r.code)).size !== rows.length ||
        rows.some((r) =>
          level === 0
            ? r.parentCode !== null
            : !levels[level - 1].some((p) => p.code === r.parentCode),
        )
      )
        context.addIssue({
          code: "custom",
          message: "Duplicate code or missing administrative parent",
        });
    });
  });
export const geography = geographySchema.parse(source);
export const townships = geography.levels.adm3.map((t) => {
  const district = geography.levels.adm2.find((d) => d.code === t.parentCode)!;
  const admin1 = geography.levels.adm1.find(
    (a) => a.code === district.parentCode,
  )!;
  const regionId = boundarySubregions[admin1.en] || resolveRegion(admin1.en);
  return {
    ...t,
    regionId,
    district,
    admin1,
    aliases: aliasEvidence
      .filter((a) => a.pcode === t.code)
      .map((a) => a.alias),
  };
});
export type Township = (typeof townships)[number];
export const townshipByCode = (code: string | null) =>
  townships.find((t) => t.code === code);
export const settlementsSchema = z
  .object({
    version: z.literal(1),
    source: z.literal("https://download.geonames.org/export/dump/MM.zip"),
    namesSource: z.literal(
      "https://download.geonames.org/export/dump/alternatenames/MM.zip",
    ),
    license: z.literal("CC BY 4.0"),
    retrievedOn: z.string(),
    sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    namesSha256: z.string().regex(/^[a-f0-9]{64}$/),
    geometrySha256: z.string().regex(/^[a-f0-9]{64}$/),
    boundarySource: z.literal("https://data.humdata.org/dataset/cod-ab-mmr"),
    boundaryValidOn: z.literal("2024-02-15"),
    boundaryLicense: z.literal("CC BY 3.0 IGO"),
    selection: z.string(),
    parentMethod: z.string(),
    points: z
      .array(
        z.object({
          id: z.string().regex(/^\d+$/),
          en: z.string().min(1),
          my: z.string().min(1).nullable(),
          aliases: z.array(z.string()),
          lat: z.number().min(9).max(29),
          lon: z.number().min(92).max(102),
          featureCode: z.enum(["PPLC", "PPLA", "PPLA2", "PPLA3", "PPL"]),
          townshipCode: z.string(),
          upstreamTownshipCode: z.string().nullable(),
          modifiedOn: z.string(),
        }),
      )
      .min(1),
  })
  .superRefine((data, context) => {
    if (
      new Set(data.points.map((p) => p.id)).size !== data.points.length ||
      data.points.some((p) => !townshipByCode(p.townshipCode))
    )
      context.addIssue({
        code: "custom",
        message: "Duplicate settlement or unknown reference township",
      });
  });
export const settlementReference = settlementsSchema.parse(settlementSource);
export const settlements = settlementReference.points.map((p) => ({
  ...p,
  aliases: [
    ...p.aliases,
    ...settlementAliases
      .filter((alias) => alias.id === p.id)
      .map((alias) => alias.alias),
  ],
  regionId: townshipByCode(p.townshipCode)!.regionId,
}));
export type Settlement = (typeof settlements)[number];
export const settlementById = (id: string | null) =>
  settlements.find((p) => p.id === id);
export const settlementName = (point: Settlement, lang: "en" | "my") =>
  lang === "my" && point.my ? point.my : point.en;
export const normalizeSearch = (s: string) =>
  s
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/[၀-၉]/g, (d) => String("၀၁၂၃၄၅၆၇၈၉".indexOf(d)))
    .replace(/[\s\p{P}]/gu, "");
function nearSpelling(a: string, b: string) {
  if (!/^[a-z]{5,}$/.test(a) || Math.abs(a.length - b.length) > 1) return false;
  let i = 0,
    j = 0,
    edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}
function matchesPlace(query: string, fields: string[]) {
  const key = normalizeSearch(query),
    normalized = fields.map(normalizeSearch);
  if (
    !key ||
    normalized.some((field) => field.includes(key) || nearSpelling(key, field))
  )
    return true;
  const words = query.trim().split(/\s+/).map(normalizeSearch).filter(Boolean);
  return (
    words.length > 1 &&
    words.every((word) => normalized.some((field) => field.includes(word)))
  );
}
export function searchTownships(query: string, regionId?: string) {
  return townships.filter(
    (t) =>
      (!regionId || t.regionId === regionId) &&
      matchesPlace(query, [
        t.code,
        t.en,
        t.my,
        ...t.aliases,
        t.district.en,
        t.district.my,
        t.admin1.en,
        t.admin1.my,
        ...(canonicalRegions.find((r) => r.canonical_region_id === t.regionId)
          ?.source_aliases || []),
      ]),
  );
}
export function searchSettlements(query: string, regionId?: string) {
  return settlements.filter(
    (point) =>
      (!regionId || point.regionId === regionId) &&
      matchesPlace(query, [
        point.id,
        point.en,
        point.my || "",
        ...point.aliases,
        point.townshipCode,
        townshipByCode(point.townshipCode)!.en,
        townshipByCode(point.townshipCode)!.my,
        regionName(point.regionId, "en"),
        regionName(point.regionId, "my"),
      ]),
  );
}
export function savedPlace(id: string) {
  if (id.startsWith("settlement:")) {
    const settlement = settlementById(id.slice(11));
    return settlement
      ? {
          id,
          regionId: settlement.regionId,
          township: townshipByCode(settlement.townshipCode)!,
          settlement,
        }
      : null;
  }
  if (id.startsWith("township:")) {
    const township = townshipByCode(id.slice(9));
    return township
      ? { id, regionId: township.regionId, township, settlement: null }
      : null;
  }
  const regionId = id.slice(7);
  return id.startsWith("region:") &&
    canonicalRegions.some((r) => r.canonical_region_id === regionId)
    ? { id, regionId, township: null, settlement: null }
    : null;
}
export function placeName(id: string, lang: "en" | "my") {
  const p = savedPlace(id);
  return p?.settlement
    ? settlementName(p.settlement, lang)
    : p?.township
      ? p.township[lang]
      : p
        ? regionName(p.regionId, lang)
        : "—";
}
export function readSavedPlaces(raw: string | null) {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter(
              (x): x is string =>
                typeof x === "string" &&
                (!!savedPlace(x) ||
                  /^(?:township:MMR[A-Z0-9]{6,12}|region:MM-\d{2}|settlement:\d{1,12})$/.test(
                    x,
                  )),
            ),
          ),
        ].slice(0, 12)
      : [];
  } catch {
    return [];
  }
}
