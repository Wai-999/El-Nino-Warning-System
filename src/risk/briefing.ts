import type { Operational } from "../data/operational.ts";
import { weatherFresh, historyFresh } from "../data/operational.ts";
import type { Snapshot } from "../data/schema.ts";
import { activeAlerts, coverageCurrent } from "./engine.ts";
// Templates use existing evidence/freshness predicates. No new hazard thresholds,
// inferred clinical advice, or generative model is involved.
export function localBriefing(
  op: Operational,
  data: Snapshot,
  regionId: string,
  now: number,
) {
  const region = op.weather?.regions.find((r) => r.id === regionId);
  const history = op.history?.regions.find((r) => r.id === regionId);
  return {
    forecast:
      weatherFresh(op.weather, now) && region
        ? {
            temperature: region.now.temperature,
            high: region.days[0].max,
            low: region.days[0].min,
            rain24: region.next24.rain,
          }
        : null,
    forecastAt: op.weather?.validAt || null,
    retrievedAt: op.weather?.fetchedAt || null,
    history:
      historyFresh(op.history, now) && history
        ? { anomaly: history.temperatureAnomaly, end: op.history!.end }
        : null,
    official: activeAlerts(data, now).filter((a) => a.regionId === regionId),
    officialCoverage: data.regionalCoverage,
    officialCoverageCurrent: coverageCurrent(data, now),
  };
}
