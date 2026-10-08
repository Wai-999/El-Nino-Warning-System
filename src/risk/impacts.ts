import type { Operational } from "../data/operational";
import type { Snapshot, Severity } from "../data/schema";
import { regions } from "../data/regions";
import { signalsFor, type Hazard } from "./signals";
import { rank } from "./engine";
import { canonicalLocation } from "./locations";

export const sectorIds = ["health", "agriculture", "water", "energy"] as const;
export type SectorId = (typeof sectorIds)[number];
export const evidenceIds = [
  "all",
  "forecast",
  "observed",
  "historical",
  "scenario",
] as const;
export type EvidenceId = (typeof evidenceIds)[number];
export type ImpactFilters = {
  sector: SectorId;
  region: string;
  evidence: EvidenceId;
};
export const sectorHazards: Record<SectorId, Hazard[]> = {
  health: ["heat", "rain"],
  agriculture: ["heat", "rain", "dryness"],
  water: ["water", "rain"],
  energy: ["heat", "water", "wind"],
};
export function impactFilters(hash: string): ImpactFilters {
  const q = new URLSearchParams(hash.split("?")[1] ?? "");
  return {
    sector: sectorIds.find((s) => s === q.get("sector")) ?? "health",
    region: canonicalLocation(q.get("region")),
    evidence: evidenceIds.find((e) => e === q.get("evidence")) ?? "all",
  };
}
export function impactHash(filters: ImpactFilters) {
  return `#/impacts?${new URLSearchParams(filters)}`;
}
export function assessSector(
  op: Operational,
  data: Snapshot,
  sector: SectorId,
  now: number,
) {
  const hazards = sectorHazards[sector];
  const assessed = regions.map(([id]) => {
    const signals = signalsFor(op, data, id, now).filter((s) =>
      hazards.includes(s.hazard),
    );
    const known = signals.filter((s) => s.level !== "unknown");
    const elevated = known
      .filter((s) => s.level !== "normal")
      .sort((a, b) => rank[b.level as Severity] - rank[a.level as Severity]);
    const complete = known.length === hazards.length;
    // A partial assessment may show an elevated known driver, but never an all-clear.
    const level: Severity | "unknown" =
      elevated[0]?.level ?? (complete ? "normal" : "unknown");
    return { id, signals, complete, available: known.length > 0, level };
  });
  return {
    assessed,
    complete: assessed.filter((r) => r.complete).length,
    partial: assessed.filter((r) => r.available && !r.complete).length,
    unavailable: assessed.filter((r) => !r.available).length,
    elevated: assessed
      .filter((r) => r.level !== "unknown" && r.level !== "normal")
      .sort((a, b) => rank[b.level as Severity] - rank[a.level as Severity]),
  };
}
