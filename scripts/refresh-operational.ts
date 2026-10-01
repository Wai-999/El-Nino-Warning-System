import { readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { setTimeout as pause } from "node:timers/promises";
import {
  sampleSchema,
  operationalSchema,
  emptyOperational,
  weatherSchema,
  historySchema,
  indexSchema,
  DAY,
  type Operational,
} from "../src/data/operational.ts";
import {
  requestSeries,
  aggregateForecast,
  aggregateDaily,
} from "../src/data/providers/openMeteo.ts";
import {
  mean,
  sum,
  round,
  departure,
  trailingDryDays,
} from "../src/climate/calculations.ts";
const now = new Date(),
  stamp = now.toISOString();
const sampleText = await readFile("scripts/cache/samples.json", "utf8");
const samples = sampleSchema
  .array()
  .length(45)
  .parse(JSON.parse(sampleText).samples);
const sampleHash = createHash("sha256")
  .update(JSON.stringify(samples))
  .digest("hex");
let out: Operational = emptyOperational;
try {
  out = operationalSchema.parse(
    JSON.parse(await readFile("public/data/operational.json", "utf8")),
  );
} catch {
  /* First installation. */
}
out = { ...out, generatedAt: stamp, health: { ...out.health } };
async function atomic(path: string, value: unknown) {
  await writeFile(path + ".tmp", JSON.stringify(value, null, 2) + "\n");
  await rename(path + ".tmp", path);
}
async function ingest(id: string, work: () => Promise<void>) {
  try {
    await work();
    out.health[id] = {
      checkedAt: stamp,
      lastSuccess:
        (id === "era5"
          ? out.history?.fetchedAt
          : id === "nino34"
            ? out.nino?.fetchedAt
            : out.weather?.fetchedAt) ?? stamp,
      ok: true,
      error: null,
    };
    console.log(id + ": validated");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Source unavailable";
    console.error(id + ": " + message);
    out.health[id] = {
      checkedAt: stamp,
      lastSuccess: out.health[id]?.lastSuccess ?? null,
      ok: false,
      error: message.slice(0, 240),
    };
  }
}
await ingest("ecmwf", async () => {
  out.weather = weatherSchema.parse(
    aggregateForecast(samples, await requestSeries(samples), stamp),
  );
});
await atomic("public/data/operational.json", operationalSchema.parse(out));
const iso = (d: number) => new Date(d).toISOString().slice(0, 10);
const end = iso(+now - 6 * DAY),
  start = iso(Date.parse(end) - 29 * DAY);
type Normal = { temperature: number; rain: number; years: number };
type Baseline = {
  version: number;
  sampleHash: string;
  model: string;
  timezone: string;
  fetchedAt: string;
  days: Record<string, Record<string, Normal>>;
};
await ingest("era5", async () => {
  if (out.history?.end === end && out.history.sampleHash === sampleHash) return;
  let baseline: Baseline = {
    version: 1,
    sampleHash,
    model: "era5",
    timezone: "Asia/Yangon",
    fetchedAt: stamp,
    days: {},
  };
  try {
    const p = JSON.parse(
      await readFile("scripts/cache/climatology.json", "utf8"),
    );
    if (
      p.sampleHash === sampleHash &&
      p.model === "era5" &&
      p.timezone === "Asia/Yangon"
    )
      baseline = p;
  } catch {
    /* Build missing dates only. */
  }
  const required = Array.from({ length: 30 }, (_, i) =>
    iso(Date.parse(start) + i * DAY).slice(5),
  );
  // Feb 29 is interpolated from 30-year ordinary-day normals, never eight-year normals.
  const needed = required.flatMap((d) =>
    d === "02-29" ? ["02-28", "03-01"] : [d],
  );
  const needsBaseline = needed.some(
    (d) => !baseline.days[d] || Object.keys(baseline.days[d]).length !== 15,
  );
  const desired = Array.from({ length: 37 }, (_, i) =>
    iso(Date.parse(start) + i * DAY).slice(5),
  );
  const wanted = !needsBaseline
    ? []
    : [
        ...new Set(
          desired.flatMap((d) => (d === "02-29" ? ["02-28", "03-01"] : [d])),
        ),
      ].filter(
        (d) => !baseline.days[d] || Object.keys(baseline.days[d]).length !== 15,
      );
  if (wanted.length) {
    const totals: Record<string, Record<string, Normal>> = {};
    // Split at the calendar-year boundary to keep every date inside 1991–2020.
    const sorted = [...wanted].sort();
    const spans: string[][] = [];
    for (const key of sorted) {
      const last = spans.at(-1);
      if (
        last &&
        Date.parse("2000-" + key) - Date.parse("2000-" + last.at(-1)) <= 2 * DAY
      )
        last.push(key);
      else spans.push([key]);
    }
    let weightedCalls = 0;
    for (let year = 1991; year <= 2020; year++)
      for (const span of spans) {
        const a = year + "-" + span[0],
          b = year + "-" + span.at(-1);
        const days = (Date.parse(b) - Date.parse(a)) / DAY + 1;
        const cost = samples.length * Math.max(1, days / 14);
        weightedCalls += cost;
        if (weightedCalls > 4500)
          throw Error("Baseline budget exhausted; retry on next scheduled day");
        const daily = aggregateDaily(
          samples,
          await requestSeries(samples, true, a, b),
        );
        for (const region of daily)
          region.time.forEach((date, i) => {
            const key = date.slice(5);
            if (!wanted.includes(key)) return;
            const records = (totals[key] ??= {});
            const cell = (records[region.id] ??= {
              temperature: 0,
              rain: 0,
              years: 0,
            });
            cell.temperature += region.temperature[i];
            cell.rain += region.rain[i];
            cell.years++;
          });
        console.log("Climatology", year, span[0], span.at(-1));
        // Keep weighted throughput below 450/minute; respected on local bootstrap and CI.
        await pause(Math.ceil((cost / 450) * 60000));
      }
    for (const [key, regions] of Object.entries(totals)) {
      for (const v of Object.values(regions)) {
        if (v.years !== 30) throw Error("Incomplete baseline years");
        v.temperature /= 30;
        v.rain /= 30;
      }
      baseline.days[key] = regions;
    }
    baseline.fetchedAt = stamp;
    await atomic("scripts/cache/climatology.json", baseline);
  }
  if (required.includes("02-29")) {
    const leap: Record<string, Normal> = {};
    for (const s of samples) {
      const a = baseline.days["02-28"][s.regionId],
        b = baseline.days["03-01"][s.regionId];
      leap[s.regionId] = {
        temperature: (a.temperature + b.temperature) / 2,
        rain: (a.rain + b.rain) / 2,
        years: 30,
      };
    }
    baseline.days["02-29"] = leap;
  }
  const recent = aggregateDaily(
    samples,
    await requestSeries(samples, true, start, end),
  );
  out.history = historySchema.parse({
    fetchedAt: stamp,
    start,
    end,
    baseline: "1991–2020",
    model: "ERA5 0.25°",
    sampleHash,
    regions: recent.map((r) => {
      const normals = r.time.map((d) => baseline.days[d.slice(5)]?.[r.id]);
      if (normals.some((n) => !n || n.years !== 30))
        throw Error("Missing matching baseline");
      const temp = mean(r.temperature),
        tempNormal = mean(normals.map((n) => n.temperature)),
        rain30 = sum(r.rain),
        rainNormal30 = sum(normals.map((n) => n.rain)),
        anomaly = departure(rain30, rainNormal30);
      return {
        id: r.id,
        temperature: round(temp),
        temperatureNormal: round(tempNormal),
        temperatureAnomaly: round(temp - tempNormal),
        rain7: round(sum(r.rain.slice(-7))),
        rain30: round(rain30),
        rainNormal7: round(sum(normals.slice(-7).map((n) => n.rain))),
        rainNormal30: round(rainNormal30),
        rainDifference: round(anomaly.absolute),
        rainPercent: anomaly.percent === null ? null : round(anomaly.percent),
        dryDays: trailingDryDays(r.rain),
        rainDaily: r.rain.map(round),
      };
    }),
  });
});
await ingest("nino34", async () => {
  if (
    out.nino &&
    out.health.nino34?.ok &&
    +now - Date.parse(out.nino.fetchedAt) < DAY
  )
    return;
  const source = "https://www.cpc.ncep.noaa.gov/data/indices/sstoi.indices";
  const r = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw Error("NOAA index HTTP " + r.status);
  const { parseNino } = await import("../src/data/providers/nino.ts");
  out.nino = indexSchema.parse({
    source,
    fetchedAt: stamp,
    months: parseNino(await r.text(), now),
  });
});
await atomic("public/data/operational.json", operationalSchema.parse(out));
console.log(
  "Operational snapshot published; failed providers retain original valid times.",
);
