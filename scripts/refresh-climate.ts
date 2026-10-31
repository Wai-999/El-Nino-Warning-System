import { readFile, writeFile, rename } from "node:fs/promises";
import {
  climateSchema,
  emptyClimate,
  RONI_URL,
  PROBABILITY_URL,
} from "../src/data/climate.ts";
import {
  parseRoni,
  parseProbabilities,
} from "../src/data/adapters/ensoClimate.ts";
const checkedAt = new Date().toISOString();
let out = emptyClimate;
try {
  out = climateSchema.parse(
    JSON.parse(await readFile("public/data/climate.json", "utf8")),
  );
} catch {
  /* First ingestion. */
}
out = { ...out, checkedAt, health: { ...out.health } };
for (const [id, url] of [
  ["roni", RONI_URL],
  ["probabilities", PROBABILITY_URL],
] as const) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(25000),
      headers: {
        "User-Agent":
          "El-Nino-Warning-System/3.0 (+https://github.com/Wai-999/El-Nino-Warning-System)",
      },
    });
    if (!r.ok) throw Error(`HTTP ${r.status}`);
    const text = await r.text();
    if (id === "roni") out.roni = parseRoni(text, checkedAt);
    else out.probabilities = parseProbabilities(text, checkedAt);
    out.health[id] = { ok: true, checkedAt, error: null };
    console.log(`${id}: validated NOAA source`);
  } catch (e) {
    out.health[id] = {
      ok: false,
      checkedAt,
      error: (e instanceof Error ? e.message : "Source failed").slice(0, 240),
    };
    console.error(`${id}: failed; retaining original dated data`);
  }
}
await writeFile(
  "public/data/climate.json.tmp",
  JSON.stringify(climateSchema.parse(out), null, 2) + "\n",
);
await rename("public/data/climate.json.tmp", "public/data/climate.json");
