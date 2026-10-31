import {
  RONI_URL,
  PROBABILITY_URL,
  roniSchema,
  probabilitySchema,
} from "../climate.ts";
export function parseRoni(text: string, retrievedAt: string) {
  if (!/^SEAS\s+YR\s+ANOM/m.test(text))
    throw Error("Unrecognized NOAA RONI header");
  const points = text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const m = line.trim().match(/^(\w{3})\s+(\d{4})\s+(-?\d+(?:\.\d+)?)$/);
      if (!m) throw Error("Malformed RONI row");
      return { season: m[1], year: Number(m[2]), anomaly: Number(m[3]) };
    });
  return roniSchema.parse({ source: RONI_URL, retrievedAt, points });
}
export function parseProbabilities(html: string, retrievedAt: string) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const issued = html.match(/Issued\s+(\w+)\s+(\d{4})/i);
  const month = issued
    ? months.findIndex((m) => m.toLowerCase() === issued[1].toLowerCase())
    : -1;
  const table = html.match(
    /<table\b[^>]*id=["']probabilities-table["'][^>]*>([\s\S]*?)<\/table>/i,
  )?.[1];
  if (
    !issued ||
    month < 0 ||
    !table ||
    !/La Ni&ntilde;a[\s\S]*Neutral[\s\S]*El Ni&ntilde;o/.test(table)
  )
    throw Error("Unrecognized NOAA probability table");
  const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .filter((m) => /scope=["']row["']/.test(m[1]))
    .map((m) => {
      const season = m[1].match(/<abbr[^>]*>\s*(\w{3})/)?.[1];
      const values = [...m[1].matchAll(/<td[^>]*>\s*(\d+)\s*<\/td>/gi)].map(
        (v) => Number(v[1]),
      );
      if (values.length !== 3) throw Error("Malformed NOAA probability row");
      return {
        season,
        laNina: values[0],
        neutral: values[1],
        elNino: values[2],
      };
    });
  return probabilitySchema.parse({
    source: PROBABILITY_URL,
    retrievedAt,
    issueMonth: `${issued[2]}-${String(month + 1).padStart(2, "0")}`,
    rows,
  });
}
