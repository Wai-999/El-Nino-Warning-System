import {
  emptyHealthAdvisories,
  validateHealthAdvisories,
} from "./healthAdvisories";
export async function loadHealthAdvisories() {
  try {
    const r = await fetch(
      `${import.meta.env.BASE_URL}data/health-advisories.json`,
      { cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (!r.ok) throw Error("Health snapshot unavailable");
    const data = validateHealthAdvisories(await r.json());
    try {
      localStorage.setItem("mokinn-health-advisories", JSON.stringify(data));
    } catch {
      /* Optional cache. */
    }
    return {
      data,
      cached: r.headers.get("X-Mokinn-Cache") === "true",
      error: false,
    };
  } catch {
    try {
      return {
        data: validateHealthAdvisories(
          JSON.parse(
            localStorage.getItem("mokinn-health-advisories") || "null",
          ),
        ),
        cached: true,
        error: true,
      };
    } catch {
      return { data: emptyHealthAdvisories, cached: true, error: true };
    }
  }
}
