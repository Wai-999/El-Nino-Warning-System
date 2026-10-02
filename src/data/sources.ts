export type Source = {
  id: string;
  organization: string;
  dataset: string;
  tier: 1 | 2 | 3 | 4;
  url: string;
  geography: string;
  temporal: string;
  cadence: string;
  license: string;
  method: string;
  limitations: string;
  use: "operational" | "context" | "guidance" | "unconnected" | "research";
};
export const sources = [
  {
    id: "dmh",
    organization: "Myanmar DMH",
    dataset: "Official meteorological and hydrological bulletins",
    tier: 1,
    url: "https://www.dmh.gov.mm/",
    geography: "Myanmar; explicit bulletin location required",
    temporal: "Issue time and valid period of each bulletin",
    cadence: "Event-driven; integration unavailable",
    license: "Link only; redistribution not verified",
    method: "Only reviewed Myanmar bulletins with explicit geographic scope",
    limitations:
      "No verified automated feed connected; never infer no warning from an empty list",
    use: "unconnected",
  },
  {
    id: "asmc",
    organization: "ASEAN Specialised Meteorological Centre",
    dataset: "Seasonal outlook",
    tier: 2,
    url: "https://asmc.asean.org/asmc-seasonal-outlook/",
    geography: "Southeast Asia; regional context only",
    temporal: "September–November 2026; issued 2 September 2026",
    cadence: "Monthly; manual review",
    license: "ASMC Terms of Use; short paraphrase and source link only",
    method:
      "Multi-model regional tercile outlook; no automatic state-level assignment",
    limitations:
      "Mainland rainfall agreement and skill vary; not a Myanmar official warning",
    use: "context",
  },
  {
    id: "ecmwf",
    organization: "ECMWF via Open-Meteo",
    dataset: "IFS 0.25° forecast",
    tier: 3,
    url: "https://open-meteo.com/en/docs/ecmwf-api",
    geography: "Three verified cells per Myanmar region, 45 total",
    temporal: "Latest modeled hour, next 24 hours and seven days",
    cadence: "Fetch four times daily",
    license: "CC BY 4.0 via Open-Meteo; non-commercial API",
    method:
      "Area-weighted representative samples; hazard screening uses sample maximum",
    limitations:
      "Not station observations or complete spatial coverage; no local impact calibration",
    use: "operational",
  },
  {
    id: "era5",
    organization: "ECMWF / Copernicus via Open-Meteo",
    dataset: "ERA5 0.25° reanalysis",
    tier: 3,
    url: "https://open-meteo.com/en/docs/historical-weather-api",
    geography: "Same 45 Myanmar cells",
    temporal: "Completed 30-day window; 1991–2020 calendar-matched baseline",
    cadence: "Daily with six-day lag",
    license: "CC BY 4.0 via Open-Meteo",
    method: "Area-weighted sample averages; consistent dataset and baseline",
    limitations:
      "Reanalysis, not gauges; rainfall deficit is not SPI or hydrological drought",
    use: "operational",
  },
  {
    id: "noaa",
    organization: "NOAA CPC",
    dataset: "ENSO Diagnostic Discussion",
    tier: 3,
    url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
    geography: "Tropical Pacific; no Myanmar local forecast",
    temporal: "Bulletin issue through stated next update",
    cadence: "Monthly, checked four times daily",
    license: "US government public information; attribution",
    method: "Parse official status, issue and next-update dates",
    limitations: "ENSO background never raises a local hazard level",
    use: "operational",
  },
  {
    id: "nino34",
    organization: "NOAA CPC",
    dataset: "Monthly Niño 3.4 SST anomalies",
    tier: 3,
    url: "https://www.cpc.ncep.noaa.gov/data/indices/sstoi.indices",
    geography: "Equatorial Pacific Niño 3.4",
    temporal: "Completed calendar months",
    cadence: "Monthly; fetched daily",
    license: "US government public information; attribution",
    method: "Direct published anomalies in °C; not ONI",
    limitations:
      "Feed does not specify baseline; never merge with another index or baseline",
    use: "operational",
  },
  {
    id: "fao",
    organization: "FAO GIEWS",
    dataset: "Myanmar country brief",
    tier: 3,
    url: "https://www.fao.org/giews/countrybrief/country.jsp?code=MMR&lang=en",
    geography: "Myanmar national context; named affected areas only",
    temporal: "Reference 18 September 2026; crop calendar 2026/27",
    cadence: "Irregular; manual review",
    license: "FAO terms; short paraphrase and link only",
    method: "National crop calendar and separately attributed reported impacts",
    limitations:
      "Not local crop exposure, growth stage, yield-loss model or warning",
    use: "context",
  },
  {
    id: "who",
    organization: "WHO",
    dataset: "Heat and health guidance",
    tier: 3,
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
    geography: "General guidance relevant across Myanmar",
    temporal: "Published 31 July 2026; reviewed 2 October 2026",
    cadence: "Editorial; review every 90 days",
    license: "WHO terms; paraphrase and link only",
    method: "General heat exposure and preparedness advice",
    limitations:
      "No Myanmar disease surveillance, diagnosis or outbreak forecast",
    use: "guidance",
  },
  {
    id: "fao2016",
    organization: "FAO",
    dataset: "El Niño early action review, March 2016",
    tier: 3,
    url: "https://www.fao.org/fileadmin/user_upload/emergencies/docs/FAOEl%20NinoReportMarch2016.pdf#page=38",
    geography: "Myanmar, national report",
    temporal: "July 2015–March 2016",
    cadence: "Historical fixed publication",
    license: "FAO terms; paraphrase and link only",
    method: "Historical reported impact evidence, printed page 35",
    limitations: "Not a deterministic analog or proof of attribution",
    use: "context",
  },
] as const satisfies readonly Source[];
export type SourceId = (typeof sources)[number]["id"];
export function sourceById(id: string): Source {
  const s = sources.find((s) => s.id === id);
  if (!s) throw Error(`Unknown source ID: ${id}`);
  return s;
}
export const reviewedAt = "2026-10-02T06:49:33Z";
export const contextNotice = [
  "REGIONAL CONTEXT — NOT A MYANMAR OFFICIAL WARNING",
  "ဒေသတွင်း နောက်ခံအချက်အလက် — မြန်မာ တရားဝင်သတိပေးချက် မဟုတ်ပါ",
] as const;
export function reviewedState(
  issued: string,
  agingDays: number,
  staleDays: number,
  now: number,
) {
  const age = (now - Date.parse(issued)) / 86400000;
  return !Number.isFinite(age) || age < 0
    ? "unavailable"
    : age >= staleDays
      ? "stale"
      : age >= agingDays
        ? "aging"
        : "current";
}
