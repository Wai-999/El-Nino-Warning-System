import { readFile, writeFile } from "node:fs/promises";
import { parseNoaa, NOAA_URL } from "../src/data/adapters/noaa.ts";
import { snapshotSchema, emptySnapshot } from "../src/data/schema.ts";
let previous = emptySnapshot;
try {
  previous = snapshotSchema.parse(
    JSON.parse(await readFile("public/data/current.json", "utf8")),
  );
} catch {
  /* First ingestion. */
}
const checkedAt = new Date().toISOString();
let enso = previous.enso,
  ensoFetch: "ok" | "failed" = "failed";
try {
  const r = await fetch(NOAA_URL, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`NOAA HTTP ${r.status}`);
  enso = parseNoaa(await r.text(), new Date(checkedAt));
  ensoFetch = "ok";
  console.log(
    `Verified NOAA bulletin: ${enso.status}, issued ${enso.issuedAt}`,
  );
} catch (e) {
  console.error(e instanceof Error ? e.message : "NOAA retrieval failed");
}
const data = snapshotSchema.parse({ ...previous, checkedAt, enso, ensoFetch });
await writeFile(
  "public/data/current.json",
  JSON.stringify(data, null, 2) + "\n",
);
// Failures are published as unavailable/stale and also surfaced by the workflow health job.
await writeFile(
  "public/data/ingestion-health.json",
  JSON.stringify({ checkedAt, ok: ensoFetch === "ok" }, null, 2) + "\n",
);
