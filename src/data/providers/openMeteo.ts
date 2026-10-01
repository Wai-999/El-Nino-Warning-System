import { z } from "zod";
import type { Sample, Weather } from "../operational.ts";
import {
  mean,
  sum,
  round,
  weighted,
  heatIndex,
} from "../../climate/calculations.ts";
export const FORECAST = "https://api.open-meteo.com/v1/ecmwf";
export const ARCHIVE = "https://archive-api.open-meteo.com/v1/archive";
export const variables = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "wind_speed_10m",
  "wind_gusts_10m",
  "weather_code",
] as const;
const units: Record<string, string> = {
  temperature_2m: "°C",
  relative_humidity_2m: "%",
  apparent_temperature: "°C",
  precipitation: "mm",
  wind_speed_10m: "km/h",
  wind_gusts_10m: "km/h",
  weather_code: "wmo code",
  temperature_2m_mean: "°C",
  precipitation_sum: "mm",
};
const base = z.object({
  latitude: z.number(),
  longitude: z.number(),
  utc_offset_seconds: z.literal(23400),
  timezone: z.literal("Asia/Yangon"),
});
const record = z.record(z.array(z.number().finite()));
const series = z.object({ time: z.array(z.string()) }).passthrough();
export const rawSchema = base.extend({
  hourly: series.optional(),
  daily: series.optional(),
  hourly_units: z.record(z.string()).optional(),
  daily_units: z.record(z.string()).optional(),
});
export type Series = { time: string[]; values: Record<string, number[]> };
export function parseSeries(
  raw: unknown,
  s: Sample,
  kind: "hourly" | "daily",
  names: readonly string[],
  expected: number,
): Series {
  const p = rawSchema.parse(raw);
  if (
    Math.abs(p.latitude - s.lat) > 0.13 ||
    Math.abs(p.longitude - s.lon) > 0.13
  )
    throw Error("Grid coordinate mismatch");
  const data = p[kind],
    u = p[kind === "hourly" ? "hourly_units" : "daily_units"];
  if (!data || !u) throw Error("Missing series");
  const values = record.parse(
    Object.fromEntries(names.map((n) => [n, data[n]])),
  );
  if (data.time.length !== expected || new Set(data.time).size !== expected)
    throw Error("Incomplete or duplicate dates");
  const step = kind === "hourly" ? 3600000 : 86400000;
  data.time.forEach((t, i) => {
    const ms = Date.parse(
      kind === "hourly" ? t + ":00+06:30" : t + "T00:00:00+06:30",
    );
    if (
      !Number.isFinite(ms) ||
      (i &&
        ms -
          Date.parse(
            kind === "hourly"
              ? data.time[i - 1] + ":00+06:30"
              : data.time[i - 1] + "T00:00:00+06:30",
          ) !==
          step)
    )
      throw Error("Malformed or discontinuous time");
  });
  for (const n of names) {
    if (u[n] !== units[n] || values[n].length !== expected)
      throw Error("Unit or length mismatch: " + n);
    for (const v of values[n]) {
      const limits = n.includes("temperature")
        ? [-90, 100]
        : n === "relative_humidity_2m"
          ? [0, 100]
          : n === "weather_code"
            ? [0, 99]
            : n.includes("wind")
              ? [0, 400]
              : [0, 5000];
      if (v < limits[0] || v > limits[1]) throw Error("Impossible value: " + n);
    }
  }
  return { time: data.time, values };
}
export function buildUrl(
  samples: Sample[],
  archive = false,
  start?: string,
  end?: string,
) {
  const u = new URL(archive ? ARCHIVE : FORECAST);
  const p = u.searchParams;
  p.set("latitude", samples.map((s) => s.lat).join(","));
  p.set("longitude", samples.map((s) => s.lon).join(","));
  p.set("elevation", samples.map(() => "nan").join(","));
  p.set("cell_selection", "nearest");
  p.set("timezone", "Asia/Yangon");
  p.set("models", archive ? "era5" : "ecmwf_ifs025");
  if (archive) {
    p.set("start_date", start!);
    p.set("end_date", end!);
    p.set("daily", "temperature_2m_mean,precipitation_sum");
  } else {
    p.set("hourly", variables.join(","));
    p.set("forecast_days", "7");
  }
  return u;
}
export async function requestSeries(
  samples: Sample[],
  archive = false,
  start?: string,
  end?: string,
) {
  const r = await fetch(buildUrl(samples, archive, start, end), {
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) throw Error("Open-Meteo HTTP " + r.status);
  const raw: unknown = await r.json();
  const list = Array.isArray(raw) ? raw : [raw];
  if (list.length !== samples.length) throw Error("Coordinate count mismatch");
  const count = archive
    ? (Date.parse(end!) - Date.parse(start!)) / 86400000 + 1
    : 168;
  const parsed = list.map((x, i) =>
    parseSeries(
      x,
      samples[i],
      archive ? "daily" : "hourly",
      archive ? ["temperature_2m_mean", "precipitation_sum"] : variables,
      count,
    ),
  );
  if (parsed.some((p) => p.time.join() !== parsed[0].time.join()))
    throw Error("Misaligned sample dates");
  if (archive && (parsed[0].time[0] !== start || parsed[0].time.at(-1) !== end))
    throw Error("Requested archive dates do not match response");
  return parsed;
}
export function aggregateForecast(
  samples: Sample[],
  raw: Series[],
  fetchedAt: string,
): Weather {
  const time = raw[0].time;
  const localDay = new Date(Date.parse(fetchedAt) + 23400000)
    .toISOString()
    .slice(0, 10);
  if (time[0].slice(0, 10) !== localDay)
    throw Error("Forecast does not begin on current MMT day");
  const current = time.reduce(
    (last, t, i) =>
      Date.parse(t + ":00+06:30") <= Date.parse(fetchedAt) ? i : last,
    -1,
  );
  if (current < 0 || current > 143)
    throw Error("No current and next-24h coverage");
  return {
    fetchedAt,
    validAt: new Date(time[current] + ":00+06:30").toISOString(),
    through: new Date(time[current + 24] + ":00+06:30").toISOString(),
    model: "ECMWF IFS 0.25°",
    regions: [...new Set(samples.map((s) => s.regionId))].map((id) => {
      const indexes = samples.flatMap((s, i) => (s.regionId === id ? [i] : [])),
        weights = indexes.map((i) => samples[i].weight);
      const value = (key: string, h: number) =>
        weighted(
          indexes.map((i) => raw[i].values[key][h]),
          weights,
        );
      const window = (start: number, end: number) => {
        const hours = Array.from({ length: end - start }, (_, j) => j + start);
        return {
          min: Math.min(...hours.map((h) => value("temperature_2m", h))),
          max: Math.max(...hours.map((h) => value("temperature_2m", h))),
          rain: sum(hours.map((h) => value("precipitation", h))),
          maxRain: Math.max(
            ...indexes.map((i) =>
              sum(hours.map((h) => raw[i].values.precipitation[h])),
            ),
          ),
          heat: Math.max(
            ...indexes.flatMap((i) =>
              hours.map((h) =>
                heatIndex(
                  raw[i].values.temperature_2m[h],
                  raw[i].values.relative_humidity_2m[h],
                ),
              ),
            ),
          ),
          gust: Math.max(
            ...indexes.flatMap((i) =>
              hours.map((h) => raw[i].values.wind_gusts_10m[h]),
            ),
          ),
        };
      };
      const nums = (x: Record<string, number>) =>
        Object.fromEntries(Object.entries(x).map(([k, v]) => [k, round(v)]));
      const temperatures = indexes.map(
        (i) => raw[i].values.temperature_2m[current],
      );
      const primary = indexes[weights.indexOf(Math.max(...weights))];
      return {
        id,
        now: {
          temperature: round(value("temperature_2m", current)),
          apparent: round(value("apparent_temperature", current)),
          humidity: round(value("relative_humidity_2m", current)),
          rain: round(value("precipitation", current)),
          wind: round(value("wind_speed_10m", current)),
          gust: round(value("wind_gusts_10m", current)),
          code: raw[primary].values.weather_code[current],
          min: Math.min(...temperatures),
          max: Math.max(...temperatures),
        },
        next24: nums(
          window(current + 1, current + 25),
        ) as Weather["regions"][number]["next24"],
        days: Array.from({ length: 7 }, (_, d) => ({
          date: time[d * 24].slice(0, 10),
          ...nums(window(d * 24, (d + 1) * 24)),
        })) as Weather["regions"][number]["days"],
      };
    }),
  };
}
export function aggregateDaily(samples: Sample[], raw: Series[]) {
  return [...new Set(samples.map((s) => s.regionId))].map((id) => {
    const ix = samples.flatMap((s, i) => (s.regionId === id ? [i] : [])),
      w = ix.map((i) => samples[i].weight);
    return {
      id,
      time: raw[0].time,
      temperature: raw[0].time.map((_, d) =>
        weighted(
          ix.map((i) => raw[i].values.temperature_2m_mean[d]),
          w,
        ),
      ),
      rain: raw[0].time.map((_, d) =>
        weighted(
          ix.map((i) => raw[i].values.precipitation_sum[d]),
          w,
        ),
      ),
    };
  });
}
export { mean };
