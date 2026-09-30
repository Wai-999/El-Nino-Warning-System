import { readFile } from "node:fs/promises";
import { snapshotSchema } from "../src/data/schema.ts";
const data = snapshotSchema.parse(
  JSON.parse(await readFile("public/data/current.json", "utf8")),
);
if (Date.parse(data.checkedAt) > Date.now() + 60000)
  throw new Error("Future snapshot timestamp");
console.log(
  `Valid snapshot. ${data.alerts.length} regional bulletins; coverage: ${data.regionalCoverage}.`,
);
