export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: number[]) => sum(xs) / xs.length;
export const round = (n: number) => Math.round(n * 100) / 100;
export function weighted(values: number[], weights: number[]) {
  if (
    !values.length ||
    values.length !== weights.length ||
    values.some((x) => !Number.isFinite(x)) ||
    weights.some((w) => !Number.isFinite(w) || w <= 0) ||
    Math.abs(sum(weights) - 1) > 1e-6
  )
    throw Error("Invalid spatial aggregation");
  return sum(values.map((x, i) => x * weights[i]));
}
export function departure(value: number, normal: number) {
  return {
    absolute: value - normal,
    percent: normal >= 10 ? (100 * (value - normal)) / normal : null,
  };
}
export function trailingDryDays(rain: number[]) {
  let n = 0;
  for (let i = rain.length - 1; i >= 0 && rain[i] < 1; i--) n++;
  return n;
}
// NWS WPC Steadman/Rothfusz algorithm, in shade. Input temperature in Celsius.
export function heatIndex(c: number, rh: number) {
  const t = (c * 9) / 5 + 32;
  let hi = (0.5 * (t + 61 + (t - 68) * 1.2 + rh * 0.094) + t) / 2;
  if (hi >= 80) {
    hi =
      -42.379 +
      2.04901523 * t +
      10.14333127 * rh -
      0.22475541 * t * rh -
      0.00683783 * t * t -
      0.05481717 * rh * rh +
      0.00122874 * t * t * rh +
      0.00085282 * t * rh * rh -
      0.00000199 * t * t * rh * rh;
    if (rh < 13 && t >= 80 && t <= 112)
      hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
    else if (rh > 85 && t >= 80 && t <= 87)
      hi += (((rh - 85) / 10) * (87 - t)) / 5;
  }
  return ((hi - 32) * 5) / 9;
}
