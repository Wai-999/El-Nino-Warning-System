import type { Alert, Snapshot } from "../data/schema";
import { activeAlerts } from "../risk/engine";
export interface AlertDelivery {
  channel: "browser" | "sms" | "telegram" | "email";
  send: (alert: Alert) => Promise<void>;
}
// Preparation only. No channel is configured, no permissions requested, no messages sent.
export function deliveryCandidates(
  snapshot: Snapshot,
  alreadySent: ReadonlySet<string>,
  now = Date.now(),
) {
  return activeAlerts(snapshot, now).filter(
    (a) => !alreadySent.has(a.id) && a.severity !== "normal",
  );
}
