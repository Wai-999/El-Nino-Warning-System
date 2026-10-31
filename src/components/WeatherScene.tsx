import { useApp } from "../app/context";
export default function WeatherScene({ code }: { code: number }) {
  const { motion, lowData } = useApp();
  const kind =
    (code >= 71 && code <= 77) || (code >= 85 && code <= 86)
      ? "snow"
      : code >= 51
        ? "rain"
        : code >= 45
          ? "fog"
          : code === 0
            ? "sun"
            : "cloud";
  return (
    <div
      className={`weather-scene weather-kind-${kind} ${!motion || lowData ? "scene-paused" : ""}`}
      aria-hidden="true"
    >
      <span className="scene-sun" />
      <span className="scene-cloud cloud-one" />
      <span className="scene-cloud cloud-two" />
      <span className="scene-precip">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={`particle particle-${i}`} />
        ))}
      </span>
      <span className="scene-wind" />
    </div>
  );
}
