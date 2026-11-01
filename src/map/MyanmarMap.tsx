import { coverageCurrent } from "../risk/engine";
import { useEffect, useMemo, useState, useId } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { forSphericalProjection } from "./geometry";
import type { FeatureCollection, Geometry } from "geojson";
import { Minus, Plus, RotateCcw, MapPinned } from "lucide-react";
import { useApp } from "../app/context";
import { regionName, regionIds } from "../data/regions";
import { layers, layerScale, layerValue, type Layer } from "./layers";
import { mmt } from "../data/operational";
import { settlements, settlementById, settlementName } from "../data/locations";
type MapData = FeatureCollection<
  Geometry,
  { shapeISO: string; shapeName: string }
>;
export default function MyanmarMap({
  selected,
  onSelect,
  compact = false,
}: {
  selected: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const { lang, t, data, now, operational, settlement } = useApp();
  const [showNames, setShowNames] = useState(() => {
    try {
      return localStorage.getItem("el-nino-map-place-names") !== "false";
    } catch {
      return true;
    }
  });
  const [geo, setGeo] = useState<MapData | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState([0, 0]);
  const visibleLayers = layers.filter((l) =>
    [
      "temperature",
      "rain",
      "temperatureAnomaly",
      "rainAnomaly",
      "dryness",
      "official",
    ].includes(l[0]),
  );
  const [layer, setLayer] = useState<Layer>(() => {
    try {
      const saved = localStorage.getItem("el-nino-map-layer");
      return visibleLayers.some((l) => l[0] === saved)
        ? (saved as Layer)
        : "temperature";
    } catch {
      return "temperature";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("el-nino-map-layer", layer);
    } catch {
      /* Optional preference. */
    }
  }, [layer]);
  const pattern = useId().replace(/:/g, "");
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/myanmar.geojson`, {
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((g: MapData) => {
        if (
          g.type !== "FeatureCollection" ||
          g.features.length !== 15 ||
          new Set(g.features.map((f) => f.properties.shapeISO)).size !== 15 ||
          g.features.some(
            (f) =>
              !regionIds.includes(
                f.properties.shapeISO as (typeof regionIds)[number],
              ) || !["Polygon", "MultiPolygon"].includes(f.geometry.type),
          )
        )
          throw Error();
        setGeo({ ...g, features: g.features.map(forSphericalProjection) });
        setError(false);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setError(true);
      });
    return () => ctrl.abort();
  }, [retry]);
  const paths = useMemo(() => {
    if (!geo) return [];
    const projection = geoMercator().fitExtent(
      [
        [80, 25],
        [445, 560],
      ],
      geo,
    );
    const path = geoPath(projection);
    return geo.features.map((f) => ({
      id: f.properties.shapeISO,
      d: path(f) || "",
      center: path.centroid(f),
    }));
  }, [geo]);
  const placeLabels = useMemo(() => {
    if (!geo || !showNames) return [];
    const projection = geoMercator().fitExtent(
      [
        [80, 25],
        [445, 560],
      ],
      geo,
    );
    const chosen = settlementById(settlement);
    const candidates = [
      ...(chosen ? [chosen] : []),
      ...settlements.filter(
        (p) => p.featureCode === "PPLC" || p.featureCode === "PPLA",
      ),
      ...(zoom > 1
        ? settlements.filter((p) => p.regionId === selected).slice(0, 25)
        : []),
    ];
    const seen = new Set<string>(),
      boxes: number[][] = [];
    return candidates
      .flatMap((point) => {
        if (seen.has(point.id)) return [];
        seen.add(point.id);
        const xy = projection([point.lon, point.lat]);
        if (!xy) return [];
        const name = settlementName(point, lang),
          width = Math.min(150, [...name].length * 6.5 + 14) / zoom;
        const anchor = xy[0] > 350 ? "end" : "start";
        const x0 =
          anchor === "end" ? xy[0] - width - 6 / zoom : xy[0] + 6 / zoom;
        const box = [x0, xy[1] - 13 / zoom, x0 + width, xy[1] + 5 / zoom];
        if (
          boxes.some(
            (b) =>
              box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1],
          )
        )
          return [];
        boxes.push(box);
        return [{ ...point, xy, name, anchor }];
      })
      .slice(0, compact ? 9 : 28);
  }, [geo, showNames, settlement, selected, zoom, lang, compact]);
  return (
    <div className={`map-component ${compact ? "compact" : ""}`}>
      {compact && (
        <p className="small">
          {t(
            ...(layers.find((l) => l[0] === layer)!.slice(1, 3) as [
              string,
              string,
            ]),
          )}{" "}
          · {t("State / region samples", "ပြည်နယ် / တိုင်း နမူနာများ")}
        </p>
      )}
      {!compact && (
        <div className="map-toolbar">
          <label>
            {t("Map layer", "မြေပုံအလွှာ")}
            <select
              value={layer}
              onChange={(e) => setLayer(e.target.value as typeof layer)}
            >
              {visibleLayers.map(([id, en, my]) => (
                <option key={id} value={id}>
                  {t(en, my)}
                </option>
              ))}
            </select>
          </label>
          <span className="meta">
            {t("State / Region level", "ပြည်နယ် / တိုင်းအဆင့်")}
          </span>
          <label className="check-option">
            <input
              type="checkbox"
              checked={showNames}
              onChange={(event) => {
                setShowNames(event.target.checked);
                try {
                  localStorage.setItem(
                    "el-nino-map-place-names",
                    String(event.target.checked),
                  );
                } catch {
                  /* Optional preference. */
                }
              }}
            />
            {t("City / town names", "မြို့အမည်များ")}
          </label>
        </div>
      )}
      <div className="map-canvas">
        <span className="map-north" aria-hidden="true">
          N ↑
        </span>
        <span className="map-water" aria-hidden="true">
          {t("BAY OF BENGAL", "ဘင်္ဂလားပင်လယ်အော်")}
        </span>
        {error ? (
          <div className="map-fallback">
            <MapPinned size={32} />
            <p>
              {t(
                "Map unavailable. Choose an area from the list instead.",
                "မြေပုံ မရရှိနိုင်ပါ။ စာရင်းမှ ဒေသရွေးနိုင်ပါသည်။",
              )}
            </p>
            <button onClick={() => setRetry((x) => x + 1)}>
              {t("Retry map", "ပြန်ဖွင့်ရန်")}
            </button>
          </div>
        ) : !geo ? (
          <div className="skeleton map-skeleton" role="status">
            {t("Loading boundaries…", "မြေပုံ နယ်နိမိတ်များ ဖွင့်နေသည်…")}
          </div>
        ) : (
          <svg
            viewBox="0 0 530 590"
            aria-label={t(
              "Myanmar regions. Use Tab and Enter to select an area.",
              "မြန်မာနိုင်ငံ ဒေသများ။ Tab နှင့် Enter ဖြင့် ဒေသရွေးပါ။",
            )}
          >
            <defs>
              <pattern
                id={pattern}
                patternUnits="userSpaceOnUse"
                width="7"
                height="7"
                patternTransform="rotate(40)"
              >
                <rect width="7" height="7" fill="#dce5e3" />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="7"
                  stroke="#c1cfcc"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <g
              transform={`translate(${265 + pan[0]},${290 + pan[1]}) scale(${zoom}) translate(-265,-290)`}
            >
              {paths.map((p) => {
                const metric = layerValue(layer, operational, data, p.id, now);
                const scale = layerScale(layer);
                const fill =
                  metric.value === null
                    ? `url(#${pattern})`
                    : scale.colors[
                        scale.cuts.filter((c) => metric.value! >= c).length
                      ];
                return (
                  <path
                    className="region-shape"
                    key={p.id}
                    d={p.d}
                    fill={fill}
                    stroke={p.id === selected ? "#0a3e35" : "#fbfdfc"}
                    strokeWidth={p.id === selected ? 2 : 1.4}
                    vectorEffect="non-scaling-stroke"
                    tabIndex={0}
                    role="button"
                    aria-pressed={p.id === selected}
                    aria-label={`${regionName(p.id, lang)} — ${metric.value === null ? t("not assessed", "မသတ်မှတ်နိုင်သေး") : layer === "official" && metric.value === 0 ? t("No active official warning found", "သက်တမ်းရှိ တရားဝင်သတိပေးချက် မတွေ့") : metric.label}`}
                    onClick={() => onSelect(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(p.id);
                      }
                    }}
                  >
                    <title>{regionName(p.id, lang)}</title>
                  </path>
                );
              })}
              <g
                className="settlement-labels"
                aria-hidden="true"
                pointerEvents="none"
              >
                {placeLabels.map((point) => (
                  <g
                    key={point.id}
                    data-testid={`settlement-label-${point.id}`}
                  >
                    <circle
                      cx={point.xy[0]}
                      cy={point.xy[1]}
                      r={(point.id === settlement ? 4 : 2.5) / zoom}
                      fill={point.id === settlement ? "#853d13" : "#163d52"}
                      stroke="white"
                      strokeWidth={1.2 / zoom}
                    />
                    <text
                      x={point.xy[0] + (point.anchor === "end" ? -6 : 6) / zoom}
                      y={point.xy[1]}
                      textAnchor={point.anchor as "start" | "end"}
                      fontSize={(compact ? 11 : 12) / zoom}
                      className={point.id === settlement ? "selected" : ""}
                    >
                      {point.name}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          </svg>
        )}
        <div className="map-controls">
          <button
            aria-label={t("Zoom in", "ချဲ့ရန်")}
            onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
            disabled={zoom >= 3}
          >
            <Plus size={18} />
          </button>
          <button
            aria-label={t("Zoom out", "ချုံ့ရန်")}
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            disabled={zoom <= 1}
          >
            <Minus size={18} />
          </button>
          <button
            aria-label={t("Reset map", "မြေပုံ ပြန်ချိန်ရန်")}
            onClick={() => {
              setZoom(1);
              setPan([0, 0]);
            }}
          >
            <RotateCcw size={17} />
          </button>
        </div>
        {zoom > 1 && (
          <div className="pan-controls">
            {(
              [
                ["↑", 0, 60],
                ["←", 60, 0],
                ["↓", 0, -60],
                ["→", -60, 0],
              ] as const
            ).map(([label, x, y], i) => (
              <button
                key={label}
                aria-label={
                  [
                    t("Pan north", "မြောက်သို့ ရွှေ့ရန်"),
                    t("Pan west", "အနောက်သို့ ရွှေ့ရန်"),
                    t("Pan south", "တောင်သို့ ရွှေ့ရန်"),
                    t("Pan east", "အရှေ့သို့ ရွှေ့ရန်"),
                  ][i]
                }
                onClick={() =>
                  setPan((p) => [
                    Math.max(-500, Math.min(500, p[0] + x)),
                    Math.max(-600, Math.min(600, p[1] + y)),
                  ])
                }
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="map-legend">
        {layerScale(layer).labels.map((label, i) => (
          <span key={label}>
            <svg width="14" height="14" aria-hidden="true">
              <rect width="14" height="14" fill={layerScale(layer).colors[i]} />
            </svg>
            {layers.find((l) => l[0] === layer)?.[3] === "level"
              ? t(
                  layer === "official" && i === 0
                    ? "No active official warning found"
                    : label,
                  layer === "official" && i === 0
                    ? "သက်တမ်းရှိ တရားဝင်သတိပေးချက် မတွေ့"
                    : [
                        "ပုံမှန်",
                        "အသိပေး",
                        "စောင့်ကြည့်",
                        "သတိပေး",
                        "ပြင်းထန်",
                      ][i],
                )
              : label}
          </span>
        ))}
        <span>
          <i className="legend-hatch" />
          {t("Unavailable / stale", "မရရှိ / သက်တမ်းကျော်")}
        </span>
      </div>
      <p className="map-credit">
        {t(
          "Named points are GeoNames settlement references, not township boundaries or local measurements. Labels are reduced to avoid overlap; search the place list for the complete bounded extract.",
          "အမည်ပါနေရာမှတ်များသည် GeoNames အခြေချနေရာ ရည်ညွှန်းချက်ဖြစ်ပြီး မြို့နယ်နယ်နိမိတ် သို့မဟုတ် ဒေသတိုင်းတာချက် မဟုတ်ပါ။ စာသားမထပ်စေရန် အမည်အချို့ကိုသာ ပြပြီး စာရင်းအပိုင်းအားလုံးအတွက် တည်နေရာရှာဖွေမှုကို သုံးပါ။",
        )}{" "}
        <a href="#/sources?indicator=settlements">GeoNames · CC BY 4.0</a>
      </p>
      <p className="map-credit">
        {layers.find((l) => l[0] === layer)?.[3]} ·{" "}
        {layer === "official"
          ? coverageCurrent(data, now)
            ? t(
                "Checked official coverage; no-warning-found is not an all-clear.",
                "စစ်ဆေးပြီး တရားဝင်လွှမ်းခြုံမှု — သတိပေးချက် မတွေ့ခြင်းသည် ဘေးကင်းဟု မဆိုလိုပါ။",
              )
            : t("Official coverage unavailable", "တရားဝင်လွှမ်းခြုံဒေတာ မရရှိ")
          : ["temperatureAnomaly", "rainAnomaly", "dryness"].includes(layer)
            ? `ERA5 · 0.25° · ${operational.history?.start ?? "—"} → ${operational.history?.end ?? "—"} · 1991–2020`
            : ["overall", "system", "agriculture"].includes(layer)
              ? t(
                  "Combined forecast and dated ERA5 screening; select a region for each input’s valid time.",
                  "ခန့်မှန်းချက်နှင့် ရက်စွဲပါ ERA5 စစ်ဆေးမှု ပေါင်းစပ်ထားသည်။ ဒေတာတစ်ခုစီ၏အချိန်ကို ဒေသရွေး၍ ကြည့်ပါ။",
                )
              : `ECMWF IFS · 0.25° · ${operational.weather ? mmt(operational.weather.validAt, lang) : "—"}${layer !== "temperature" && operational.weather ? " → " + mmt(operational.weather.through, lang) : ""}`}
      </p>
      <p className="map-credit">
        <a
          href="https://data.humdata.org/dataset/cod-ab-mmr"
          target="_blank"
          rel="noreferrer"
        >
          MIMU / OCHA / HDX
        </a>{" "}
        · CC BY 3.0 IGO ·{" "}
        {t(
          "2024 reference boundaries; simplified and merged to 15 regions. Selected area has a dark outline.",
          "၂၀၂၄ ရည်ညွှန်းနယ်နိမိတ်ကို ရိုးရှင်း၍ ဒေသ ၁၅ ခုအဖြစ် ပေါင်းထားသည်။ ရွေးထားသောဒေသ အနားသတ်ကို အရောင်ရင့်ဖြင့် ပြသည်။",
        )}
      </p>
    </div>
  );
}
