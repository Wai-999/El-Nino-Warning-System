import { useEffect, useMemo, useState, useId } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { forSphericalProjection } from "./geometry";
import type { FeatureCollection, Geometry } from "geojson";
import { Minus, Plus, RotateCcw, MapPinned } from "lucide-react";
import { useApp } from "../app/context";
import { regionName, regionIds } from "../data/regions";
import { regionalLevel } from "../risk/engine";
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
  const { lang, t, data, now } = useApp();
  const [geo, setGeo] = useState<MapData | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState([0, 0]);
  const [layer, setLayer] = useState<"warnings" | "coverage">("warnings");
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
          g.features.length !== 14 ||
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
  return (
    <div className={`map-component ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="map-toolbar">
          <label>
            {t("Map layer", "မြေပုံအလွှာ")}
            <select
              value={layer}
              onChange={(e) => setLayer(e.target.value as typeof layer)}
            >
              <option value="warnings">
                {t("Warning severity", "သတိပေးအဆင့်")}
              </option>
              <option value="coverage">
                {t("Data coverage", "အချက်အလက်ရရှိမှု")}
              </option>
            </select>
          </label>
          <span className="meta">
            {t("State / Region level", "ပြည်နယ် / တိုင်းအဆင့်")}
          </span>
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
                const level = regionalLevel(data, p.id, now);
                const fill =
                  p.id === selected
                    ? "#17675d"
                    : layer === "coverage" || level === "unknown"
                      ? `url(#${pattern})`
                      : {
                          normal: "#c8ded4",
                          advisory: "#f3dc9b",
                          watch: "#edbb71",
                          warning: "#dd864e",
                          emergency: "#b54242",
                        }[level];
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
                    aria-label={`${regionName(p.id, lang)} — ${level === "unknown" ? t("not assessed", "မသတ်မှတ်နိုင်သေး") : level}`}
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
        <span>
          <i className="legend-hatch" />
          {t("Not assessed", "မသတ်မှတ်နိုင်သေး")}
        </span>
        <span>
          <i className="legend-selected" />
          {t("Selected area", "ရွေးထားသောဒေသ")}
        </span>
      </div>
      <p className="map-credit">
        ©{" "}
        <a
          href="https://www.geoboundaries.org/api/current/gbOpen/MMR/ADM1/"
          target="_blank"
          rel="noreferrer"
        >
          geoBoundaries / Myanmar Analytics Project
        </a>{" "}
        · CC BY 4.0 ·{" "}
        {t(
          "2019 boundaries; simplified. Nay Pyi Taw is not separately mapped.",
          "၂၀၁၉ နယ်နိမိတ်များကို ရိုးရှင်းထားသည်။ နေပြည်တော်ကို သီးခြား မဖော်ပြထားပါ။",
        )}
      </p>
    </div>
  );
}
