import { z } from "zod";
import { regionIds } from "./regions.ts";
import { HOUR } from "./operational.ts";

// These are provider fields, not local warning thresholds. Keep units and
// physically plausible validation bounds shared by ingestion and display.
export const detailFields = {
  temperature_2m: {
    en: "Temperature",
    my: "အပူချိန်",
    unit: "°C",
    min: -90,
    max: 65,
  },
  apparent_temperature: {
    en: "Feels like",
    my: "ခံစားရသောအပူချိန်",
    unit: "°C",
    min: -100,
    max: 100,
  },
  relative_humidity_2m: {
    en: "Humidity",
    my: "စိုထိုင်းဆ",
    unit: "%",
    min: 0,
    max: 100,
  },
  precipitation: {
    en: "Rain / precipitation in preceding hour",
    my: "ပြီးခဲ့သည့်တစ်နာရီ မိုးရေပမာဏ",
    unit: "mm",
    min: 0,
    max: 5000,
  },
  wind_speed_10m: {
    en: "Wind speed",
    my: "လေတိုက်နှုန်း",
    unit: "km/h",
    min: 0,
    max: 400,
  },
  wind_gusts_10m: {
    en: "Wind gust",
    my: "လေပြင်းတိုက်နှုန်း",
    unit: "km/h",
    min: 0,
    max: 400,
  },
  weather_code: {
    en: "WMO weather code",
    my: "WMO မိုးလေဝသကုဒ်",
    unit: "wmo code",
    min: 0,
    max: 99,
  },
  precipitation_probability: {
    en: "Chance of precipitation",
    my: "မိုးရွာနိုင်ခြေ",
    unit: "%",
    min: 0,
    max: 100,
  },
  wind_direction_10m: {
    en: "Wind from (clockwise from north)",
    my: "လေလာရာ (မြောက်မှ နာရီလက်တံအတိုင်း)",
    unit: "°",
    min: 0,
    max: 360,
  },
  pressure_msl: {
    en: "Mean sea-level pressure",
    my: "ပင်လယ်ရေမျက်နှာပြင် လေဖိအား",
    unit: "hPa",
    min: 800,
    max: 1100,
  },
  surface_pressure: {
    en: "Surface pressure",
    my: "မြေပြင် လေဖိအား",
    unit: "hPa",
    min: 300,
    max: 1100,
  },
  wet_bulb_temperature_2m: {
    en: "Wet-bulb temperature",
    my: "ရေစိုသာမိုမီတာ အပူချိန်",
    unit: "°C",
    min: -100,
    max: 65,
  },
  soil_moisture_0_to_7cm: {
    en: "Soil moisture · 0–7 cm",
    my: "မြေဆီလွှာအစိုဓာတ် · 0–7 cm",
    unit: "m³/m³",
    min: 0,
    max: 1,
  },
  soil_moisture_7_to_28cm: {
    en: "Soil moisture · 7–28 cm",
    my: "မြေဆီလွှာအစိုဓာတ် · 7–28 cm",
    unit: "m³/m³",
    min: 0,
    max: 1,
  },
  et0_fao_evapotranspiration: {
    en: "Reference evapotranspiration (ET₀)",
    my: "ရည်ညွှန်း ရေငွေ့ပျံမှု (ET₀)",
    unit: "mm",
    min: 0,
    max: 50,
  },
} as const;
export type DetailField = keyof typeof detailFields;
export const optionalForecastFields: DetailField[] = [
  "precipitation_probability",
  "wind_direction_10m",
  "pressure_msl",
  "surface_pressure",
  "wet_bulb_temperature_2m",
  "soil_moisture_0_to_7cm",
  "soil_moisture_7_to_28cm",
  "et0_fao_evapotranspiration",
];
const valuesSchema = z.object(
  Object.fromEntries(
    Object.entries(detailFields).map(([key, field]) => [
      key,
      z
        .array(z.number().finite().min(field.min).max(field.max))
        .length(168)
        .nullable(),
    ]),
  ) as Record<DetailField, z.ZodNullable<z.ZodArray<z.ZodNumber>>>,
);
export const weatherDetailsSchema = z
  .object({
    version: z.literal(1),
    fetchedAt: z.string().datetime(),
    validAt: z.string().datetime(),
    through: z.string().datetime(),
    issueTime: z.null(),
    model: z.literal("ECMWF IFS 0.25°"),
    probabilityModel: z.literal("ECMWF IFS ensemble 0.25° via Open-Meteo"),
    source: z.literal("https://open-meteo.com/en/docs/ecmwf-api"),
    license: z.literal("CC BY 4.0; Open-Meteo noncommercial API"),
    times: z.array(z.string().datetime()).length(168),
    points: z
      .array(
        z.object({
          id: z.string(),
          regionId: z.enum(regionIds as [string, ...string[]]),
          lat: z.number().min(9).max(29),
          lon: z.number().min(92).max(102),
          modelLat: z.number().min(9).max(29),
          modelLon: z.number().min(92).max(102),
          weight: z.number().positive().max(1),
          values: valuesSchema,
        }),
      )
      .length(45),
  })
  .superRefine((data, ctx) => {
    const bad = (message: string) => ctx.addIssue({ code: "custom", message });
    if (new Set(data.points.map((p) => p.id)).size !== 45)
      bad("Duplicate point IDs");
    if (
      data.times.some(
        (t, i) =>
          i > 0 && Date.parse(t) - Date.parse(data.times[i - 1]) !== HOUR,
      )
    )
      bad("Discontinuous forecast hours");
    if (
      Date.parse(data.validAt) > Date.parse(data.fetchedAt) ||
      Date.parse(data.fetchedAt) - Date.parse(data.validAt) >= HOUR ||
      Date.parse(data.through) - Date.parse(data.validAt) !== 24 * HOUR ||
      !data.times.includes(data.validAt)
    )
      bad("Invalid forecast reference hour");
    for (const id of regionIds) {
      const points = data.points.filter((p) => p.regionId === id);
      if (
        points.length !== 3 ||
        Math.abs(points.reduce((s, p) => s + p.weight, 0) - 1) > 1e-6
      )
        bad("Invalid sample coverage");
    }
    for (const point of data.points) {
      if (
        Math.abs(point.modelLat - point.lat) > 0.13 ||
        Math.abs(point.modelLon - point.lon) > 0.13
      )
        bad("Grid coordinate mismatch");
      for (const key of Object.keys(detailFields) as DetailField[]) {
        if (!optionalForecastFields.includes(key) && point.values[key] === null)
          bad("Missing core series");
      }
      if (point.values.weather_code?.some((v) => !Number.isInteger(v)))
        bad("Invalid weather code");
    }
  });
export type WeatherDetails = z.infer<typeof weatherDetailsSchema>;
export function validateWeatherDetails(input: unknown, now = Date.now()) {
  const data = weatherDetailsSchema.parse(input);
  if (Date.parse(data.fetchedAt) > now + 60000)
    throw Error("Future retrieval timestamp");
  return data;
}
export function detailsFresh(data: WeatherDetails, now = Date.now()) {
  return (
    Date.parse(data.fetchedAt) <= now + 60000 &&
    now - Date.parse(data.fetchedAt) < 18 * HOUR &&
    now - Date.parse(data.validAt) < 18 * HOUR &&
    now < Date.parse(data.through)
  );
}
export async function loadWeatherDetails() {
  // Only loaded on demand. The service worker retains the dated response after
  // first use; do not duplicate this larger optional payload in localStorage.
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/weather-details.json`,
    { cache: "no-store", signal: AbortSignal.timeout(12000) },
  );
  if (!response.ok) throw Error("Detailed forecast unavailable");
  return {
    data: validateWeatherDetails(await response.json()),
    cached: response.headers.get("X-Mokinn-Cache") === "true",
  };
}
