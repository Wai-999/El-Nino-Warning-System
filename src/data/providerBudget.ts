export type IngestionBudget = { day: string; weightedCalls: number };
export function reserveBaselineBudget(
  previous: IngestionBudget | null,
  day: string,
  cost: number,
): IngestionBudget {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(cost) || cost <= 0)
    throw Error("Invalid budget reservation");
  const consumed = previous?.day === day ? previous.weightedCalls : 0;
  if (!Number.isFinite(consumed) || consumed < 0)
    throw Error("Invalid persisted budget");
  if (consumed + cost > 4500)
    throw Error("Baseline budget exhausted; retry on next scheduled day");
  return { day, weightedCalls: consumed + cost };
}
