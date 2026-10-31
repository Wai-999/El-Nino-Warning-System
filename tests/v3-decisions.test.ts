import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import {
  geography,
  geographySchema,
  townships,
  searchTownships,
  townshipByCode,
  readSavedPlaces,
  savedPlace,
  normalizeSearch,
} from "../src/data/locations";
import {
  WHO_MYANMAR,
  parseHealthAdvisories,
  validateHealthAdvisories,
  healthFeedUrl,
  healthFeedFresh,
  recentHealthItems,
} from "../src/data/healthAdvisories";
import { loadHealthAdvisories } from "../src/data/loadHealthAdvisories";
import { localBriefing } from "../src/risk/briefing";
import { emptyOperational } from "../src/data/operational";
import { emptySnapshot } from "../src/data/schema";
const fixture = JSON.parse(
  readFileSync("tests/fixtures/who-myanmar-don.json", "utf8"),
);
const stamp = "2026-10-31T22:20:00.000Z",
  now = Date.parse(stamp);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("versioned township reference and safe selection", () => {
  it("retains complete typed parents and separates district/township code collisions", () => {
    expect(townships).toHaveLength(330);
    expect(new Set(townships.map((t) => t.code)).size).toBe(330);
    expect(new Set(townships.map((t) => t.regionId)).size).toBe(15);
    expect(geography.levels.adm2.find((d) => d.code === "MMR001001")?.en).toBe(
      "Myitkyina",
    );
    expect(townshipByCode("MMR001001")?.parentCode).toBe("MMR001001");
    expect(geography.validOn).toBe("2024-02-15");
  });
  it("rejects missing parents and duplicate PCodes rather than silently assigning a region", () => {
    const bad = structuredClone(geography);
    bad.levels.adm3[0].parentCode = "UNKNOWN";
    expect(() => geographySchema.parse(bad)).toThrow();
    const duplicate = structuredClone(geography);
    duplicate.levels.adm3[0].code = duplicate.levels.adm3[1].code;
    expect(() => geographySchema.parse(duplicate)).toThrow();
  });
  it("searches bilingual names, reviewed historical aliases, PCode and tolerant English spelling", () => {
    expect(searchTownships("Prome").some((t) => t.code === "MMR008001")).toBe(
      true,
    );
    expect(
      searchTownships("မြစ်ကြီးနား").some((t) => t.code === "MMR001001"),
    ).toBe(true);
    expect(searchTownships("mmr 001001")).toHaveLength(1);
    expect(
      searchTownships("Myitkyin").some((t) => t.code === "MMR001001"),
    ).toBe(true);
    expect(normalizeSearch("မြစ်\u200bကြီးနား")).toBe(
      normalizeSearch("မြစ်ကြီးနား"),
    );
    expect(searchTownships("Htantabin").length).toBeGreaterThan(1);
  });
  it("keeps source Bago/Shan subregions while explicitly mapping regional weather fallback", () => {
    expect(
      townships
        .filter((t) => t.admin1.en === "Bago (West)")
        .every((t) => t.regionId === "MM-02"),
    ).toBe(true);
    expect(
      townships
        .filter((t) => t.admin1.en === "Shan (East)")
        .every((t) => t.regionId === "MM-17"),
    ).toBe(true);
    expect(savedPlace("township:MMR001001")?.regionId).toBe("MM-11");
    expect(savedPlace("township:BAD")).toBeNull();
  });
  it("bounds and validates saved places and never silently remaps unknown codes", () => {
    expect(
      readSavedPlaces(
        '["township:MMR001001","BAD","region:MM-04","township:MMR001001"]',
      ),
    ).toEqual(["township:MMR001001", "region:MM-04"]);
    expect(readSavedPlaces("{corrupt")).toEqual([]);
    expect(
      readSavedPlaces(
        JSON.stringify(townships.slice(0, 20).map((t) => `township:${t.code}`)),
      ),
    ).toHaveLength(12);
  });
});
describe("independent WHO publication monitor", () => {
  it("uses exact Myanmar tags, source issue dates and unknown expiry", () => {
    const data = parseHealthAdvisories(fixture, stamp);
    expect(data.items).toHaveLength(3);
    expect(data.items[0].issuedAt).toBe("2019-08-22T19:00:00Z");
    expect(data.items[0].sourceModifiedAt).toContain("2022-07-28");
    expect(data.items[0].expiresAt).toBeNull();
    expect(data.items[0].kind).toBe("official-health-bulletin");
    expect(healthFeedFresh(data, now)).toBe(true);
    expect(recentHealthItems(data, now)).toEqual([]);
    expect(healthFeedUrl().searchParams.get("$filter")).toContain(WHO_MYANMAR);
    expect(healthFeedUrl().searchParams.get("$orderby")).toBe(
      "PublicationDateAndTime desc",
    );
  });
  it("treats an empty healthy response as limited source coverage, not national all-clear", () => {
    const data = parseHealthAdvisories({ value: [] }, stamp);
    expect(data.ok).toBe(true);
    expect(data.coverage).toBe("who-don-only");
    expect(data.items).toEqual([]);
  });
  it("rejects country-substring false positives, foreign URLs, duplicates and future issues", () => {
    for (const mutate of [
      (x: typeof fixture) => {
        x.value[0].regionscountries = ["Bangladesh"];
        x.value[0].Title = "Displaced Myanmar nationals - Bangladesh";
      },
      (x: typeof fixture) => {
        x.value[0].ItemDefaultUrl = "https://evil.example/fake";
      },
      (x: typeof fixture) => {
        x.value[0].PublicationDateAndTime = "2027-01-01T00:00:00Z";
      },
      (x: typeof fixture) => {
        x.value.push(x.value[0]);
      },
    ]) {
      const raw = structuredClone(fixture);
      mutate(raw);
      expect(() => parseHealthAdvisories(raw, stamp)).toThrow();
    }
    const data = parseHealthAdvisories(fixture, stamp);
    expect(() =>
      validateHealthAdvisories(
        { ...data, checkedAt: "2027-01-01T00:00:00Z" },
        now,
      ),
    ).toThrow();
    expect(() =>
      validateHealthAdvisories(
        {
          ...data,
          items: [{ ...data.items[0], expiresAt: "2030-01-01T00:00:00Z" }],
        },
        now,
      ),
    ).toThrow();
  });
  it("preserves dated cached publications on network failure", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const data = parseHealthAdvisories(fixture, stamp);
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify(data) });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );
    const result = await loadHealthAdvisories();
    expect(result.cached).toBe(true);
    expect(result.error).toBe(true);
    expect(result.data.items[0].issuedAt).toBe("2019-08-22T19:00:00Z");
    expect(result.data.retrievedAt).toBe(stamp);
  });
  it("keeps missing forecast and warning inputs unknown in a deterministic briefing", () => {
    const result = localBriefing(emptyOperational, emptySnapshot, "MM-04", now);
    expect(result.forecast).toBeNull();
    expect(result.officialCoverage).toBe("unavailable");
    expect(result.official).toEqual([]);
  });
});
