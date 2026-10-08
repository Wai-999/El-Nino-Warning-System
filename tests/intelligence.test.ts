import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import {
  canonicalRegions,
  regionIds,
  resolveRegion,
  boundarySubregions,
} from "../src/data/regions";
import {
  emptyOperational,
  operationalSchema,
  DAY,
} from "../src/data/operational";
import { emptySnapshot, alertSchema, type Alert } from "../src/data/schema";
import {
  coverageKpi,
  regionalRows,
  overallLevel,
  sortRows,
  sourceStatus,
  nextScheduledUpdate,
} from "../src/risk/intelligence";
import { sourceById, reviewedAt } from "../src/data/sources";
import { signalsFor, priority, type Signal } from "../src/risk/signals";
import {
  emptyArchive,
  buildSummary,
  appendSummary,
  validateArchive,
  compareSummaries,
  summarySchema,
} from "../src/data/archive";
import {
  historicalRecords,
  filterRecords,
  recordSchema,
} from "../src/data/records";
import { decisionKpis } from "../src/risk/kpis";
import { loadArchive } from "../src/data/loadArchive";
const op = operationalSchema.parse(
  JSON.parse(readFileSync("public/data/operational.json", "utf8")),
);
const now = Math.max(
  Date.parse(op.weather!.fetchedAt),
  Date.parse(reviewedAt) + 1000,
);
const text = { en: "TEST ONLY", my: "စမ်းသပ်မှုသာ" };
const alert: Alert = {
  id: "TEST ONLY",
  country: "MM",
  sourceId: "dmh",
  sourceLocation: "Mandalay",
  regionId: "MM-04",
  severity: "advisory",
  type: "heat",
  title: text,
  description: text,
  impacts: text,
  affected: text,
  actions: [text, text, text],
  prepare: [text],
  issuedAt: new Date(now - 1000).toISOString(),
  validFrom: new Date(now - 1000).toISOString(),
  validUntil: new Date(now + DAY).toISOString(),
  confidence: "not-provided",
  confidenceReason: text,
  source: {
    name: "TEST ONLY",
    url: "https://www.dmh.gov.mm/test-only",
    publisher: "DMH",
    originalSeverity: "TEST ONLY",
    retrievedAt: new Date(now).toISOString(),
  },
  kind: "official-bulletin",
  change: text,
};
afterEach(() => vi.unstubAllGlobals());
describe("Canonical geography and provenance", () => {
  it("verifies all 15 unique canonical units and aliases against actual geometry", () => {
    expect(canonicalRegions).toHaveLength(15);
    expect(new Set(regionIds).size).toBe(15);
    const geo = JSON.parse(readFileSync("public/data/myanmar.geojson", "utf8"));
    expect(
      geo.features
        .map((f: { properties: { shapeISO: string } }) => f.properties.shapeISO)
        .sort(),
    ).toEqual([...regionIds].sort());
    for (const r of canonicalRegions)
      for (const alias of r.source_aliases)
        expect(resolveRegion(alias)).toBe(r.canonical_region_id);
    expect(resolveRegion("  NAYPYIDAW ")).toBe("MM-18");
    expect(() => resolveRegion("Unknown Province")).toThrow();
    expect(() => resolveRegion("Shan (North)")).toThrow();
    expect(boundarySubregions["Shan (North)"]).toBe("MM-17");
  });
  it("rejects unknown registry IDs and foreign/missing warning provenance", () => {
    expect(() => sourceById("imaginary")).toThrow();
    expect(alertSchema.safeParse(alert).success).toBe(true);
    for (const patch of [
      { country: "TH" },
      { country: undefined },
      { sourceId: undefined },
      { sourceId: "asmc" },
      { sourceLocation: "" },
      { sourceLocation: "Bangkok" },
      { sourceLocation: "Yangon" },
      { regionId: "TH-50" },
      {
        source: {
          ...alert.source,
          publisher: "WMO",
          url: "https://wmo.int/example",
        },
      },
    ])
      expect(alertSchema.safeParse({ ...alert, ...patch }).success).toBe(false);
  });
  it("every active official Myanmar advisory outranks higher platform levels", () => {
    const data = { ...emptySnapshot, alerts: [alert] };
    expect(priority(op, data, now).kind).toBe("official");
    expect(sortRows(regionalRows(op, data, now))[0].id).toBe("MM-04");
  });
});
describe("Coverage, missingness and update rules", () => {
  it("keeps every region when all measurements are missing", () => {
    const rows = regionalRows(emptyOperational, emptySnapshot, now);
    expect(rows).toHaveLength(15);
    expect(
      rows.every((r) => r.level === "unknown" && r.evidenceCount === 0),
    ).toBe(true);
    expect(coverageKpi(rows)).toMatchObject({
      available: 30,
      expected: 120,
      monitoring: 0,
      monitoringExpected: 90,
      context: 30,
      contextExpected: 30,
      highPriority: 0,
    });
    expect(
      rows.every((r) =>
        r.coverage
          .filter((c) => ["drought", "flood", "official"].includes(c.category))
          .every((c) => c.state === "unavailable"),
      ),
    ).toBe(true);
  });
  it("calculates coverage from actual usable cells and unique regions", () => {
    const fresh = structuredClone(op);
    fresh.weather!.fetchedAt = new Date(now).toISOString();
    fresh.weather!.validAt = new Date(now).toISOString();
    fresh.weather!.through = new Date(now + DAY).toISOString();
    const rows = regionalRows(fresh, emptySnapshot, now);
    expect(coverageKpi(rows)).toMatchObject({
      available: 75,
      monitoring: 45,
      context: 30,
      expected: 120,
    });
    fresh.weather!.regions.pop();
    expect(coverageKpi(regionalRows(fresh, emptySnapshot, now)).available).toBe(
      74,
    );
  });
  it("cannot show low concern with missing inputs, while preserving known elevated evidence", () => {
    const s = (hazard: Signal["hazard"], level: Signal["level"]): Signal => ({
      hazard,
      level,
      source: "ecmwf",
      historical: false,
      evidence: ["test", "စမ်းသပ်"],
    });
    expect(
      overallLevel([
        s("heat", "normal"),
        s("rain", "normal"),
        s("wind", "normal"),
        s("dryness", "unknown"),
      ]),
    ).toBe("unknown");
    expect(overallLevel([s("heat", "warning"), s("rain", "unknown")])).toBe(
      "warning",
    );
    expect(overallLevel([])).toBe("unknown");
  });
  it("does not classify a null/low-baseline rain departure as normal dryness", () => {
    const copy = structuredClone(op);
    copy.history!.regions[0].rainPercent = null;
    expect(
      signalsFor(
        copy,
        emptySnapshot,
        copy.history!.regions[0].id,
        Date.parse(copy.history!.fetchedAt),
      ).find((s) => s.hazard === "dryness")!.level,
    ).toBe("unknown");
  });
  it("expires context and monitoring with source-specific clocks, without refreshing publication dates", () => {
    const states = sourceStatus(op, emptySnapshot, now + 181 * DAY);
    expect(states.find((s) => s.id === "who")!.state).toBe("stale");
    expect(states.find((s) => s.id === "fao")!.state).toBe("stale");
    expect(states.find((s) => s.id === "asmc")!.state).toBe("stale");
    expect(
      coverageKpi(
        regionalRows(emptyOperational, emptySnapshot, now + 181 * DAY),
      ).available,
    ).toBe(0);
    const failed = structuredClone(op);
    failed.health.ecmwf.ok = false;
    expect(
      sourceStatus(failed, emptySnapshot, now).find((s) => s.id === "ecmwf")!
        .failed,
    ).toBe(true);
  });
  it("shows the next scheduled UTC check across midnight", () => {
    expect(nextScheduledUpdate(Date.parse("2026-10-02T22:17:00Z"))).toBe(
      "2026-10-03T04:17:00.000Z",
    );
  });
});
describe("Validated snapshot history", () => {
  const s = buildSummary(op, emptySnapshot, now);
  it("rejects duplicate/unknown regions, null/NaN, missing sources, units, baseline and future dates", () => {
    for (const patch of [
      { regions: [...s.regions.slice(1), s.regions[1]] },
      { coverage: NaN },
      { coverage: null },
      { sourceIds: [] },
      { units: "Fahrenheit" },
      { baseline: "1981–2010" },
      { historyPeriod: "2030-01-01 → 2030-01-30" },
    ])
      expect(summarySchema.safeParse({ ...s, ...patch }).success).toBe(false);
    expect(() =>
      validateArchive(
        {
          version: 1,
          snapshots: [{ ...s, recordedAt: new Date(now + DAY).toISOString() }],
          bulletins: [],
        },
        now,
      ),
    ).toThrow();
  });
  it("does not invent changes or duplicate snapshots when only a retrieval time changes", () => {
    const a = appendSummary(emptyArchive, s, []);
    const repeated = appendSummary(
      a,
      { ...s, recordedAt: new Date(now + 1000).toISOString() },
      [],
    );
    expect(repeated.snapshots).toHaveLength(1);
    expect(
      compareSummaries(s, {
        ...s,
        recordedAt: new Date(now + 1000).toISOString(),
      })!.changes,
    ).toEqual([]);
  });
  it("separates evidence loss/restoration from higher/lower concern and official updates", () => {
    const before = structuredClone(s);
    before.regions[0].heat = "normal";
    before.regions[1].heat = "warning";
    before.regions[2].heat = "unknown";
    const after = structuredClone(before);
    after.regions[0].heat = "watch";
    after.regions[1].heat = "unknown";
    after.regions[2].heat = "normal";
    after.officialIds = ["new"];
    const diff = compareSummaries(before, after)!;
    expect(diff.changes.map((c) => c.direction)).toEqual([
      "increased",
      "data-lost",
      "data-restored",
    ]);
    expect(diff.newOfficial).toEqual(["new"]);
  });
  it("bounds retention and retains original bulletin times", () => {
    let a = emptyArchive;
    for (let i = 0; i < 130; i++)
      a = appendSummary(
        a,
        {
          ...s,
          recordedAt: new Date(now + i * 1000).toISOString(),
          coverage: i % 2 ? 74 : 75,
        },
        [alert],
      );
    expect(a.snapshots).toHaveLength(124);
    expect(a.bulletins[0].issuedAt).toBe(alert.issuedAt);
  });
  it("preserves last validated archive on network or corrupt payload failure", async () => {
    const cached = { version: 1 as const, snapshots: [s], bulletins: [] };
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify(cached),
      setItem: vi.fn(),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: async () => ({ bad: "data" }),
      }),
    );
    vi.spyOn(Date, "now").mockReturnValue(now);
    const result = await loadArchive();
    expect(result.error).toBe(true);
    expect(result.cached).toBe(true);
    expect(result.data.snapshots[0].recordedAt).toBe(s.recordedAt);
    vi.restoreAllMocks();
  });
});
describe("Historical filters do not invent regional evidence", () => {
  const all = {
    year: "all",
    region: "all",
    hazard: "all",
    phase: "all",
    evidence: "all",
  };
  it("filters year, named region, hazard, phase and evidence type", () => {
    expect(
      filterRecords(historicalRecords, { ...all, year: "2016" }).map(
        (r) => r.id,
      ),
    ).toEqual(["mm-enso-2015-16"]);
    expect(
      filterRecords(historicalRecords, {
        ...all,
        region: "MM-16",
        hazard: "flood",
        year: "2026",
        phase: "Not attributed",
        evidence: "reported-impact",
      }),
    ).toHaveLength(1);
    expect(
      filterRecords(historicalRecords, { ...all, region: "MM-04" }),
    ).toHaveLength(0);
    expect(
      filterRecords(historicalRecords, { ...all, hazard: "drought" }),
    ).toHaveLength(0);
  });
  it("rejects invalid history dates and missing source attribution", () => {
    expect(
      recordSchema.safeParse({ ...historicalRecords[0], start: "2015-02-30" })
        .success,
    ).toBe(false);
    expect(
      recordSchema.safeParse({ ...historicalRecords[0], sourceId: "bad" })
        .success,
    ).toBe(false);
  });
});

it("preserves official KPI validity and retrieval with incomplete coverage and no weather", () => {
  const data = {
    ...emptySnapshot,
    checkedAt: new Date(now).toISOString(),
    alerts: [alert],
  };
  const kpis = decisionKpis(emptyOperational, data, now);
  const official = kpis.find((k) => k.id === "official")!;
  const watch = kpis.find((k) => k.id === "watch")!;
  expect(official.value).toBe("≥ 1");
  expect(watch.value).toBe("≥ 1/15");
  for (const k of [official, watch]) {
    expect(k.period).toContain(alert.issuedAt);
    expect(k.period).toContain(alert.validUntil);
    expect(k.updatedAt).toBe(alert.source.retrievedAt);
  }
  expect(kpis.find((k) => k.id === "concern")!.value).toBeNull();
  expect(
    decisionKpis(emptyOperational, data, now + 2 * DAY).find(
      (k) => k.id === "official",
    )!.value,
  ).toBeNull();
});
