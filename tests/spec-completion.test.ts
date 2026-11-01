import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import {
  validateWeatherDetails,
  weatherDetailsSchema,
  detailFields,
  detailsFresh,
} from "../src/data/weatherDetails";
import {
  requestSeries,
  parseSeries,
  variables,
} from "../src/data/providers/openMeteo";
import {
  settlements,
  settlementsSchema,
  settlementReference,
  searchSettlements,
  searchTownships,
  settlementName,
  savedPlace,
  readSavedPlaces,
} from "../src/data/locations";
const details = validateWeatherDetails(
  JSON.parse(readFileSync("public/data/weather-details.json", "utf8")),
);
const at = Date.parse(details.fetchedAt);
afterEach(() => vi.unstubAllGlobals());
describe("detailed source contract and safe optional fields", () => {
  it("retains all 168 hours at each of the 45 original returned grid cells", () => {
    expect(details.points).toHaveLength(45);
    expect(details.times).toHaveLength(168);
    expect(details.issueTime).toBeNull();
    expect(details.probabilityModel).toContain("ensemble");
    for (const point of details.points) {
      expect(point.values.temperature_2m).toHaveLength(168);
      if (point.values.precipitation_probability)
        expect(point.values.precipitation_probability).toHaveLength(168);
      if (point.values.soil_moisture_0_to_7cm)
        expect(point.values.soil_moisture_0_to_7cm).toHaveLength(168);
    }
  });
  it("rejects invalid probabilities, soil moisture, duplicate points, discontinuous hours and refreshed stale reference hours", () => {
    for (const mutate of [
      (d: typeof details) => {
        d.points[0].values.precipitation_probability ??= Array(168).fill(0);
        d.points[0].values.precipitation_probability[0] = 101;
      },
      (d: typeof details) => {
        d.points[0].values.soil_moisture_0_to_7cm ??= Array(168).fill(0);
        d.points[0].values.soil_moisture_0_to_7cm[0] = -0.01;
      },
      (d: typeof details) => {
        d.points[1].id = d.points[0].id;
      },
      (d: typeof details) => {
        d.times[1] = d.times[0];
      },
      (d: typeof details) => {
        d.fetchedAt = new Date(at + 19 * 3600000).toISOString();
      },
    ]) {
      const copy = structuredClone(details);
      mutate(copy);
      expect(weatherDetailsSchema.safeParse(copy).success).toBe(false);
    }
    expect(detailsFresh(details, at)).toBe(true);
    expect(detailsFresh(details, at + 19 * 3600000)).toBe(false);
  });
  it("preserves a missing optional field as null rather than inventing zero", () => {
    const copy = structuredClone(details);
    copy.points[0].values.wet_bulb_temperature_2m = null;
    expect(
      validateWeatherDetails(copy).points[0].values.wet_bulb_temperature_2m,
    ).toBeNull();
    copy.points[0].values.temperature_2m = null;
    expect(weatherDetailsSchema.safeParse(copy).success).toBe(false);
  });
  it("validates angles as angles and pressure as pressure, without ordinary spatial averaging", () => {
    const point = details.points[0];
    const raw = {
      latitude: point.modelLat,
      longitude: point.modelLon,
      utc_offset_seconds: 23400,
      timezone: "Asia/Yangon",
      hourly_units: { wind_direction_10m: "°", pressure_msl: "hPa" },
      hourly: {
        time: ["2026-11-01T00:00", "2026-11-01T01:00"],
        wind_direction_10m: [359, 1],
        pressure_msl: [1012, 1013],
      },
    };
    expect(
      parseSeries(
        raw,
        point,
        "hourly",
        ["wind_direction_10m", "pressure_msl"],
        2,
      ).values.wind_direction_10m,
    ).toEqual([359, 1]);
    raw.hourly_units.pressure_msl = "Pa";
    expect(() =>
      parseSeries(raw, point, "hourly", ["pressure_msl"], 2),
    ).toThrow("Unit");
  });
  it("recovers the core forecast with one bounded retry when upstream withdraws an optional variable", async () => {
    const point = details.points[0];
    const raw = {
      latitude: point.modelLat,
      longitude: point.modelLon,
      utc_offset_seconds: 23400,
      timezone: "Asia/Yangon",
      hourly_units: Object.fromEntries(
        variables.map((key) => [key, detailFields[key].unit]),
      ),
      hourly: {
        time: details.times.map((time) =>
          new Date(Date.parse(time) + 23400000).toISOString().slice(0, 16),
        ),
        ...Object.fromEntries(variables.map((key) => [key, point.values[key]])),
      },
    };
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("unsupported variable", { status: 400 }),
      )
      .mockResolvedValueOnce(Response.json(raw));
    vi.stubGlobal("fetch", fetch);
    const result = await requestSeries([point]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(String(fetch.mock.calls[0][0])).toContain(
      "precipitation_probability",
    );
    expect(String(fetch.mock.calls[1][0])).not.toContain(
      "precipitation_probability",
    );
    expect(result[0].values.temperature_2m).toHaveLength(168);
    expect(result[0].values.precipitation_probability).toBeUndefined();
  });
});
describe("city / town names are distinct from township geography", () => {
  it("validates stable settlement IDs and all derived reference parents", () => {
    expect(settlements).toHaveLength(515);
    expect(settlements.filter((p) => p.my)).toHaveLength(337);
    const bad = structuredClone(settlementReference);
    bad.points[0].townshipCode = "UNKNOWN";
    expect(settlementsSchema.safeParse(bad).success).toBe(false);
    const duplicate = structuredClone(settlementReference);
    duplicate.points[1].id = duplicate.points[0].id;
    expect(settlementsSchema.safeParse(duplicate).success).toBe(false);
  });
  it("supports bilingual settlement names, individually reviewed aliases and parent-qualified township search", () => {
    expect(searchSettlements("Rangoon").map((p) => p.id)).toContain("1298824");
    expect(searchSettlements("မန္တလေး").map((p) => p.id)).toContain("1311874");
    expect(searchSettlements("Naypyidaw").map((p) => p.id)).toContain(
      "6611854",
    );
    expect(searchSettlements("Pyinmana").map((p) => p.id)).not.toContain(
      "6611854",
    );
    expect(searchTownships("Htantabin Yangon")).toHaveLength(1);
  });
  it("persists typed settlement IDs separately and keeps original English when the source lacks Burmese", () => {
    const place = savedPlace("settlement:1298824");
    expect(place?.settlement?.en).toBe("Yangon");
    expect(place?.township?.code).not.toBe("1298824");
    expect(
      readSavedPlaces(
        '["settlement:1298824","township:MMR013044","settlement:missing"]',
      ),
    ).toEqual(["settlement:1298824", "township:MMR013044"]);
    const without = settlements.find((p) => p.my === null)!;
    expect(settlementName(without, "my")).toBe(without.en);
  });
});

import { rainfallAccumulation } from "../src/climate/calculations";
import { operationalSchema } from "../src/data/operational";
import { localBriefing } from "../src/risk/briefing";
import { emptySnapshot } from "../src/data/schema";
it("sums completed rainfall windows without accepting missing or negative days", () => {
  expect(rainfallAccumulation([10, 2, 3, 4], 3)).toBe(9);
  expect(() => rainfallAccumulation([1, 2], 3)).toThrow("Incomplete");
  expect(() => rainfallAccumulation([1, NaN, 2], 3)).toThrow("Incomplete");
  expect(() => rainfallAccumulation([1, -1, 2], 3)).toThrow("Incomplete");
});
it("the daily briefing retains its forecast day and window across Myanmar midnight", () => {
  const op = operationalSchema.parse(
    JSON.parse(readFileSync("public/data/operational.json", "utf8")),
  );
  op.weather!.validAt = "2026-10-31T16:30:00.000Z";
  op.weather!.fetchedAt = "2026-10-31T16:40:00.000Z";
  op.weather!.through = "2026-11-01T16:30:00.000Z";
  op.weather!.regions[0].days[0].date = "2026-10-31";
  const brief = localBriefing(
    op,
    emptySnapshot,
    op.weather!.regions[0].id,
    Date.parse("2026-10-31T18:00:00.000Z"),
  );
  expect(brief.forecast?.day).toBe("2026-10-31");
  expect(brief.forecastThrough).toBe("2026-11-01T16:30:00.000Z");
});
it("retains syntactically valid retired saved IDs for review instead of deleting or remapping them", () => {
  expect(
    readSavedPlaces(
      '["township:MMR999999","settlement:999999999","region:MM-99","invalid"]',
    ),
  ).toEqual(["township:MMR999999", "settlement:999999999", "region:MM-99"]);
  expect(savedPlace("township:MMR999999")).toBeNull();
});
