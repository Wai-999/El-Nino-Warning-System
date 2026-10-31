// Educational/synthetic values only. Never import these into ingestion or warning policy.
export function educationalAnomaly(value: number, baseline: number) {
  return {
    difference: value - baseline,
    percent: baseline > 0 ? ((value - baseline) / baseline) * 100 : null,
  };
}
export function educationalStandardScore(
  value: number,
  mean: number,
  deviation: number,
) {
  return Number.isFinite(deviation) && deviation > 0
    ? (value - mean) / deviation
    : null;
}
export function educationalOutcomes(probability: number) {
  return Math.round(Math.max(0, Math.min(100, probability)) / 10);
}
