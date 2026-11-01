import { version } from "../../package.json";
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useRef,
  Component,
  type ReactNode,
} from "react";
import {
  Sun,
  MapPin,
  ChevronDown,
  Globe,
  RefreshCw,
  WifiOff,
  Download,
  Menu,
  X,
  Home as HomeIcon,
  CloudSun,
  Globe2,
  Map,
  ShieldCheck,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { AppContext, type Lang } from "./context";
import { emptyArchive } from "../data/archive";
import { loadOperational } from "../data/loadOperational";
import { emptyOperational, mmt } from "../data/operational";
import { loadSnapshot } from "../data/load";
import { emptySnapshot } from "../data/schema";
import { nextWarningTransition } from "../risk/engine";
import { loadClimate, emptyClimate } from "../data/climate";
import { regionIds, regionName } from "../data/regions";
import LocationDialog from "../components/LocationPicker";
import {
  townshipByCode,
  readSavedPlaces,
  savedPlace,
  settlementById,
  settlementName,
} from "../data/locations";
import {
  configureNumerals,
  localDigits,
  type NumeralSystem,
} from "../data/locale";
import Home from "../features/Home";
const Weather = lazy(() => import("../features/Weather"));
const Climate = lazy(() => import("../features/Climate"));
const MapPage = lazy(() => import("../features/AreaMap"));
const Safety = lazy(() => import("../features/Safety"));
const Sources = lazy(() => import("../features/Sources"));
const Learn = lazy(() => import("../features/Learn"));
const Township = lazy(() => import("../features/Township"));
const Settlement = lazy(() => import("../features/Settlement"));
function pref(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Optional preference. */
  }
}
const getRoute = () => location.hash.slice(1).split("?")[0] || "/";
const aliases: Record<string, string> = {
  "/data": "/sources",
  "/warnings": "/safety",
  "/prepare": "/safety",
  "/health": "/safety",
  "/records": "/climate",
  "/impacts": "/safety",
};
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty-panel">
        <h1>ပြန်ဖွင့်ပါ · Please reload</h1>
        <p>
          သိမ်းထားသောစာရင်းများကို ဆက်ထိန်းထားပါသည်။ Saved checklists are
          retained.
        </p>
        <button onClick={() => location.reload()}>ပြန်ဖွင့်ရန် · Reload</button>
        <a href="https://www.moezala.gov.mm/en">Myanmar DMH</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [lang, setLang] = useState<Lang>(() =>
    pref("mokinn-language", "my") === "en" ? "en" : "my",
  );
  const [numerals, updateNumerals] = useState<NumeralSystem>(() => {
    const value = pref("mokinn-numerals", "latn") === "mymr" ? "mymr" : "latn";
    configureNumerals(value);
    return value;
  });
  const [motion, setMotion] = useState(
    () => pref("mokinn-motion", "true") !== "false",
  );
  const t = (en: string, my: string) =>
    localDigits(lang === "en" ? en : my, lang);
  const initialSettlement = settlementById(
    getRoute().startsWith("/settlement/")
      ? getRoute().split("/")[2]
      : getRoute().startsWith("/township/")
        ? null
        : pref("mokinn-settlement", ""),
  );
  const [settlement, selectSettlement] = useState<string | null>(
    () => initialSettlement?.id || null,
  );
  const [selected, selectRegion] = useState(() => {
    if (initialSettlement) return initialSettlement.regionId;
    const area = townshipByCode(
      getRoute().startsWith("/township/")
        ? getRoute().split("/")[2]
        : pref("mokinn-township", ""),
    );
    if (area) return area.regionId;
    const p = pref("mokinn-region", "MM-04");
    return regionIds.includes(p as (typeof regionIds)[number]) ? p : "MM-04";
  });
  const [township, selectTownship] = useState<string | null>(
    () =>
      initialSettlement?.townshipCode ||
      townshipByCode(
        getRoute().startsWith("/township/")
          ? getRoute().split("/")[2]
          : pref("mokinn-township", ""),
      )?.code ||
      null,
  );
  const [savedPlaces, setSavedPlaces] = useState(() =>
    readSavedPlaces(pref("mokinn-saved-places", "[]")),
  );
  function setSelected(id: string) {
    if (!regionIds.includes(id as (typeof regionIds)[number])) return;
    selectRegion(id);
    selectTownship(null);
    selectSettlement(null);
  }
  function setTownship(code: string) {
    const area = townshipByCode(code);
    if (area) {
      selectTownship(code);
      selectRegion(area.regionId);
      selectSettlement(null);
    }
  }
  function setSettlement(id: string) {
    const place = settlementById(id);
    if (place) {
      selectSettlement(id);
      selectTownship(place.townshipCode);
      selectRegion(place.regionId);
    }
  }
  function togglePlace(id: string) {
    if (savedPlace(id) || savedPlaces.includes(id))
      setSavedPlaces((old) =>
        old.includes(id)
          ? old.filter((p) => p !== id)
          : [...old, id].slice(0, 12),
      );
  }
  const [rawRoute, setRoute] = useState(getRoute);
  const route =
    aliases[rawRoute] ||
    (rawRoute.startsWith("/region/")
      ? "/map"
      : rawRoute.startsWith("/settlement/")
        ? "/settlement"
        : rawRoute.startsWith("/township/")
          ? "/township"
          : rawRoute);
  const [menu, setMenu] = useState(false),
    [locationOpen, setLocationOpen] = useState(false);
  const [snapshot, setSnapshot] = useState({
    data: emptySnapshot,
    cached: false,
    error: false,
  });
  const [operational, setOperational] = useState({
    data: emptyOperational,
    cached: false,
    error: false,
  });
  const [climate, setClimate] = useState({
    data: emptyClimate,
    cached: false,
    error: false,
  });
  const [lowData, setLowData] = useState(
    () => pref("mokinn-low-data", "false") === "true",
  );
  const [loading, setLoading] = useState(true),
    [now, setNow] = useState(Date.now()),
    [refreshedAt, setRefreshedAt] = useState<number | null>(null);
  const [online, setOnline] = useState(navigator.onLine),
    [install, setInstall] = useState<InstallEvent | null>(null);
  const main = useRef<HTMLElement>(null),
    initialized = useRef(false),
    menuButton = useRef<HTMLButtonElement>(null);
  async function refresh() {
    setLoading(true);
    const [official, local, enso] = await Promise.all([
      loadSnapshot(),
      loadOperational(),
      loadClimate(),
    ]);
    setSnapshot(official);
    setOperational(local);
    setClimate(enso);
    setNow(Date.now());
    setRefreshedAt(Date.now());
    setLoading(false);
  }
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => setNow(Date.now()), 30000);
    const net = () => {
      setOnline(navigator.onLine);
      setNow(Date.now());
    };
    const hash = () => {
      setRoute(getRoute());
      setMenu(false);
    };
    const prompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    window.addEventListener("hashchange", hash);
    window.addEventListener("online", net);
    window.addEventListener("offline", net);
    window.addEventListener("beforeinstallprompt", prompt);
    document.addEventListener("visibilitychange", net);
    return () => {
      clearInterval(timer);
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("online", net);
      window.removeEventListener("offline", net);
      window.removeEventListener("beforeinstallprompt", prompt);
      document.removeEventListener("visibilitychange", net);
    };
  }, []);
  useEffect(() => {
    const clock = Date.now(),
      next = nextWarningTransition(snapshot.data, clock);
    if (next === null) return;
    const timeout = setTimeout(
      () => setNow(Date.now()),
      Math.min(next - clock + 1, 2147483647),
    );
    return () => clearTimeout(timeout);
  }, [snapshot.data, now]);
  useEffect(() => {
    document.documentElement.lang = lang;
    save("mokinn-language", lang);
  }, [lang]);
  useEffect(() => save("mokinn-region", selected), [selected]);
  useEffect(() => save("mokinn-township", township || ""), [township]);
  useEffect(() => save("mokinn-settlement", settlement || ""), [settlement]);
  useEffect(
    () => save("mokinn-saved-places", JSON.stringify(savedPlaces)),
    [savedPlaces],
  );
  useEffect(() => {
    const p = townshipByCode(township);
    if (p) selectRegion(p.regionId);
  }, [township]);
  useEffect(() => {
    const id = rawRoute.split("/")[2];
    if (rawRoute.startsWith("/township/")) setTownship(id);
    if (rawRoute.startsWith("/settlement/")) setSettlement(id);
    if (
      rawRoute.startsWith("/region/") &&
      regionIds.includes(id as (typeof regionIds)[number])
    )
      setSelected(id);
    if (initialized.current) {
      main.current?.focus();
      window.scrollTo({ top: 0 });
    }
    initialized.current = true;
  }, [rawRoute]);
  const nav = [
    ["/", "Home", "ပင်မ", HomeIcon],
    ["/weather", "Weather", "မိုးလေဝသ", CloudSun],
    ["/climate", "Climate", "ရာသီဥတု", Globe2],
    ["/map", "Map", "မြေပုံ", Map],
    ["/safety", "Safety", "ဘေးကင်းရေး", ShieldCheck],
    ["/sources", "Sources", "ရင်းမြစ်များ", BookOpen],
  ] as const;
  const name = nav.find((n) => n[0] === route);
  useEffect(() => {
    document.title = `${name ? (lang === "en" ? name[1] : name[2]) : route === "/settlement" ? (lang === "en" ? "City / town overview" : "မြို့ အကျဉ်းချုပ်") : route === "/township" ? (lang === "en" ? "Township overview" : "မြို့နယ် အကျဉ်းချုပ်") : lang === "en" ? "Learn" : "လေ့လာရန်"} · El Niño Warning System`;
  }, [lang, name, route]);
  let page: ReactNode;
  if (route === "/") page = <Home />;
  else if (route === "/weather") page = <Weather />;
  else if (route === "/climate") page = <Climate />;
  else if (route === "/map") page = <MapPage />;
  else if (route === "/safety") page = <Safety />;
  else if (route === "/sources") page = <Sources />;
  else if (route === "/learn") page = <Learn />;
  else if (route === "/township")
    page = <Township code={rawRoute.split("/")[2]} />;
  else if (route === "/settlement")
    page = <Settlement id={rawRoute.split("/")[2]} />;
  else
    page = (
      <div className="empty-panel">
        <h1>{t("Page not found", "စာမျက်နှာ မတွေ့ပါ")}</h1>
        <a href="#/">{t("Return home", "ပင်မသို့ ပြန်သွားရန်")}</a>
      </div>
    );
  return (
    <AppContext
      value={{
        lang,
        t,
        data: snapshot.data,
        now,
        operational: operational.data,
        operationalCached: operational.cached || !online,
        operationalError: operational.error,
        archive: emptyArchive,
        archiveError: false,
        archiveCached: !online,
        loading,
        lowData,
        selected,
        setSelected,
        township,
        setTownship,
        settlement,
        setSettlement,
        savedPlaces,
        togglePlace,
        openLocations: () => setLocationOpen(true),
        numerals,
        motion,
        climate: climate.data,
        climateCached: climate.cached || !online,
      }}
    >
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        {t("Skip to content", "အကြောင်းအရာသို့ သွားရန်")}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="service-brand"
            href="#/"
            aria-label="El Niño Warning System"
          >
            <span className="brand-mark">
              <Sun size={27} strokeWidth={1.6} />
            </span>
            <span>
              <strong>El Niño Warning System</strong>
              <small>
                {t(
                  "CLEAR INFORMATION. BETTER PREPARED.",
                  "ရှင်းလင်းစွာ သိရှိ၊ ကြိုတင်ပြင်ဆင်။",
                )}
              </small>
            </span>
          </a>
          <nav
            className="desktop-nav"
            aria-label={t("Main navigation", "အဓိက လမ်းညွှန်")}
          >
            {nav.map(([path, en, my]) => (
              <a
                key={path}
                href={`#${path}`}
                aria-current={route === path ? "page" : undefined}
              >
                {t(en, my)}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="language-button"
              onClick={() => setLang(lang === "en" ? "my" : "en")}
              aria-label={
                lang === "en" ? "Switch to Burmese" : "Switch to English"
              }
            >
              <Globe size={16} />
              <span lang={lang === "en" ? "my" : "en"}>
                {lang === "en" ? "မြန်မာ" : "English"}
              </span>
            </button>
            <button
              ref={menuButton}
              className="icon-button more-menu"
              aria-label={t("More options", "နောက်ထပ် ရွေးချယ်စရာများ")}
              aria-expanded={menu}
              aria-controls="more-options"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menu && (
          <div
            className="more-options"
            id="more-options"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setMenu(false);
                menuButton.current?.focus();
              }
            }}
          >
            <a href="#/sources">
              {t("Sources & methodology", "ရင်းမြစ်နှင့် နည်းလမ်း")}
            </a>
            <a href="#/learn">{t("Learn & explore", "လေ့လာစမ်းသပ်ရန်")}</a>
            <button
              aria-pressed={numerals === "mymr"}
              onClick={() => {
                const value = numerals === "latn" ? "mymr" : "latn";
                configureNumerals(value);
                updateNumerals(value);
                save("mokinn-numerals", value);
              }}
            >
              {t("Myanmar numerals", "မြန်မာဂဏန်း")} ·{" "}
              {numerals === "mymr" ? t("On", "ဖွင့်") : t("Off", "ပိတ်")}
            </button>
            <button
              aria-pressed={motion}
              onClick={() => {
                setMotion(!motion);
                save("mokinn-motion", String(!motion));
              }}
            >
              {t("Weather animation", "မိုးလေဝသ လှုပ်ရှားပုံ")} ·{" "}
              {motion ? t("On", "ဖွင့်") : t("Paused", "ရပ်ထား")}
            </button>
            <button
              aria-pressed={lowData}
              onClick={() => {
                setLowData(!lowData);
                save("mokinn-low-data", String(!lowData));
              }}
            >
              {t("Low data mode", "ဒေတာချွေတာစနစ်")} ·{" "}
              {lowData ? t("On", "ဖွင့်") : t("Off", "ပိတ်")}
            </button>
            {install && (
              <button
                onClick={async () => {
                  await install.prompt();
                  await install.userChoice;
                  setInstall(null);
                }}
              >
                <Download size={16} />
                {t("Install app", "အက်ပ် ထည့်သွင်းရန်")}
              </button>
            )}
          </div>
        )}
      </header>
      <div className="context-bar">
        <div className="context-inner">
          <button
            className="location-button"
            onClick={() => setLocationOpen(true)}
            aria-haspopup="dialog"
          >
            <MapPin size={17} />
            <span>
              {settlementById(settlement)
                ? settlementName(settlementById(settlement)!, lang)
                : townshipByCode(township)?.[lang] ||
                  regionName(selected, lang)}
            </span>
            <ChevronDown size={15} />
          </button>
          <div className="context-tools">
            <span className={`connectivity ${online ? "" : "is-offline"}`}>
              {!online && <WifiOff size={13} />}
              <i aria-hidden="true" />
              {online
                ? t("Connected", "အင်တာနက် ချိတ်ဆက်ထား")
                : t("Offline · cached", "အော့ဖ်လိုင်း · သိမ်းထားသောဒေတာ")}
            </span>
            <button
              className="refresh-button"
              disabled={loading}
              onClick={() => void refresh()}
              aria-label={t("Refresh information", "အချက်အလက် ပြန်ယူရန်")}
            >
              <RefreshCw size={14} className={loading ? "spinning" : ""} />
              <span>
                {loading
                  ? t("Checking…", "စစ်ဆေးနေသည်…")
                  : t("Refresh", "ပြန်ယူရန်")}
              </span>
            </button>
          </div>
        </div>
      </div>
      <main ref={main} id="main-content" className="main-content" tabIndex={-1}>
        <ErrorBoundary>
          {(!online ||
            snapshot.cached ||
            operational.cached ||
            climate.cached) && (
            <div className="offline-banner" role="status">
              <WifiOff size={19} />
              <div>
                <strong>
                  {t(
                    "Previously cached information",
                    "ယခင် သိမ်းထားသော အချက်အလက်",
                  )}
                </strong>
                <p>
                  {t(
                    "This is not a live warning service. Original source times and expired states still apply.",
                    "တိုက်ရိုက်သတိပေးစနစ် မဟုတ်ပါ။ မူရင်းရင်းမြစ်အချိန်နှင့် သက်တမ်းကုန်အခြေအနေများကို ဆက်လက် အသုံးပြုသည်။",
                  )}
                </p>
                {operational.data.weather && (
                  <small>
                    {t("Forecast retrieved", "ခန့်မှန်းချက် ရယူချိန်")}{" "}
                    {mmt(operational.data.weather.fetchedAt, lang)}
                  </small>
                )}
              </div>
            </div>
          )}
          {(snapshot.error || operational.error) && (
            <div className="notice" role="status">
              {t(
                "A source snapshot could not be refreshed. Retained values keep their original dates; missing data stays unavailable.",
                "ဒေတာအချို့ ပြန်မရယူနိုင်ပါ။ သိမ်းထားသောတန်ဖိုးများ၏ မူရင်းရက်စွဲကို ထိန်းထားပြီး မရှိသောဒေတာကို မရရှိဟု ပြသည်။",
              )}
            </div>
          )}
          <Suspense
            fallback={
              <p className="page-loading" role="status">
                {t("Loading page…", "စာမျက်နှာ ဖွင့်နေသည်…")}
              </p>
            }
          >
            {township && (
              <div className="township-context small">
                <MapPin size={17} />
                <span>
                  {t(
                    "Weather uses parent-region samples:",
                    "မိုးလေဝသအတွက် သက်ဆိုင်ရာ ပြည်နယ်/တိုင်းဒေတာ သုံးသည်။",
                  )}{" "}
                  {regionName(selected, lang)} ·{" "}
                  <a
                    href={
                      settlement
                        ? `#/settlement/${settlement}`
                        : `#/township/${township}`
                    }
                  >
                    {t(
                      "Place overview & data limits",
                      "တည်နေရာ အကျဉ်းချုပ်နှင့် ဒေတာကန့်သတ်ချက်",
                    )}
                  </a>
                </span>
              </div>
            )}
            {page}
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="service-footer">
        <div>
          <a className="footer-name" href="#/">
            El Niño Warning System
          </a>
          <p>
            {t(
              "An independent public information aid for Myanmar. Follow official DMH and local instructions for urgent decisions.",
              "မြန်မာနိုင်ငံအတွက် လွတ်လပ်သော အများပြည်သူသတင်းအချက်အလက် အကူအညီဖြစ်သည်။ အရေးပေါ်ဆုံးဖြတ်ချက်များအတွက် မိုးဇလနှင့် ဒေသဆိုင်ရာ ညွှန်ကြားချက်များကို လိုက်နာပါ။",
            )}
          </p>
          <small>
            <span data-testid="release-version">v{version}</span> ·{" "}
            {refreshedAt &&
              `${t("Page checked", "စာမျက်နှာ စစ်ဆေးချိန်")} ${mmt(new Date(refreshedAt).toISOString(), lang)}`}
          </small>
        </div>
        <div className="footer-links">
          <a href="#/sources">
            {t("Sources & privacy", "ရင်းမြစ်နှင့် ကိုယ်ရေးအချက်အလက်")}
          </a>
          <a href="#/learn">{t("Learn & explore", "လေ့လာစမ်းသပ်ရန်")}</a>
          <a
            href="https://www.moezala.gov.mm/en"
            target="_blank"
            rel="noreferrer"
          >
            Myanmar DMH <ArrowUpRight size={13} />
          </a>
          <a href={`${import.meta.env.BASE_URL}pamphlet/el-nino/`}>
            {t("Burmese leaflet", "မြန်မာဘာသာ လက်ကမ်းစာစောင်")}
          </a>
        </div>
      </footer>
      <nav
        className="mobile-bottom-nav"
        aria-label={t("Mobile navigation", "မိုဘိုင်း လမ်းညွှန်")}
      >
        {nav.slice(0, 5).map(([path, en, my, Icon]) => (
          <a
            key={path}
            href={`#${path}`}
            aria-current={route === path ? "page" : undefined}
          >
            <Icon size={20} />
            <span>{t(en, my)}</span>
          </a>
        ))}
      </nav>
      <LocationDialog
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        selected={selected}
        onSelect={setSelected}
        lang={lang}
        township={township}
        onTownship={setTownship}
        settlement={settlement}
        onSettlement={setSettlement}
      />
    </AppContext>
  );
}
