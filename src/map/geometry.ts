import { geoArea } from "d3-geo";
import type { Feature, Geometry } from "geojson";
// RFC 7946 exterior rings are counterclockwise; d3's spherical geometry expects
// clockwise small-area exteriors. Adapt in memory, preserving the source GeoJSON.
export function forSphericalProjection<P>(
  feature: Feature<Geometry, P>,
): Feature<Geometry, P> {
  if (geoArea(feature.geometry) <= 2 * Math.PI) return feature;
  const g = feature.geometry;
  if (g.type === "Polygon")
    return {
      ...feature,
      geometry: {
        ...g,
        coordinates: g.coordinates.map((r) => [...r].reverse()),
      },
    };
  if (g.type === "MultiPolygon")
    return {
      ...feature,
      geometry: {
        ...g,
        coordinates: g.coordinates.map((p) => p.map((r) => [...r].reverse())),
      },
    };
  return feature;
}
