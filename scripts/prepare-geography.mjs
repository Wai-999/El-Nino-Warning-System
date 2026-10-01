import { readFile, writeFile } from "node:fs/promises";
import { geoContains, geoArea } from "d3-geo";
const source = JSON.parse(await readFile(process.argv[2], "utf8"));
const codes = {
  Sagaing: "MM-01",
  Bago: "MM-02",
  Magway: "MM-03",
  Mandalay: "MM-04",
  Tanintharyi: "MM-05",
  Yangon: "MM-06",
  Ayeyarwady: "MM-07",
  Kachin: "MM-11",
  Kayah: "MM-12",
  Kayin: "MM-13",
  Chin: "MM-14",
  Mon: "MM-15",
  Rakhine: "MM-16",
  Shan: "MM-17",
  "Nay Pyi Taw": "MM-18",
};
const groups = {};
for (const f of source.features) {
  const name = f.properties.adm1_name.replace(/ \(.+\)/, "");
  const id = codes[name];
  if (!id) throw Error("Unknown boundary");
  const g = (groups[id] ??= {
    type: "Feature",
    properties: { shapeISO: id, shapeName: name },
    geometry: { type: "MultiPolygon", coordinates: [] },
  });
  g.geometry.coordinates.push(
    ...(f.geometry.type === "Polygon"
      ? [f.geometry.coordinates]
      : f.geometry.coordinates),
  );
}
const samples = [];
for (const f of Object.values(groups).sort((a, b) =>
  a.properties.shapeISO.localeCompare(b.properties.shapeISO),
)) {
  const spherical = structuredClone(f);
  if (geoArea(spherical) > 2 * Math.PI)
    spherical.geometry.coordinates.forEach((p) =>
      p.forEach((r) => r.reverse()),
    );
  const cells = [];
  for (let lat = 9; lat <= 29; lat += 0.25)
    for (let lon = 92; lon <= 102; lon += 0.25)
      if (geoContains(spherical, [lon, lat]))
        cells.push({ lat, lon, w: Math.cos((lat * Math.PI) / 180) });
  if (cells.length < 3) throw Error("Insufficient cells");
  const distance = (a, b) =>
    (a.lat - b.lat) ** 2 +
    ((a.lon - b.lon) * Math.cos((a.lat * Math.PI) / 180)) ** 2;
  const centers = [cells[Math.floor(cells.length / 2)]];
  while (centers.length < 3)
    centers.push(
      cells.reduce((best, p) =>
        Math.min(...centers.map((c) => distance(p, c))) >
        Math.min(...centers.map((c) => distance(best, c)))
          ? p
          : best,
      ),
    );
  let cluster = [];
  for (let iter = 0; iter < 20; iter++) {
    cluster = [[], [], []];
    for (const p of cells) {
      const ds = centers.map((c) => distance(p, c));
      cluster[ds.indexOf(Math.min(...ds))].push(p);
    }
    cluster.forEach((ps, k) => {
      const w = ps.reduce((s, p) => s + p.w, 0);
      const centroid = {
        lat: ps.reduce((s, p) => s + p.lat * p.w, 0) / w,
        lon: ps.reduce((s, p) => s + p.lon * p.w, 0) / w,
      };
      centers[k] = ps.reduce((best, p) =>
        distance(p, centroid) < distance(best, centroid) ? p : best,
      );
    });
  }
  const total = cells.reduce((s, p) => s + p.w, 0);
  centers.forEach((c, k) =>
    samples.push({
      regionId: f.properties.shapeISO,
      lat: c.lat,
      lon: c.lon,
      weight: cluster[k].reduce((s, p) => s + p.w, 0) / total,
    }),
  );
}
await writeFile(
  "/tmp/mokinn-merged.geojson",
  JSON.stringify({
    type: "FeatureCollection",
    features: Object.values(groups),
  }),
);
await writeFile(
  "scripts/cache/samples.json",
  JSON.stringify(
    {
      version: 1,
      method:
        "three spatial clusters of interior ERA5 0.25 degree grid centres; cos(latitude) weights",
      source: "MIMU/OCHA HDX COD-AB 2024",
      samples,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Prepared",
  Object.keys(groups).length,
  "regions;",
  samples.length,
  "sample cells",
);
