import type { Alert, Snapshot, Severity } from "../data/schema.ts";
export const rank: Record<Severity, number> = {
  normal: 0,
  advisory: 1,
  watch: 2,
  warning: 3,
  emergency: 4,
};
export const COVERAGE_TTL = 24 * 60 * 60 * 1000;
export function freshness(
  issuedAt: string,
  expiresAt: string,
  now = Date.now(),
): "current" | "stale" | "invalid" {
  const issued = Date.parse(issuedAt),
    expires = Date.parse(expiresAt);
  if (
    !Number.isFinite(issued) ||
    !Number.isFinite(expires) ||
    issued > now ||
    expires <= issued
  )
    return "invalid";
  return now >= expires ? "stale" : "current";
}
export function activeAlerts(data: Snapshot, now = Date.now()): Alert[] {
  return data.alerts
    .filter(
      (a) =>
        Date.parse(a.validFrom) <= now &&
        freshness(a.issuedAt, a.validUntil, now) === "current",
    )
    .sort((a, b) => rank[b.severity] - rank[a.severity]);
}
export function coverageCurrent(data: Snapshot, now = Date.now()) {
  const stamp = Date.parse(data.regionalCheckedAt || "");
  return (
    data.regionalCoverage === "complete" &&
    Number.isFinite(stamp) &&
    stamp <= now &&
    now - stamp < COVERAGE_TTL
  );
}
export function regionalLevel(
  data: Snapshot,
  regionId?: string,
  now = Date.now(),
): Severity | "unknown" {
  const a = activeAlerts(data, now).filter(
    (a) => !regionId || a.regionId === regionId,
  );
  return a.length
    ? a[0].severity
    : coverageCurrent(data, now)
      ? "normal"
      : "unknown";
}
// Expiry and coverage are operational thresholds, not meteorological risk thresholds.
// ENSO strength alone must never create, raise, or lower a local warning.
export function warningHistory(data: Snapshot, now = Date.now()) {
  return [
    ...data.history,
    ...data.alerts.filter((a) => Date.parse(a.validUntil) <= now),
  ]
    .filter((a, i, all) => all.findIndex((b) => b.id === a.id) === i)
    .sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt));
}
