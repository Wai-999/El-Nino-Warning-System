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

const { operationalSchema } = await import("../src/data/operational.ts");
const op = operationalSchema.parse(
  JSON.parse(await readFile("public/data/operational.json", "utf8")),
);
for (const stamp of [
  op.generatedAt,
  op.weather?.fetchedAt,
  op.history?.fetchedAt,
  op.nino?.fetchedAt,
]) {
  if (stamp && Date.parse(stamp) > Date.now() + 60000)
    throw Error("Future operational retrieval timestamp");
}
console.log(
  `Validated V2 weather regions: ${op.weather?.regions.length ?? 0}; ERA5 regions: ${op.history?.regions.length ?? 0}.`,
);
