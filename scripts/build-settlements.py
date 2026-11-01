"""Build the bounded GeoNames settlement reference; never infer weather precision.

Usage: python3 scripts/build-settlements.py MM.zip alternate-MM.zip admin3.geojson
The three downloaded inputs remain outside the repository. Review a new output
diff before publishing; this is deliberately not a scheduled upstream import.
"""
import collections
import hashlib
import json
import re
import sys
import zipfile

main_path, names_path, geometry_path = sys.argv[1:]
expected_geometry_sha256 = "3f913719f320656104ec993ee5c8fabd8ba4eeb4ca9d397d159b21186173390f"
if hashlib.sha256(open(geometry_path, "rb").read()).hexdigest() != expected_geometry_sha256:
    raise ValueError("Boundary input differs from the reviewed 2024 reference; review and repin before rebuilding")

def read_rows(path):
    with zipfile.ZipFile(path) as archive:
        return [line.split("\t") for line in archive.read("MM.txt").decode().splitlines()]

def inside(point, ring):
    x, y = point
    hit = False
    for a, b in zip(ring, ring[1:] + ring[:1]):
        if (a[1] > y) != (b[1] > y) and x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:
            hit = not hit
    return hit

def in_polygon(point, polygon):
    return inside(point, polygon[0]) and not any(inside(point, ring) for ring in polygon[1:])

with open(geometry_path) as source:
    features = json.load(source)["features"]
shapes = []
for feature in features:
    geometry = feature["geometry"]
    polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
    coordinates = [p for poly in polygons for ring in poly for p in ring]
    bbox = (min(p[0] for p in coordinates), min(p[1] for p in coordinates), max(p[0] for p in coordinates), max(p[1] for p in coordinates))
    shapes.append((feature["properties"], polygons, bbox))
names = collections.defaultdict(list)
for row in read_rows(names_path):
    names[row[1]].append(row)
rows = [r for r in read_rows(main_path) if r[6] == "P" and r[7] in ["PPLC", "PPLA", "PPLA2", "PPLA3", "PPL"] and (int(r[14]) >= 500 or r[7] != "PPL")]
rows.sort(key=lambda r: (r[7] == "PPL", -int(r[14]), r[0]))
points = []
for row in rows:
    lon, lat = float(row[5]), float(row[4])
    matches = [properties for properties, polygons, (x0,y0,x1,y1) in shapes if x0 <= lon <= x1 and y0 <= lat <= y1 and any(in_polygon((lon,lat), p) for p in polygons)]
    if len(matches) != 1:
        raise ValueError("Settlement has ambiguous or missing reference-boundary containment: " + row[0])
    # Language tags alone can include Latin transliterations. Require actual
    # Myanmar script and reject township-level strings on settlement labels.
    my_names = [r for r in names[row[0]] if r[2] == "my" and r[7] != "1" and re.search("[က-႟]", r[3]) and "မြို့နယ်" not in r[3]]
    my_names.sort(key=lambda r: (r[4] == "1", int(r[0])), reverse=True)
    my_name = my_names[0][3].replace("\u200b", "").strip() if my_names else None
    # Only explicitly preferred English aliases are automatically admitted.
    # Historical aliases need individual review; do not import arbitrary names
    # (e.g. Pyinmana incorrectly present as an alias of Nay Pyi Taw).
    aliases = list(dict.fromkeys([r[3] for r in names[row[0]] if r[2] == "en" and r[4] == "1" and r[7] != "1"] + [r[3].replace("\u200b", "").strip() for r in my_names]))
    points.append({"id": row[0], "en": row[1], "my": my_name, "aliases": aliases, "lat": lat, "lon": lon, "featureCode": row[7], "townshipCode": matches[0]["adm3_pcode"], "upstreamTownshipCode": row[12] or None, "modifiedOn": row[18]})
output = {
    "version": 1, "source": "https://download.geonames.org/export/dump/MM.zip",
    "namesSource": "https://download.geonames.org/export/dump/alternatenames/MM.zip",
    "license": "CC BY 4.0", "retrievedOn": "2026-11-01",
    "sourceSha256": hashlib.sha256(open(main_path,"rb").read()).hexdigest(),
    "namesSha256": hashlib.sha256(open(names_path,"rb").read()).hexdigest(),
    "geometrySha256": hashlib.sha256(open(geometry_path,"rb").read()).hexdigest(),
    "boundarySource": "https://data.humdata.org/dataset/cod-ab-mmr",
    "boundaryValidOn": "2024-02-15", "boundaryLicense": "CC BY 3.0 IGO",
    "selection": "GeoNames PPLC/PPLA/PPLA2/PPLA3, plus PPL with source population >=500; not a complete town or village list. Population is only an extract criterion, not an exposure product.",
    "parentMethod": "Unique point-in-polygon containment in the pinned 2024 HDX township geometry. Upstream codes are retained for discrepancy review; this is derived reference lookup, not an official administrative determination.",
    "points": points,
}
with open("src/data/settlements.json", "w") as destination:
    json.dump(output, destination, ensure_ascii=False, indent=2)
    destination.write("\n")
print(f"Built {len(points)} source settlement points; {sum(p['my'] is not None for p in points)} have source Myanmar-script labels.")
