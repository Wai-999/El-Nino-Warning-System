import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import {
  heatIndex,
  departure,
  weighted,
  trailingDryDays,
} from "../src/climate/calculations";
import {
  parseSeries,
  aggregateForecast,
  aggregateDaily,
  buildUrl,
} from "../src/data/providers/openMeteo";
import { parseNino } from "../src/data/providers/nino";
import {
  operationalSchema,
  weatherFresh,
  historyFresh,
  mmt,
  DAY,
  HOUR,
  sampleSchema,
  emptyOperational,
} from "../src/data/operational";
import { signalsFor, priority, threshold } from "../src/risk/signals";
import { emptySnapshot } from "../src/data/schema";
import { parseNoaa } from "../src/data/adapters/noaa";
import { layerValue } from "../src/map/layers";
import { loadOperational } from "../src/data/loadOperational";
const op = operationalSchema.parse(
  JSON.parse(readFileSync("public/data/operational.json", "utf8")),
);
const now = Date.parse(op.weather!.fetchedAt);
const sample = sampleSchema.parse({
  regionId: "MM-04",
  lat: 22,
  lon: 96,
  weight: 1,
});
const raw = {
  latitude: 22,
  longitude: 96,
  utc_offset_seconds: 23400,
  timezone: "Asia/Yangon",
  daily_units: {
    time: "iso8601",
    temperature_2m_mean: "°C",
    precipitation_sum: "mm",
  },
  daily: {
    time: ["2020-01-01", "2020-01-02"],
    temperature_2m_mean: [25, 27],
    precipitation_sum: [2, 5],
  },
};
afterEach(() => {
  vi.unstubAllGlobals();
});
describe("scientific calculations", () => {
  it("converts NWS Fahrenheit result to Celsius with both humidity adjustments", () => {
    expect(heatIndex(32.222222, 70)).toBeCloseTo(41.1, 0);
    expect(heatIndex(40, 10)).toBeCloseTo(36.7053, 3);
    expect(heatIndex(27.777777, 90)).toBeGreaterThan(33);
    expect(heatIndex(20, 50)).toBeLessThan(21);
  });
  it("preserves rainfall sign and suppresses near-zero denominators", () => {
    expect(departure(50, 100)).toEqual({ absolute: -50, percent: -50 });
    expect(departure(10, 0).percent).toBeNull();
    expect(departure(10, 9.99).percent).toBeNull();
    expect(departure(10, 10).percent).toBe(0);
  });
  it("aggregates by represented area and rejects missing samples or invalid weights", () => {
    expect(weighted([10, 30], [0.75, 0.25])).toBe(15);
    expect(() => weighted([10], [0.5, 0.5])).toThrow();
    expect(() => weighted([10, 20], [0.4, 0.4])).toThrow();
    expect(() => weighted([10, NaN], [0.5, 0.5])).toThrow();
  });
  it("uses strictly below one mm and counts only the trailing sequence", () => {
    expect(trailingDryDays([0, 0, 3, 0, 0.9])).toBe(2);
    expect(trailingDryDays([0, 1])).toBe(0);
  });
  it("temperature normals and rain use the exact same weighted cells", () => {
    const parsed = parseSeries(
      raw,
      sample,
      "daily",
      ["temperature_2m_mean", "precipitation_sum"],
      2,
    );
    const r = aggregateDaily([sample], [parsed])[0];
    expect(r.temperature).toEqual([25, 27]);
    expect(r.rain).toEqual([2, 5]);
    expect(
      buildUrl([sample], true, "1991-01-01", "1991-01-02").searchParams.get(
        "models",
      ),
    ).toBe("era5");
  });
});
describe("source validation", () => {
  it("rejects wrong units, geographic mismatches, nulls, duplicates and discontinuous dates", () => {
    for (const change of [
      () => {
        raw.daily_units.precipitation_sum = "inch";
      },
      () => {
        raw.latitude = 24;
      },
      () => {
        raw.daily.temperature_2m_mean[0] = NaN;
      },
      () => {
        raw.daily.time[1] = raw.daily.time[0];
      },
      () => {
        raw.daily.time[1] = "2020-01-03";
      },
    ]) {
      const saved = structuredClone(raw);
      change();
      expect(() =>
        parseSeries(
          raw,
          sample,
          "daily",
          ["temperature_2m_mean", "precipitation_sum"],
          2,
        ),
      ).toThrow();
      Object.assign(raw, saved);
    }
  });
  it("validates all 15 regions and rejects duplicate regions", () => {
    const copy = structuredClone(op);
    copy.weather!.regions[1].id = copy.weather!.regions[0].id;
    expect(operationalSchema.safeParse(copy).success).toBe(false);
    expect(op.history!.regions).toHaveLength(15);
  });
  it("extracts the Niño 3.4 anomaly column, not Niño 4 or absolute SST", () => {
    const header = "YR MON NINO1+2 ANOM NINO3 ANOM NINO4 ANOM NINO3.4 ANOM";
    expect(
      parseNino(
        header +
          "\n2025 1 24 1 25 2 28 3 27 -0.2\n2025 2 24 1 25 2 28 3 27 0.4",
        new Date("2025-03-10"),
      )[1].anomaly,
    ).toBe(0.4);
    expect(() => parseNino("bad header")).toThrow();
  });
  it("keeps NOAA strength probability separate from occurrence and its seasonal horizon", () => {
    const x = parseNoaa(
      "NWS 10 September 2026 ENSO Alert System Status: El Niño Advisory Synopsis: El Niño is strengthening, with a greater than 90% chance of a very strong event during the Northern Hemisphere fall and winter 2026-27. The next ENSO Diagnostics Discussion is scheduled for 8 October 2026",
      new Date("2026-09-30"),
    );
    expect(x.outlook).toEqual({
      percent: 90,
      greaterThan: true,
      period: "Northern Hemisphere fall and winter 2026-27",
      eventStrength: "very-strong",
      periodRelation: "during",
    });
  });
  it("preserves the October CPC strength range, lower bound and through horizon", () => {
    const bulletin =
      "NWS 8 October 2026 ENSO Alert System Status: El Niño Advisory Synopsis: El Niño continues to strengthen, with a strong-to-very strong El Niño likely through January-March 2027 (remaining greater than an 83&#37; chance). A separate threshold has a 54% chance in September-November. The next ENSO Diagnostics Discussion is scheduled for 12 November 2026";
    const now = new Date("2026-10-08T18:00:00Z");
    expect(parseNoaa(bulletin, now).outlook).toEqual({
      percent: 83,
      greaterThan: true,
      period: "January-March 2027",
      eventStrength: "strong-to-very-strong",
      periodRelation: "through",
    });
    const otherEvent = bulletin.replace(
      "strong-to-very strong El Niño",
      "ENSO-neutral conditions",
    );
    expect(parseNoaa(otherEvent, now).outlook).toBeNull();
    expect(
      parseNoaa(bulletin.replace("greater than an 83", "an 71"), now).outlook
        ?.greaterThan,
    ).toBe(false);
    expect(() => parseNoaa(bulletin.replace("an 83", "an 183"), now)).toThrow();
  });
  it("excludes current/past precipitation from next-24-hour totals", () => {
    const sample = { regionId: "MM-04", lat: 22, lon: 96, weight: 1 };
    const time = Array.from({ length: 168 }, (_, i) =>
      new Date(Date.UTC(2026, 8, 1) + i * HOUR).toISOString().slice(0, 16),
    );
    const values = {
      temperature_2m: Array(168).fill(30),
      relative_humidity_2m: Array(168).fill(50),
      apparent_temperature: Array(168).fill(32),
      precipitation: Array(168).fill(1),
      wind_speed_10m: Array(168).fill(10),
      wind_gusts_10m: Array(168).fill(20),
      weather_code: Array(168).fill(3),
    };
    values.precipitation[12] = 100;
    const w = aggregateForecast(
      [sample],
      [{ time, values }],
      "2026-09-01T05:45:00Z",
    );
    expect(w.regions[0].next24.rain).toBe(24);
    expect(w.regions[0].now.rain).toBe(100);
  });
});
describe("freshness and screening safety", () => {
  it("expires weather after 18 hours even after retrieving the same valid hour again", () => {
    expect(weatherFresh(op.weather, now)).toBe(true);
    expect(weatherFresh(op.weather, now + 19 * HOUR)).toBe(false);
    expect(
      weatherFresh(
        { ...op.weather!, fetchedAt: new Date(now + 19 * HOUR).toISOString() },
        now + 19 * HOUR,
      ),
    ).toBe(false);
  });
  it("marks delayed historical data stale after its end day exceeds ten days", () => {
    expect(historyFresh(op.history, now)).toBe(true);
    expect(historyFresh(op.history, now + 11 * DAY)).toBe(false);
  });
  it("formats half-hour Myanmar time without browser time-zone dependence", () => {
    expect(mmt("2026-01-01T00:00:00Z")).toContain("06:30");
    expect(mmt("2026-01-01T20:00:00Z")).toContain("2 Jan 2026");
  });
  it("applies inclusive thresholds without inventing severe dryness", () => {
    expect(threshold(50, [20, 50, 100, 200])).toBe("watch");
    const copy = structuredClone(op);
    Object.assign(copy.history!.regions[0], {
      rainNormal30: 100,
      rainPercent: -80,
      dryDays: 20,
    });
    expect(
      signalsFor(copy, emptySnapshot, copy.history!.regions[0].id, now).find(
        (s) => s.hazard === "dryness",
      )?.level,
    ).toBe("warning");
  });
  it("never treats a missing or stale forecast as normal", () => {
    expect(
      signalsFor(emptyOperational, emptySnapshot, "MM-04", now).every(
        (s) => s.level === "unknown",
      ),
    ).toBe(true);
    expect(
      layerValue("temperature", op, emptySnapshot, "MM-04", now + 19 * HOUR)
        .value,
    ).toBeNull();
  });
  it("prioritizes immediate weather above ENSO and leaves local levels unchanged by ENSO", () => {
    const copy = structuredClone(op);
    copy.weather!.regions[0].next24.heat = 45;
    const enso = {
      ...emptySnapshot,
      enso: parseNoaa(
        "NWS 10 September 2026 ENSO Alert System Status: El Niño Advisory The next ENSO Diagnostics Discussion is scheduled for 8 October 2026",
        new Date("2026-09-30"),
      ),
    };
    expect(priority(copy, enso, now).kind).toBe("system");
    const a = signalsFor(copy, emptySnapshot, copy.weather!.regions[0].id, now),
      b = signalsFor(copy, enso, copy.weather!.regions[0].id, now);
    expect(a.filter((s) => s.hazard !== "enso")).toEqual(
      b.filter((s) => s.hazard !== "enso"),
    );
  });
  it("falls back to validated cached data on a malformed successful response", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify(op),
      setItem: () => {},
    });
    vi.stubGlobal("fetch", async () => new Response('{"bad":true}'));
    const result = await loadOperational();
    expect(result.cached).toBe(true);
    expect(result.error).toBe(true);
    expect(result.data.weather!.validAt).toBe(op.weather!.validAt);
  });
  it("rejects corrupt cached data after provider failure", async () => {
    vi.stubGlobal("localStorage", { getItem: () => '{"bad":true}' });
    vi.stubGlobal("fetch", async () => {
      throw Error("offline");
    });
    expect((await loadOperational()).data).toEqual(emptyOperational);
  });
});
it("rejects an old forecast window even when it still contains a future day", () => {
  expect(() =>
    aggregateForecast(
      [sample],
      [{ time: ["2026-09-01T00:00"], values: {} }],
      "2026-09-02T00:00:00Z",
    ),
  ).toThrow("current MMT day");
});
it("validates each stored baseline day against all 30 years and all region weights", () => {
  const baseline = JSON.parse(
    readFileSync("scripts/cache/climatology.json", "utf8"),
  );
  const samples = sampleSchema
    .array()
    .parse(
      JSON.parse(readFileSync("scripts/cache/samples.json", "utf8")).samples,
    );
  for (const id of new Set(samples.map((s) => s.regionId))) {
    expect(samples.filter((s) => s.regionId === id)).toHaveLength(3);
    expect(
      samples
        .filter((s) => s.regionId === id)
        .reduce((sum, s) => sum + s.weight, 0),
    ).toBeCloseTo(1, 10);
  }
  for (const regions of Object.values(baseline.days) as Array<
    Record<string, { years: number; temperature: number; rain: number }>
  >) {
    expect(Object.keys(regions)).toHaveLength(15);
    for (const n of Object.values(regions)) {
      expect(n.years).toBe(30);
      expect(Number.isFinite(n.temperature)).toBe(true);
      expect(n.rain).toBeGreaterThanOrEqual(0);
    }
  }
});
