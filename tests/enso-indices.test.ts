import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  parseOniV6,
  parseMonthlyIndex,
  validateEnsoIndices,
  emptyEnsoIndices,
  indexFresh,
} from "../src/data/ensoIndices";
const oniText = readFileSync("tests/fixtures/noaa-oni-v6.html", "utf8"),
  soiText = readFileSync("tests/fixtures/noaa-soi.txt", "utf8"),
  meiText = readFileSync("tests/fixtures/noaa-meiv2.txt", "utf8");
const at = "2026-11-01T18:00:00.000Z";
const oni = parseOniV6(oniText, at),
  soi = parseMonthlyIndex(soiText, "soi", at),
  mei = parseMonthlyIndex(meiText, "mei", at);
const snapshot = () => ({
  ...emptyEnsoIndices,
  checkedAt: at,
  series: { oni, soi, mei },
});
describe("distinct published NOAA indices", () => {
  it("reads ONI v6 anomaly values, including the unclosed partial final year row", () => {
    expect(oni.points.at(-1)).toEqual({
      label: "JAS 2026",
      value: 2.2,
      startMonth: "2026-07",
      endMonth: "2026-09",
      completedAt: "2026-10-01T00:00:00.000Z",
    });
    expect(oni.points[0].label).toBe("DJF 1950");
    expect(oni.points[0].value).toBe(-1.3);
    expect(() => parseOniV6(oniText.replaceAll(/v6|\.v6/g, "v5"), at)).toThrow(
      "version",
    );
  });
  it("reads the SOI standardized block rather than the numerically different pressure anomaly", () => {
    expect(soi.points.at(-1)?.label).toBe("2026-09");
    expect(soi.points.at(-1)?.value).toBe(-2);
    expect(soi.points.at(-1)?.value).not.toBe(-3.3);
    expect(soi.points.every((p) => p.value > -100)).toBe(true);
    expect(() =>
      parseMonthlyIndex(soiText.split("STANDARDIZED")[0], "soi", at),
    ).toThrow("block");
  });
  it("binds MEI columns to overlapping two-month periods including the December/January year boundary", () => {
    const jan = mei.points.find((p) => p.label === "DJ 2026")!;
    expect(jan.startMonth).toBe("2025-12");
    expect(jan.endMonth).toBe("2026-01");
    expect(mei.points.at(-1)).toEqual({
      label: "AS 2026",
      startMonth: "2026-08",
      endMonth: "2026-09",
      completedAt: "2026-10-01T00:00:00.000Z",
      value: 2.37,
    });
    expect(mei.points.some((p) => p.value === -999)).toBe(false);
  });
  it("rejects future or duplicate scientific periods and source confusion, and lets a failed source remain independently missing", () => {
    expect(
      validateEnsoIndices(snapshot(), Date.parse(at)).series.soi,
    ).not.toBeNull();
    for (const mutate of [
      (d: ReturnType<typeof snapshot>) => {
        d.series.oni.points[1] = d.series.oni.points[0];
      },
      (d: ReturnType<typeof snapshot>) => {
        d.series.mei.points[0].startMonth = d.series.mei.points[0].endMonth;
      },
      (d: ReturnType<typeof snapshot>) => {
        d.series.soi.source = d.series.oni.source;
      },
      (d: ReturnType<typeof snapshot>) => {
        d.series.oni.retrievedAt = "2026-09-01T00:00:00.000Z";
      },
    ]) {
      const copy = structuredClone(snapshot());
      mutate(copy);
      expect(() => validateEnsoIndices(copy, Date.parse(at))).toThrow();
    }
    expect(
      validateEnsoIndices(
        { ...snapshot(), series: { oni, soi: null, mei } },
        Date.parse(at),
      ).series.soi,
    ).toBeNull();
    expect(indexFresh(oni, Date.parse(at))).toBe(true);
    expect(
      indexFresh(
        { ...oni, retrievedAt: "2027-02-01T00:00:00.000Z" },
        Date.parse("2027-02-01"),
      ),
    ).toBe(false);
  });
});
