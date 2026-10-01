import { operationalSchema, emptyOperational } from "./operational";
export async function loadOperational() {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}data/operational.json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw Error();
    const data = operationalSchema.parse(await r.json());
    try {
      localStorage.setItem("mokinn-operational", JSON.stringify(data));
    } catch {
      /* Optional storage */
    }
    return {
      data,
      cached: r.headers.get("X-Mokinn-Cache") === "true",
      error: false,
    };
  } catch {
    try {
      return {
        data: operationalSchema.parse(
          JSON.parse(localStorage.getItem("mokinn-operational") || "null"),
        ),
        cached: true,
        error: true,
      };
    } catch {
      return { data: emptyOperational, cached: true, error: true };
    }
  }
}
