export const regions = [
  ["MM-01", "Sagaing", "စစ်ကိုင်းတိုင်းဒေသကြီး"],
  ["MM-02", "Bago", "ပဲခူးတိုင်းဒေသကြီး"],
  ["MM-03", "Magway", "မကွေးတိုင်းဒေသကြီး"],
  ["MM-04", "Mandalay", "မန္တလေးတိုင်းဒေသကြီး"],
  ["MM-05", "Tanintharyi", "တနင်္သာရီတိုင်းဒေသကြီး"],
  ["MM-06", "Yangon", "ရန်ကုန်တိုင်းဒေသကြီး"],
  ["MM-07", "Ayeyarwady", "ဧရာဝတီတိုင်းဒေသကြီး"],
  ["MM-11", "Kachin", "ကချင်ပြည်နယ်"],
  ["MM-12", "Kayah", "ကယားပြည်နယ်"],
  ["MM-13", "Kayin", "ကရင်ပြည်နယ်"],
  ["MM-14", "Chin", "ချင်းပြည်နယ်"],
  ["MM-15", "Mon", "မွန်ပြည်နယ်"],
  ["MM-16", "Rakhine", "ရခိုင်ပြည်နယ်"],
  ["MM-17", "Shan", "ရှမ်းပြည်နယ်"],
  ["MM-18", "Nay Pyi Taw", "နေပြည်တော် ပြည်ထောင်စုနယ်မြေ"],
] as const;
export const regionIds = regions.map((r) => r[0]);
export function regionName(id: string, lang: "en" | "my") {
  const r = regions.find((r) => r[0] === id);
  return r ? r[lang === "en" ? 1 : 2] : id;
}

// Verified against the official 7 states + 7 regions + 1 Union Territory list;
// map source: MIMU/OCHA COD-AB, see public/data/boundary-source.json.
const aliases: Record<string, string[]> = {
  "MM-01": ["Sagaing Region"],
  "MM-02": ["Bago Region", "Pegu"],
  "MM-03": ["Magway Region", "Magwe"],
  "MM-04": ["Mandalay Region"],
  "MM-05": ["Tanintharyi Region", "Tenasserim"],
  "MM-06": ["Yangon Region", "Rangoon", "Yagon"],
  "MM-07": ["Ayeyarwady Region", "Ayeyawady", "Ayeyarwaddy", "Irrawaddy"],
  "MM-11": ["Kachin State"],
  "MM-12": ["Kayah State", "Karenni"],
  "MM-13": ["Kayin State", "Karen"],
  "MM-14": ["Chin State"],
  "MM-15": ["Mon State"],
  "MM-16": ["Rakhine State", "Arakan"],
  "MM-17": ["Shan State"],
  "MM-18": [
    "Naypyidaw",
    "Nay Pyi Taw Union Territory",
    "Nay Pyi Taw, Union Territory",
    "Nay Pyi Taw Council",
  ],
};
export const canonicalRegions = regions.map(([id, en, my]) => ({
  canonical_region_id: id,
  canonical_name_en: en,
  canonical_name_my: my,
  source_aliases: [id, en, my, ...aliases[id]],
}));
const normalize = (s: string) =>
  s.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
export function resolveRegion(alias: string) {
  const matches = canonicalRegions.filter((r) =>
    r.source_aliases.some((a) => normalize(a) === normalize(alias)),
  );
  if (matches.length !== 1)
    throw Error(`Unknown or ambiguous region alias: ${alias}`);
  return matches[0].canonical_region_id;
}
// Geometry aggregation only. Never broaden a subregion bulletin to the whole state.
export const boundarySubregions: Record<string, string> = {
  "Bago (East)": "MM-02",
  "Bago (West)": "MM-02",
  "Shan (East)": "MM-17",
  "Shan (North)": "MM-17",
  "Shan (South)": "MM-17",
};
