import { readFileSync } from "node:fs";
import { it, expect } from "vitest";
import { geoArea, geoBounds } from "d3-geo";
import type { FeatureCollection } from "geojson";
import { forSphericalProjection } from "../src/map/geometry";
it("renders all source polygons inside Myanmar instead of the complementary world polygon", () => {
  const geo = JSON.parse(
    readFileSync("public/data/myanmar.geojson", "utf8"),
  ) as FeatureCollection;
  expect(geo.features).toHaveLength(14);
  for (const f of geo.features) {
    const normalized = forSphericalProjection(f);
    expect(geoArea(normalized)).toBeLessThan(0.02);
    const [[west, south], [east, north]] = geoBounds(normalized);
    expect(west).toBeGreaterThan(90);
    expect(east).toBeLessThan(102);
    expect(south).toBeGreaterThan(8);
    expect(north).toBeLessThan(30);
  }
});
