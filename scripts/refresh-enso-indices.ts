import { readFile, writeFile, rename } from "node:fs/promises";
import {
  emptyEnsoIndices,
  ensoIndicesSchema,
  indexDefinitions,
  indexIds,
  parseOniV6,
  parseMonthlyIndex,
  validateEnsoIndices,
} from "../src/data/ensoIndices.ts";
const checkedAt = new Date().toISOString();
let data = emptyEnsoIndices;
try {
  data = validateEnsoIndices(
    JSON.parse(await readFile("public/data/enso-indices.json", "utf8")),
  );
} catch {
  /* First ingestion. */
}
data = {
  ...data,
  checkedAt,
  series: { ...data.series },
  health: { ...data.health },
};
for (const id of indexIds) {
  try {
    const response = await fetch(indexDefinitions[id].source, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    const text = await response.text();
    const series =
      id === "oni"
        ? parseOniV6(text, checkedAt)
        : parseMonthlyIndex(text, id, checkedAt);
    // Validate the proposed isolated replacement before replacing last-good data.
    data = ensoIndicesSchema.parse({
      ...data,
      series: { ...data.series, [id]: series },
    });
    data.health[id] = { ok: true, checkedAt, error: null };
    console.log(`${id}: verified source period ${series.points.at(-1)!.label}`);
  } catch (error) {
    data.health[id] = {
      ok: false,
      checkedAt,
      error: (error instanceof Error ? error.message : "Source failed").slice(
        0,
        240,
      ),
    };
    console.error(`${id}: failed; original dated index retained`);
  }
}
await writeFile(
  "public/data/enso-indices.json.tmp",
  JSON.stringify(validateEnsoIndices(data), null, 2) + "\n",
);
await rename(
  "public/data/enso-indices.json.tmp",
  "public/data/enso-indices.json",
);
