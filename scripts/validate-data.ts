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

const { validateArchive } = await import("../src/data/archive.ts");
const archive = validateArchive(
  JSON.parse(await readFile("public/data/archive.json", "utf8")),
);
console.log(`Validated ${archive.snapshots.length} archived summaries.`);

const { validateClimate } = await import("../src/data/climate.ts");
const climate = validateClimate(
  JSON.parse(await readFile("public/data/climate.json", "utf8")),
);
console.log(
  `Validated NOAA climate: ${climate.roni?.points.length ?? 0} RONI seasons; ${climate.probabilities?.rows.length ?? 0} probability rows.`,
);
const registry = JSON.parse(await readFile("src/data/indicators.json", "utf8"));
if (
  new Set(registry.indicators.map((i: { id: string }) => i.id)).size !==
  registry.indicators.length
)
  throw Error("Duplicate indicator ID");
console.log(`Validated ${registry.indicators.length} registry entries.`);
const { geography, settlements } = await import("../src/data/locations.ts");
console.log(
  `Validated ${geography.levels.adm3.length} townships and ${settlements.length} distinct settlement points with reference parents.`,
);
const { validateHealthAdvisories } =
  await import("../src/data/healthAdvisories.ts");
const health = validateHealthAdvisories(
  JSON.parse(await readFile("public/data/health-advisories.json", "utf8")),
);
console.log(
  `Validated ${health.items.length} official WHO publication records; expiry is unknown.`,
);
const { validateWeatherDetails } =
  await import("../src/data/weatherDetails.ts");
const details = validateWeatherDetails(
  JSON.parse(await readFile("public/data/weather-details.json", "utf8")),
);
console.log(
  `Validated ${details.points.length} representative forecast points × ${details.times.length} hours.`,
);
const { validateEnsoIndices, indexIds } =
  await import("../src/data/ensoIndices.ts");
const indices = validateEnsoIndices(
  JSON.parse(await readFile("public/data/enso-indices.json", "utf8")),
);
console.log(
  `Validated published ENSO indices: ${indexIds.map((id) => `${id} ${indices.series[id]?.points.length ?? 0} periods`).join(", ")}.`,
);
