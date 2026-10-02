import { readFile, writeFile, rename } from "node:fs/promises";
import { snapshotSchema } from "../src/data/schema.ts";
import { validateOperational } from "../src/data/operational.ts";
import {
  validateArchive,
  emptyArchive,
  buildSummary,
  appendSummary,
} from "../src/data/archive.ts";
const path = "public/data/archive.json";
const now = Date.now();
const data = snapshotSchema.parse(
  JSON.parse(await readFile("public/data/current.json", "utf8")),
);
const op = validateOperational(
  JSON.parse(await readFile("public/data/operational.json", "utf8")),
  now,
);
let previous = emptyArchive;
try {
  previous = validateArchive(JSON.parse(await readFile(path, "utf8")), now);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
if (!op.weather && !op.history && !data.enso)
  throw Error("No validated evidence; prior archive retained");
const archive = appendSummary(previous, buildSummary(op, data, now), [
  ...data.history,
  ...data.alerts,
]);
await writeFile(path + ".tmp", JSON.stringify(archive, null, 2) + "\n");
await rename(path + ".tmp", path);
console.log(
  `Validated archive: ${archive.snapshots.length} snapshots, ${archive.bulletins.length} bulletins`,
);
