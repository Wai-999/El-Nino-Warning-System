import { regionIds, regionName } from "../data/regions";
import type { Lang } from "../app/context";
export const countryId = "MM";
export function canonicalLocation(value: string | null) {
  return value && regionIds.includes(value as (typeof regionIds)[number])
    ? value
    : countryId;
}
export function locationName(id: string, lang: Lang) {
  return id === countryId
    ? lang === "en"
      ? "Myanmar"
      : "မြန်မာနိုင်ငံ"
    : regionName(id, lang);
}
