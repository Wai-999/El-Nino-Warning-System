import { createContext, useContext } from "react";
import type { Operational } from "../data/operational";
import type { Snapshot } from "../data/schema";
export type Lang = "my" | "en";
export type Translate = (en: string, my: string) => string;
export const AppContext = createContext<{
  lang: Lang;
  t: Translate;
  data: Snapshot;
  now: number;
  operational: Operational;
  operationalCached: boolean;
  operationalError: boolean;
  loading: boolean;
  lowData: boolean;
}>(null!);
export const useApp = () => useContext(AppContext);
export function dateLabel(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "my" ? "my-MM" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Yangon",
  }).format(new Date(value));
}
