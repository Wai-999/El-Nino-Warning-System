import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import {
  parseRoni,
  parseProbabilities,
} from "../src/data/adapters/ensoClimate";
import {
  emptyClimate,
  validateClimate,
  roniFresh,
  probabilitiesFresh,
  loadClimate,
} from "../src/data/climate";
import { localDate, localDigits, configureNumerals } from "../src/data/locale";
import {
  educationalAnomaly,
  educationalStandardScore,
  educationalOutcomes,
} from "../src/climate/education";
import { csv, number } from "../src/data/presentation";
import registry from "../src/data/indicators.json";
import { buildUrl } from "../src/data/providers/openMeteo";
import { reserveBaselineBudget } from "../src/data/providerBudget";
const now = Date.parse("2026-10-31T18:00:00Z"),
  stamp = new Date(now).toISOString();
const text = readFileSync("tests/fixtures/noaa-roni.txt", "utf8"),
  html = readFileSync("tests/fixtures/noaa-probabilities.html", "utf8");
const roni = parseRoni(text, stamp),
  probabilities = parseProbabilities(html, stamp);
const snapshot = { ...emptyClimate, checkedAt: stamp, roni, probabilities };
afterEach(() => {
  configureNumerals("latn");
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("NOAA climate provenance", () => {
  it("enforces a daily baseline budget across retries and resets only on a new day", () => {
    const first = reserveBaselineBudget(null, "2026-10-31", 3000);
    expect(reserveBaselineBudget(first, "2026-10-31", 1500).weightedCalls).toBe(
      4500,
    );
    expect(() => reserveBaselineBudget(first, "2026-10-31", 1501)).toThrow(
      "budget exhausted",
    );
    expect(reserveBaselineBudget(first, "2026-11-01", 10).weightedCalls).toBe(
      10,
    );
    expect(() =>
      reserveBaselineBudget(
        { day: "2026-10-31", weightedCalls: NaN },
        "2026-10-31",
        10,
      ),
    ).toThrow();
  });
  it("requests the correct Myanmar day across UTC and year boundaries", () => {
    const url = buildUrl(
      [{ regionId: "MM-04", lat: 21.9, lon: 96.1, weight: 1 }],
      false,
      undefined,
      undefined,
      Date.parse("2026-12-31T18:00:00Z"),
    );
    expect(url.searchParams.get("start_date")).toBe("2027-01-01");
    expect(url.searchParams.get("end_date")).toBe("2027-01-07");
    expect(url.searchParams.get("timezone")).toBe("Asia/Yangon");
  });
  it("parses real source fixtures and keeps RONI distinct from monthly Niño3.4", () => {
    expect(roni.points[0]).toEqual({
      season: "DJF",
      year: 1950,
      anomaly: -1.19,
    });
    expect(roni.points.at(-1)).toEqual({
      season: "JAS",
      year: 2026,
      anomaly: 1.69,
    });
    expect(probabilities.issueMonth).toBe("2026-10");
    expect(probabilities.rows).toHaveLength(9);
    expect(probabilities.rows.at(-1)).toEqual({
      season: "MJJ",
      laNina: 13,
      neutral: 70,
      elNino: 17,
    });
  });
  it("rejects duplicate RONI seasons, malformed tables and broken probabilities", () => {
    expect(() => parseRoni(text + "\nJAS 2026 1.69\n", stamp)).toThrow();
    expect(() =>
      parseRoni(text.replace("JAS  2026", "BAD  2026"), stamp),
    ).toThrow();
    expect(() =>
      parseProbabilities(
        html.replace('id="probabilities-table"', 'id="wrong-table"'),
        stamp,
      ),
    ).toThrow();
    expect(() =>
      validateClimate(
        {
          ...snapshot,
          probabilities: {
            ...probabilities,
            rows: probabilities.rows.map((r, i) =>
              i === 0 ? { ...r, elNino: 101 } : r,
            ),
          },
        },
        now,
      ),
    ).toThrow();
  });
  it("rejects incomplete seasons and future retrievals", () => {
    expect(() => parseRoni(text, "2026-07-01T00:00:00.000Z")).toThrow();
    expect(() =>
      validateClimate(
        { ...snapshot, checkedAt: "2026-11-01T00:00:00.000Z" },
        now,
      ),
    ).toThrow();
  });
  it("does not freshen an old index or outlook on a later retrieval", () => {
    expect(roniFresh(roni, now)).toBe(true);
    expect(probabilitiesFresh(probabilities, now)).toBe(true);
    const later = Date.parse("2027-02-01T00:00:00Z");
    expect(
      roniFresh({ ...roni, retrievedAt: new Date(later).toISOString() }, later),
    ).toBe(false);
    expect(
      probabilitiesFresh(
        { ...probabilities, retrievedAt: new Date(later).toISOString() },
        later,
      ),
    ).toBe(false);
  });
  it.each([429, 503])(
    "retains independently dated last-good data on HTTP %s",
    async (status) => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const old = {
        ...snapshot,
        checkedAt: stamp,
        roni: { ...roni, retrievedAt: "2026-10-30T00:00:00.000Z" },
      };
      const stored = JSON.stringify(old);
      vi.stubGlobal("localStorage", {
        getItem: () => stored,
        setItem: vi.fn(),
      });
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("Unavailable", { status })),
      );
      const result = await loadClimate();
      expect(result.error).toBe(true);
      expect(result.cached).toBe(true);
      expect(result.data.roni?.retrievedAt).toBe("2026-10-30T00:00:00.000Z");
    },
  );
  it("fails closed when network and cache are invalid", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => '{"bad":"data"}',
      setItem: vi.fn(),
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Error("network")));
    expect((await loadClimate()).data).toEqual(emptyClimate);
  });
});
describe("localization, exports and isolated education", () => {
  it("formats Myanmar numbers/dates even without native Myanmar locale support", () => {
    expect(number(31.2, "my")).toBe("31.2");
    expect(localDate("2026-10-31T18:00:00Z", "my", true)).toBe(
      "2026 နိုဝင်ဘာ 1၊ 00:30 MMT",
    );
    configureNumerals("mymr");
    expect(number(31.2, "my")).toBe("၃၁.၂");
    expect(localDigits("2026-10", "my")).toBe("၂၀၂၆-၁၀");
    expect(localDate("2026-10-31T18:00:00Z", "my", true)).toBe(
      "၂၀၂၆ နိုဝင်ဘာ ၁၊ ၀၀:၃၀ MMT",
    );
    expect(localDate("invalid", "my")).toBe("—");
    expect(number(31.2, "en")).toBe("31.2");
    configureNumerals("latn");
    expect(localDigits("၇ ရက်", "my")).toBe("7 ရက်");
  });
  it("handles zero baselines and prevents a toy standard score from pretending to be SPI", () => {
    expect(educationalAnomaly(10, 0)).toEqual({
      difference: 10,
      percent: null,
    });
    expect(educationalStandardScore(100, 100, 0)).toBeNull();
    expect(educationalStandardScore(40, 100, 30)).toBe(-2);
    expect(educationalOutcomes(60)).toBe(6);
    expect(educationalOutcomes(120)).toBe(10);
  });
  it("escapes export cells and neutralizes formula injection", () => {
    expect(csv([['=cmd("x")', "field,quoted", -2]])).toBe(
      '"\'=cmd(""x"")","field,quoted","-2"',
    );
  });
  it("requires unique indicator IDs and complete provenance, including unavailable reasons", () => {
    expect(new Set(registry.indicators.map((i) => i.id)).size).toBe(
      registry.indicators.length,
    );
    for (const i of registry.indicators) {
      for (const key of [
        "name",
        "question",
        "definition",
        "unit",
        "kind",
        "spatial",
        "temporal",
        "primarySource",
        "sourceUrl",
        "license",
        "refresh",
        "freshnessTTL",
        "uncertainty",
        "qa",
        "warningApplicability",
        "visualization",
        "fallback",
        "summaryMy",
      ])
        expect(i).toHaveProperty(key);
      expect(i.name.my).toMatch(/[\u1000-\u109f]/);
      expect(i.summaryMy).toMatch(/[\u1000-\u109f]/);
      expect(new URL(i.sourceUrl).protocol).toBe("https:");
      if (i.status !== "implemented")
        expect(i.fallback.length).toBeGreaterThan(30);
    }
  });
});
