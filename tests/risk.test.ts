import { describe, it, expect } from "vitest";
import {
  activeAlerts,
  regionalLevel,
  freshness,
  warningHistory,
  COVERAGE_TTL,
} from "../src/risk/engine";
import {
  emptySnapshot,
  snapshotSchema,
  alertSchema,
  type Alert,
} from "../src/data/schema";
import { parseNoaa } from "../src/data/adapters/noaa";
const now = Date.parse("2026-09-30T00:00:00Z");
const copy = { en: "Source reviewed test text", my: "စမ်းသပ်စာသား" };
const alert: Alert = {
  id: "TEST-ONLY",
  regionId: "MM-04",
  severity: "warning",
  type: "heat",
  title: copy,
  description: copy,
  impacts: copy,
  affected: copy,
  actions: [copy, copy, copy],
  prepare: [copy],
  issuedAt: "2026-09-29T00:00:00Z",
  validFrom: "2026-09-29T00:00:00Z",
  validUntil: "2026-10-01T00:00:00Z",
  confidence: "not-provided",
  confidenceReason: copy,
  source: {
    name: "Test fixture only",
    url: "https://www.dmh.gov.mm/test-fixture",
    publisher: "DMH",
    originalSeverity: "Test fixture",
    retrievedAt: "2026-09-29T00:00:00Z",
  },
  country: "MM",
  sourceId: "dmh",
  sourceLocation: "Mandalay",
  kind: "official-bulletin",
  change: copy,
};
const snapshot = { ...emptySnapshot, checkedAt: "2026-09-30T00:00:00Z" };
describe("Fail-closed warning policy", () => {
  it("never translates missing data into normal", () =>
    expect(regionalLevel(snapshot, undefined, now)).toBe("unknown"));
  it("never translates global ENSO into a Myanmar warning", () => {
    const enso = parseNoaa(
      "NWS 10 September 2026 ENSO Alert System Status: El Niño Advisory The next ENSO Diagnostics Discussion is scheduled for 8 October 2026.",
      new Date(now),
    );
    expect(regionalLevel({ ...snapshot, enso }, "MM-04", now)).toBe("unknown");
  });
  it("selects the most severe valid warning for the selected region only", () => {
    const alerts = [
      { ...alert, id: "a", severity: "advisory" as const },
      alert,
      {
        ...alert,
        id: "other",
        regionId: "MM-06",
        severity: "severe" as const,
      },
    ];
    expect(regionalLevel({ ...snapshot, alerts }, "MM-04", now)).toBe(
      "warning",
    );
    expect(regionalLevel({ ...snapshot, alerts }, "MM-11", now)).toBe(
      "unknown",
    );
  });
  it("expires at the exact endpoint", () => {
    expect(
      activeAlerts(
        { ...snapshot, alerts: [alert] },
        Date.parse(alert.validUntil),
      ),
    ).toEqual([]);
    expect(
      warningHistory(
        { ...snapshot, alerts: [alert] },
        Date.parse(alert.validUntil),
      ),
    ).toHaveLength(1);
  });
  it("does not show future or future-issued alerts as active", () => {
    expect(
      activeAlerts(
        {
          ...snapshot,
          alerts: [
            {
              ...alert,
              validFrom: "2026-10-01T00:00:00Z",
              validUntil: "2026-10-02T00:00:00Z",
            },
          ],
        },
        now,
      ),
    ).toHaveLength(0);
    expect(freshness("2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z", now)).toBe(
      "invalid",
    );
  });
  it("requires fresh and complete coverage for normal", () => {
    const d = {
      ...snapshot,
      regionalCoverage: "complete" as const,
      regionalCheckedAt: new Date(now - 1000).toISOString(),
    };
    expect(regionalLevel(d, "MM-04", now)).toBe("normal");
    expect(
      regionalLevel({ ...d, regionalCoverage: "partial" }, "MM-04", now),
    ).toBe("unknown");
    expect(regionalLevel(d, "MM-04", now + COVERAGE_TTL)).toBe("unknown");
  });
  it("rejects invalid timestamps and inverted periods", () => {
    expect(freshness("bad", "bad", now)).toBe("invalid");
    expect(
      alertSchema.safeParse({ ...alert, validUntil: alert.validFrom }).success,
    ).toBe(false);
  });
  it("rejects unknown regions and mismatched source domains", () => {
    expect(
      alertSchema.safeParse({ ...alert, regionId: "XX-999" }).success,
    ).toBe(false);
    expect(
      alertSchema.safeParse({
        ...alert,
        source: { ...alert.source, url: "https://dmh.gov.mm.evil.example/" },
      }).success,
    ).toBe(false);
  });
  it("rejects duplicates, incomplete translations, and fake confidence", () => {
    expect(
      snapshotSchema.safeParse({ ...snapshot, alerts: [alert, alert] }).success,
    ).toBe(false);
    expect(
      alertSchema.safeParse({ ...alert, title: { en: "x" } }).success,
    ).toBe(false);
    expect(alertSchema.safeParse({ ...alert, confidence: "99%" }).success).toBe(
      false,
    );
  });
  it("rejects future issue and retrieval dates", () =>
    expect(
      snapshotSchema.safeParse({
        ...snapshot,
        alerts: [{ ...alert, issuedAt: "2026-10-01T00:00:00Z" }],
      }).success,
    ).toBe(false));
  it("keeps historical and active records separate and deduplicated", () => {
    const expired = { ...alert, validUntil: "2026-09-29T23:00:00Z" };
    expect(
      warningHistory(
        { ...snapshot, alerts: [expired], history: [expired] },
        now,
      ),
    ).toHaveLength(1);
  });
});
describe("NOAA adapter", () => {
  it("parses official status with HTML and entities", () => {
    const b = parseNoaa(
      "<b>NWS</b> 10 September 2026 ENSO Alert System Status: <a>El Ni&ntilde;o Advisory</a> The next ENSO Diagnostics Discussion is scheduled for 8 October 2026.",
      new Date(now),
    );
    expect(b.status).toBe("El Niño Advisory");
    expect(b.issuedAt).toBe("2026-09-10T00:00:00.000Z");
    expect(b.validUntil).toBe("2026-10-08T23:59:59.000Z");
  });
  it("fails safely on source format changes", () =>
    expect(() => parseNoaa("El Niño is here")).toThrow());
  it("rejects unrecognized and implausibly distant dates", () =>
    expect(() =>
      parseNoaa(
        "NWS 10 September 2026 ENSO Alert System Status: El Niño Advisory The next ENSO Diagnostics Discussion is scheduled for 8 October 2027.",
        new Date(now),
      ),
    ).toThrow());
  it("does not refresh the issue date when retrieving the same bulletin", () => {
    const text =
      "NWS 10 September 2026 ENSO Alert System Status: El Niño Advisory The next ENSO Diagnostics Discussion is scheduled for 8 October 2026.";
    expect(parseNoaa(text, new Date(now + 86400000)).issuedAt).toBe(
      parseNoaa(text, new Date(now)).issuedAt,
    );
  });
});
