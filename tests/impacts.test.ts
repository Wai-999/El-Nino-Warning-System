import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { assessSector, impactFilters, impactHash } from "../src/risk/impacts";
import {
  operationalSchema,
  historySchema,
  indexSchema,
  validateOperational,
  historyFresh,
  weatherState,
  historyState,
  HOUR,
  DAY,
  emptyOperational,
} from "../src/data/operational";
import { emptySnapshot } from "../src/data/schema";
import {
  historicalImpacts,
  impactSources,
  sectorEvidence,
} from "../src/data/impactEvidence";
const op = operationalSchema.parse(
  JSON.parse(readFileSync("public/data/operational.json", "utf8")),
);
const now = Date.parse(op.weather!.fetchedAt);
describe("impact evidence safety", () => {
  it("retains unknown coverage rather than displaying an all-clear", () => {
    const copy = structuredClone(op);
    copy.history = null;
    copy.weather!.regions.forEach((r) => {
      r.next24.heat = 20;
      r.next24.gust = 10;
      r.next24.maxRain = 0;
    });
    const a = assessSector(copy, emptySnapshot, "agriculture", now);
    expect(a.complete).toBe(0);
    expect(a.partial).toBe(15);
    expect(a.elevated).toHaveLength(0);
    expect(a.assessed.every((r) => r.level === "unknown")).toBe(true);
    copy.weather!.regions[0].next24.heat = 42;
    expect(
      assessSector(copy, emptySnapshot, "agriculture", now).elevated[0]
        .complete,
    ).toBe(false);
    const missing = assessSector(
      emptyOperational,
      emptySnapshot,
      "health",
      now,
    );
    expect(missing.unavailable).toBe(15);
    expect(missing.elevated).toHaveLength(0);
  });
  it("rejects inconsistent rainfall percentages and dry-day counts", () => {
    const bad = structuredClone(op.history!);
    bad.regions[0].rainPercent = 99999;
    expect(historySchema.safeParse(bad).success).toBe(false);
    const dry = structuredClone(op.history!);
    dry.regions[0].dryDays = dry.regions[0].dryDays === 30 ? 0 : 30;
    expect(historySchema.safeParse(dry).success).toBe(false);
  });
  it("allows rounding around one mm without changing raw dry-day classification", () => {
    const h = structuredClone(op.history!);
    const r = h.regions[0];
    r.rainDaily = Array(30).fill(1);
    r.rain30 = 30;
    r.rain7 = 7;
    r.rainNormal30 = 30;
    r.rainDifference = 0;
    r.rainPercent = 0;
    r.dryDays = 30;
    expect(historySchema.safeParse(h).success).toBe(true);
  });
  it("rejects duplicate, invalid, unordered and future monthly observations", () => {
    const n = structuredClone(op.nino!);
    for (const months of [
      [n.months[0], n.months[0]],
      [...n.months].reverse(),
      [
        { month: "2099-13", anomaly: 1 },
        { month: "2099-14", anomaly: 2 },
      ],
      [
        { month: "2099-01", anomaly: 1 },
        { month: "2099-02", anomaly: 2 },
      ],
    ])
      expect(indexSchema.safeParse({ ...n, months }).success).toBe(false);
  });
  it("requires completed observation days and rejects future retrieval dates", () => {
    const h = {
      ...op.history!,
      start: "2026-09-02",
      end: "2026-10-01",
      fetchedAt: "2026-10-01T07:00:00Z",
    };
    expect(historyFresh(h, Date.parse(h.fetchedAt))).toBe(false);
    expect(historySchema.safeParse(h).success).toBe(false);
    const copy = structuredClone(op);
    copy.generatedAt = new Date(now + DAY).toISOString();
    expect(() => validateOperational(copy, now)).toThrow("future");
  });
  it("preserves dataset cadence and shows aging before stale", () => {
    const w = {
      ...op.weather!,
      validAt: new Date(now).toISOString(),
      fetchedAt: new Date(now).toISOString(),
      through: new Date(now + DAY).toISOString(),
    };
    expect(weatherState(w, now + 11 * HOUR)).toBe("current");
    expect(weatherState(w, now + 12 * HOUR)).toBe("aging");
    expect(weatherState(w, now + 18 * HOUR)).toBe("stale");
    expect(weatherState(null, now)).toBe("unavailable");
    const end = Date.parse(op.history!.end + "T23:59:59+06:30");
    expect(historyState(op.history, end + 8 * DAY)).toBe("aging");
    expect(historyState(op.history, end + 10 * DAY)).toBe("stale");
  });
  it("round trips shareable filters and safely defaults invalid URL inputs", () => {
    const f = {
      sector: "agriculture",
      region: "MM-18",
      evidence: "historical",
    } as const;
    expect(impactFilters(impactHash(f))).toEqual(f);
    expect(
      impactFilters("#/impacts?sector=bad&region=MM-99&evidence=bad"),
    ).toEqual({ sector: "health", region: "MM-04", evidence: "all" });
  });
  it("keeps source-backed historical evidence separate from forecasts and ungraded confidence", () => {
    for (const item of historicalImpacts) {
      expect(item.relationship).toBe("historical-association");
      expect(item.confidence).toBe("unknown");
      expect(item.period.every(Boolean)).toBe(true);
      for (const id of item.sourceIds)
        expect(impactSources[id].url).toMatch(/^https:/);
    }
    for (const sector of Object.values(sectorEvidence)) {
      expect(sector.sources.length).toBeGreaterThan(0);
      expect(sector.prepare.every(Boolean)).toBe(true);
    }
  });
});
