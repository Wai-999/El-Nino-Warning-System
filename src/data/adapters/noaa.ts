import { bulletinSchema } from "../schema.ts";
export const NOAA_URL =
  "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml";
export function parseNoaa(html: string, now = new Date()) {
  const plain = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&ntilde;|&#241;/g, "ñ")
    .replace(/&#37;|&#x25;|&percnt;/gi, "%")
    .replace(/\s+/g, " ");
  const issued = plain.match(/(?:NWS|NCEP)\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
  const status = plain.match(
    /ENSO Alert System Status:\s*(El Niño Advisory|La Niña Advisory|El Niño Watch|La Niña Watch|Not Active)/,
  );
  const next = plain.match(
    /next ENSO Diagnostics? Discussion is scheduled for\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
  );
  if (!issued || !status || !next)
    throw new Error(
      "NOAA bulletin format unrecognized; retained snapshot is not refreshed",
    );
  const issuedAt = new Date(issued[1] + " 00:00:00 UTC").toISOString();
  const validUntil = new Date(next[1] + " 23:59:59 UTC").toISOString();
  if (
    Date.parse(issuedAt) > now.getTime() ||
    Date.parse(validUntil) - Date.parse(issuedAt) > 45 * 86400000
  )
    throw new Error("NOAA date range invalid");
  const strength = plain.match(
    /(greater than )?(\d{1,3})% chance of a very strong event during the ([^.]{1,160})\./i,
  );
  // Match the stated event and horizon together; unrelated probabilities in
  // the discussion must never become a strength or Myanmar forecast value.
  const rangeStrength = plain.match(
    /strong-to-very strong El Niño likely through ([A-Za-z]+(?:[-–][A-Za-z]+)? \d{4}) \(remaining (greater than )?(?:an? )?(\d{1,3})% chance\)/i,
  );
  return bulletinSchema.parse({
    outlook: rangeStrength
      ? {
          percent: Number(rangeStrength[3]),
          greaterThan: !!rangeStrength[2],
          period: rangeStrength[1],
          eventStrength: "strong-to-very-strong",
          periodRelation: "through",
        }
      : strength
        ? {
            percent: Number(strength[2]),
            greaterThan: !!strength[1],
            period: strength[3],
            eventStrength: "very-strong",
            periodRelation: "during",
          }
        : null,
    status: status[1],
    issuedAt,
    validUntil,
    source: {
      name: "NOAA Climate Prediction Center",
      url: NOAA_URL,
      retrievedAt: now.toISOString(),
    },
    kind: "official-assessment",
    resolution: "Tropical Pacific; not a Myanmar forecast",
  });
}
