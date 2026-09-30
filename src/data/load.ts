import { snapshotSchema, emptySnapshot, type Snapshot } from "./schema";
export interface ClimateDataSource<T> {
  id: string;
  fetch: () => Promise<{ data: T; cached: boolean }>;
  validate: (data: unknown) => T;
}
export const snapshotSource: ClimateDataSource<Snapshot> = {
  id: "verified-static-snapshot",
  validate: (data) => snapshotSchema.parse(data),
  fetch: async () => {
    const r = await fetch(`${import.meta.env.BASE_URL}data/current.json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error("Snapshot unavailable");
    return {
      data: snapshotSchema.parse(await r.json()),
      cached: r.headers.get("X-Mokinn-Cache") === "true",
    };
  },
};
export function readCached(): Snapshot {
  try {
    return snapshotSchema.parse(
      JSON.parse(localStorage.getItem("mokinn-snapshot") || "null"),
    );
  } catch {
    return emptySnapshot;
  }
}
export async function loadSnapshot() {
  try {
    const { data, cached } = await snapshotSource.fetch();
    try {
      localStorage.setItem("mokinn-snapshot", JSON.stringify(data));
    } catch {
      /* Storage may be blocked. */
    }
    return { data, cached, error: false };
  } catch {
    return { data: readCached(), cached: true, error: true };
  }
}
