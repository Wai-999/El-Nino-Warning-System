import { createContext, useContext } from "react";
import type { Operational } from "../data/operational";
import type { Snapshot } from "../data/schema";
import type { Archive } from "../data/archive";
import type { ClimateSnapshot } from "../data/climate";
import { localDate } from "../data/locale";
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
  archive: Archive;
  archiveError: boolean;
  archiveCached: boolean;
  loading: boolean;
  lowData: boolean;
  selected: string;
  setSelected: (id: string) => void;
  climate: ClimateSnapshot;
  climateCached: boolean;
}>(null!);
export const useApp = () => useContext(AppContext);
export function dateLabel(value: string, lang: Lang) {
  return localDate(value, lang);
}
