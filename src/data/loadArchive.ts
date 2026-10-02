import { validateArchive, emptyArchive } from "./archive";
export async function loadArchive() {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/archive.json`,
      { cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (!response.ok) throw Error("Archive request failed");
    const data = validateArchive(await response.json());
    try {
      localStorage.setItem("mokinn-archive", JSON.stringify(data));
    } catch {
      /* Optional device storage */
    }
    return {
      data,
      error: false,
      cached: response.headers.get("X-Mokinn-Cache") === "true",
    };
  } catch {
    try {
      return {
        data: validateArchive(
          JSON.parse(localStorage.getItem("mokinn-archive") || "null"),
        ),
        error: true,
        cached: true,
      };
    } catch {
      return { data: emptyArchive, error: true, cached: false };
    }
  }
}
