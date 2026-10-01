export function parseNino(text: string, now = new Date()) {
  if (!/NINO3\.4/.test(text)) throw Error("Unexpected NOAA index header");
  const all = text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim().split(/\s+/).map(Number))
    .filter((x) => x.length === 10 && x.every(Number.isFinite));
  const months = all.slice(-6).map((x) => ({
    month: `${x[0]}-${String(x[1]).padStart(2, "0")}`,
    anomaly: x[9],
  }));
  if (
    months.length < 2 ||
    new Set(months.map((m) => m.month)).size !== months.length ||
    months.some(
      (m) =>
        Date.parse(m.month + "-01") >=
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) ||
        Math.abs(m.anomaly) > 10,
    )
  )
    throw Error("Invalid NOAA index sequence");
  return months;
}
