import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { healthTopics, healthSources } from "../src/data/healthGuidance";
import {
  reportsForLocation,
  surveillance,
  surveillanceState,
} from "../src/data/surveillance";
import { learningVideos } from "../src/data/videos";
import { canonicalLocation } from "../src/risk/locations";
import { regionIds } from "../src/data/regions";
import { decisionKpis } from "../src/risk/kpis";
import { nationalImpactMetrics } from "../src/risk/impactMetrics";
import {
  emptyOperational,
  operationalSchema,
  DAY,
} from "../src/data/operational";
import { emptySnapshot } from "../src/data/schema";
const op = operationalSchema.parse(
  JSON.parse(readFileSync("public/data/operational.json", "utf8")),
);
const now = Date.parse(op.weather!.fetchedAt);
describe("health, media and KPI evidence contracts", () => {
  it("covers the nine required pathways with bilingual triage and authoritative clinical references", () => {
    expect(healthTopics.map((t) => t.id).sort()).toEqual([
      "cramps",
      "dehydration",
      "dengue",
      "diarrhoea",
      "exhaustion",
      "food",
      "heatstroke",
      "malaria",
      "smoke",
    ]);
    for (const topic of healthTopics) {
      for (const field of [
        "pathway",
        "vulnerable",
        "signs",
        "now",
        "care",
        "emergency",
        "prevention",
      ] as const) {
        expect(topic[field][0].length).toBeGreaterThan(15);
        expect(topic[field][1]).toMatch(/[\u1000-\u109f]/);
      }
      expect(topic.sources.length).toBeGreaterThan(0);
      for (const id of topic.sources)
        expect(["www.who.int", "www.cdc.gov", "www.nhs.uk"]).toContain(
          new URL(healthSources[id].url).hostname,
        );
    }
  });
  it("preserves immediate emergency triage, safe swallowing and illness-specific care safeguards", () => {
    const byId = (id: string) => healthTopics.find((t) => t.id === id)!;
    expect(byId("heatstroke").now[0]).toMatch(/immediately/);
    expect(byId("heatstroke").now[0]).toMatch(
      /Do not give drinks.*confused.*unconscious/,
    );
    expect(byId("heatstroke").care[0]).toMatch(/Do not wait/);
    expect(byId("heatstroke").signs[0]).toMatch(/Sweating may still/);
    expect(byId("dengue").care[0]).toMatch(/after fever falls/);
    expect(byId("malaria").now[0]).toMatch(/prompt testing/);
    expect(byId("diarrhoea").now[0]).toMatch(/exactly as directed/);
    expect(JSON.stringify(healthTopics)).not.toMatch(
      /\d+\s*(mg|mcg|ml\/kg)|take antibiotics|El Niño causes (dengue|malaria)|wait 30 minutes/i,
    );
  });
  it("keeps surveillance dated, geographically qualified and independent of weather", () => {
    const issued = Date.parse(surveillance.issuedAt);
    expect(surveillanceState(issued - 1)).toBe("unavailable");
    expect(surveillanceState(issued + 30 * DAY)).toBe("current");
    expect(surveillanceState(issued + 31 * DAY)).toBe("aging");
    expect(surveillanceState(issued + 61 * DAY)).toBe("stale");
    expect(reportsForLocation("MM-18")).toEqual([]);
    expect(reportsForLocation("MM")).toHaveLength(2);
    expect(reportsForLocation("MM-16")[0].text[0]).toMatch(
      /Sittwe.*not evidence for every township/,
    );
    for (const r of surveillance.reports)
      for (const id of r.regions) expect(regionIds).toContain(id);
  });
  it("uses only country and canonical regions, never silently defaults invalid locations to Mandalay", () => {
    expect(canonicalLocation(null)).toBe("MM");
    expect(canonicalLocation("MM-99")).toBe("MM");
    expect(canonicalLocation("Yangon")).toBe("MM");
    for (const id of regionIds) expect(canonicalLocation(id)).toBe(id);
  });
  it("does not convert missing warning or hazard evidence to zero or normal", () => {
    const missing = decisionKpis(emptyOperational, emptySnapshot, now);
    for (const id of ["concern", "watch", "official"])
      expect(missing.find((k) => k.id === id)!.value).toBeNull();
    expect(missing.find((k) => k.id === "coverage")!.value).toMatch(/\/120$/);
    for (const k of decisionKpis(op, emptySnapshot, now)) {
      expect(k.unit[0]).toBeTruthy();
      expect(k.method[0]).toBeTruthy();
      expect(k.why[0]).toBeTruthy();
      expect(k.source[0]).toBeTruthy();
      if (k.id !== "official") {
        expect(k.period).toBeTruthy();
        expect(k.updatedAt).toBeTruthy();
      }
    }
    expect(JSON.stringify(missing)).not.toMatch(/NaN|Infinity/);
  });
  it("national ranges are extrema of regional values, not invented national means; stale data is excluded", () => {
    const metrics = nationalImpactMetrics(op, now),
      temperature = metrics.find((m) => m.id === "heat")!;
    expect(temperature.range).toEqual([
      Math.min(...op.weather!.regions.map((r) => r.next24.max)),
      Math.max(...op.weather!.regions.map((r) => r.next24.max)),
    ]);
    for (const m of nationalImpactMetrics(emptyOperational, now))
      expect(m.range).toBeNull();
    for (const m of nationalImpactMetrics(op, now + 40 * DAY)) {
      expect(m.range).toBeNull();
      expect(m.count).toBe(0);
    }
  });
  it("accepts only the verified BBC publisher/video identities and explicit publication metadata", () => {
    expect(new Set(learningVideos.map((v) => v.id)).size).toBe(
      learningVideos.length,
    );
    for (const v of learningVideos) {
      expect(new URL(v.url).hostname).toBe("www.youtube.com");
      expect(new URL(v.url).searchParams.get("v")).toBe(v.id);
      expect(v.channelId).toBe("UCd9maKo3B6jX8pCPzLa2hvA");
      expect(v.channel).toBe("https://www.youtube.com/@BBCNewsBurmese");
      expect(v.category).toBe("verified-news");
      expect(v.thumbnail).toBe(`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`);
      expect(Date.parse(v.published)).toBeLessThanOrEqual(now);
      expect(v.seconds).toBeGreaterThan(0);
    }
    expect(learningVideos[0].published).toBe("2026-06-04");
    expect(learningVideos[1].why[0]).toMatch(/not today/);
  });
});
