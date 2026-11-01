import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { snapshotSchema } from "../src/data/schema.ts";
import {
  validateOperational,
  weatherFresh,
  historyFresh,
} from "../src/data/operational.ts";
import { validateClimate } from "../src/data/climate.ts";
import { validateHealthAdvisories } from "../src/data/healthAdvisories.ts";
import { validateWeatherDetails } from "../src/data/weatherDetails.ts";
import { validateEnsoIndices, indexIds } from "../src/data/ensoIndices.ts";
import { readFile } from "node:fs/promises";
const packageVersion = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url)),
).version;
const base = new URL(process.argv[2]);
if (base.protocol !== "https:")
  throw Error("Production verification requires HTTPS");
const report = {
  checkedAt: new Date().toISOString(),
  base: base.href,
  resources: [],
  data: {},
  failures: [],
};
async function get(path, type) {
  const response = await fetch(new URL(path, base), {
    cache: "no-cache",
    signal: AbortSignal.timeout(30000),
  });
  const bytes = new Uint8Array(await response.arrayBuffer());
  const entry = {
    path,
    status: response.status,
    type: response.headers.get("content-type"),
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    cacheControl: response.headers.get("cache-control"),
  };
  report.resources.push(entry);
  if (!response.ok) throw Error(`${path}: HTTP ${response.status}`);
  if (type && !entry.type?.includes(type))
    throw Error(`${path}: incorrect MIME type`);
  return new TextDecoder().decode(bytes);
}
try {
  const html = await get("", "text/html");
  if (!html.includes("El Niño Warning System"))
    throw Error("Wrong product HTML");
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)].map(
    (m) => m[1],
  );
  if (!assets.length) throw Error("Root-based build assets missing");
  for (const asset of assets) await get(asset);
  const release = JSON.parse(await get("release.json", "application/json"));
  if (release.version !== packageVersion) throw Error("Wrong release version");
  report.version = release.version;
  const official = snapshotSchema.parse(
    JSON.parse(await get("data/current.json", "application/json")),
  );
  const op = validateOperational(
    JSON.parse(await get("data/operational.json", "application/json")),
  );
  const climate = validateClimate(
    JSON.parse(await get("data/climate.json", "application/json")),
  );
  const registryText = await get(
    "data/indicator-registry.json",
    "application/json",
  );
  const registry = JSON.parse(registryText);
  if (
    registryText !==
    (await readFile(
      new URL("../src/data/indicators.json", import.meta.url),
      "utf8",
    ))
  )
    throw Error(
      "Deployed indicator registry does not match this reviewed source",
    );
  const health = validateHealthAdvisories(
    JSON.parse(await get("data/health-advisories.json", "application/json")),
  );
  const details = validateWeatherDetails(
    JSON.parse(await get("data/weather-details.json", "application/json")),
  );
  const indices = validateEnsoIndices(
    JSON.parse(await get("data/enso-indices.json", "application/json")),
  );
  report.data = {
    officialCoverage: official.regionalCoverage,
    officialAlertCount: official.alerts.length,
    weatherRegions: op.weather?.regions.length,
    weatherValidAt: op.weather?.validAt,
    weatherFresh: weatherFresh(op.weather),
    historyStart: op.history?.start,
    historyEnd: op.history?.end,
    historyFresh: historyFresh(op.history),
    roniSeasons: climate.roni?.points.length,
    probabilitySeasons: climate.probabilities?.rows.length,
    indicators: registry.indicators.length,
    hourlyPoints: details.points.length,
    hourlyPeriods: details.times.length,
    publishedIndices: Object.fromEntries(
      indexIds.map((id) => [
        id,
        {
          periods: indices.series[id]?.points.length ?? 0,
          latest: indices.series[id]?.points.at(-1)?.label ?? null,
          health: indices.health[id],
        },
      ]),
    ),
    providerHealth: op.health,
    healthPublications: {
      coverage: health.coverage,
      ok: health.ok,
      retrievedAt: health.retrievedAt,
      latestIssue: health.items[0]?.issuedAt ?? null,
      items: health.items.length,
    },
  };
  const manifest = JSON.parse(await get("manifest.webmanifest"));
  if (
    manifest.name !== "El Niño Warning System" ||
    manifest.display !== "standalone"
  )
    throw Error("Invalid PWA manifest");
  for (const icon of manifest.icons) await get(icon.src);
  const worker = await get("sw.js", "javascript");
  if (
    !worker.includes("/data/climate.json") ||
    !worker.includes("/data/health-advisories.json") ||
    !worker.includes("/data/weather-details.json") ||
    !worker.includes("/data/enso-indices.json") ||
    !worker.includes("self.registration.scope+'pamphlet/'")
  )
    throw Error("Worker safety policies missing");
  const missing = await fetch(new URL("data/definitely-missing.json", base));
  if (missing.status !== 404)
    throw Error("Missing JSON must be 404, not SPA HTML");
  report.missingDataStatus = missing.status;
} catch (error) {
  report.failures.push(error.message);
}
report.ok = report.failures.length === 0;
await writeFile(
  process.argv[3] || "docs/qa/production-http.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    ok: report.ok,
    base: report.base,
    version: report.version,
    data: report.data,
    failures: report.failures,
  }),
);
if (!report.ok) process.exitCode = 1;
