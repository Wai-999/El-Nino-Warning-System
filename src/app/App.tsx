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
  LayoutDashboard,
  Map,
  TriangleAlert,
  Layers,
  ClipboardCheck,
  BookOpen,
  Database,
  ShieldCheck,
  Menu,
  X,
  Globe,
  RefreshCw,
  WifiOff,
  Download,
} from "lucide-react";
import { AppContext, type Lang } from "./context";
import { loadArchive } from "../data/loadArchive";
import { emptyArchive } from "../data/archive";
import { loadOperational } from "../data/loadOperational";
import { emptyOperational, mmt } from "../data/operational";
import { loadSnapshot } from "../data/load";
import { emptySnapshot } from "../data/schema";
import { regionIds } from "../data/regions";
import Overview from "../features/Overview";
import { Notice } from "../components/shared";
const Local = lazy(() =>
  import("../features/Local").then((m) => ({ default: m.MapPage })),
);
const Region = lazy(() =>
  import("../features/Local").then((m) => ({ default: m.RegionPage })),
);
const Warnings = lazy(() => import("../features/Warnings"));
const Records = lazy(() => import("../features/Records"));
const Impacts = lazy(() => import("../features/Impacts"));
const Prepare = lazy(() => import("../features/Prepare"));
const Learn = lazy(() => import("../features/Learn"));
const Methodology = lazy(() => import("../features/Methodology"));
function getPref(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
function setPref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Optional device preference. */
  }
}
const getRoute = () => location.hash.slice(1).split("?")[0] || "/";
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
      <div className="panel padded">
        <h1>ပြန်ဖွင့်ရန် လိုအပ်သည် · Please reload</h1>
        <p>
          သိမ်းထားသော စာရင်းများ မပျက်ပါ။ Your saved checklists are retained.
        </p>
        <button onClick={() => location.reload()}>ပြန်ဖွင့်ရန် · Reload</button>
        <p>
          <a href="https://www.dmh.gov.mm/">Myanmar DMH</a>
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [lang, setLang] = useState<Lang>(() =>
    getPref("mokinn-language", "my") === "en" ? "en" : "my",
  );
  const t = (en: string, my: string) => (lang === "en" ? en : my);
  const [selected, setSelected] = useState(() => {
    const p = getPref("mokinn-region", "MM-04");
    return regionIds.includes(p as (typeof regionIds)[number]) ? p : "MM-04";
  });
  const [route, setRoute] = useState(getRoute);
  const [menu, setMenu] = useState(false);
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
  const [archive, setArchive] = useState({
    data: emptyArchive,
    error: false,
    cached: false,
  });
  const [lowData, setLowData] = useState(
    () => getPref("mokinn-low-data", "false") === "true",
  );
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [online, setOnline] = useState(navigator.onLine);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const main = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const initialized = useRef(false);
  async function refresh() {
    setLoading(true);
    const [official, local, saved] = await Promise.all([
      loadSnapshot(),
      loadOperational(),
      loadArchive(),
    ]);
    setSnapshot(official);
    setArchive(saved);
    setOperational(local);
    setNow(Date.now());
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
    document.documentElement.lang = lang;
    setPref("mokinn-language", lang);
  }, [lang]);
  useEffect(() => {
    setPref("mokinn-region", selected);
  }, [selected]);
  useEffect(() => {
    const id = route.split("/")[2];
    if (
      route.startsWith("/region/") &&
      regionIds.includes(id as (typeof regionIds)[number])
    )
      setSelected(id);
    if (initialized.current) {
      main.current?.focus();
      window.scrollTo({ top: 0 });
    }
    initialized.current = true;
  }, [route]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const nav = [
    ["/", "Overview", "အကျဉ်းချုပ်", LayoutDashboard],
    ["/map", "Map", "မြေပုံ", Map],
    ["/warnings", "Warnings", "သတိပေးချက်များ", TriangleAlert],
    ["/impacts", "Impacts", "သက်ရောက်မှုများ", Layers],
    ["/records", "Records", "မှတ်တမ်းများ", BookOpen],
    ["/prepare", "Prepare", "ကြိုတင်ပြင်ဆင်ရန်", ClipboardCheck],
    ["/learn", "Learn", "လေ့လာရန်", BookOpen],
    ["/data", "Data & methodology", "ဒေတာနှင့် နည်းလမ်း", Database],
  ] as const;
  const activeRoute = route.startsWith("/region/") ? "/map" : route;
  const routeInfo = nav.find((n) => n[0] === activeRoute);
  useEffect(() => {
    document.title = `${routeInfo ? (lang === "en" ? routeInfo[1] : routeInfo[2]) : "မိုးကင်း"} · Mokinn Myanmar`;
  }, [lang, routeInfo]);
  let page: ReactNode;
  if (route === "/") page = <Overview />;
  else if (route === "/map")
    page = <Local selected={selected} onSelect={setSelected} />;
  else if (
    route.startsWith("/region/") &&
    regionIds.includes(route.split("/")[2] as (typeof regionIds)[number])
  )
    page = <Region selected={selected} onSelect={setSelected} />;
  else if (route === "/warnings") page = <Warnings />;
  else if (route === "/records") page = <Records />;
  else if (route === "/impacts") page = <Impacts />;
  else if (route === "/prepare") page = <Prepare />;
  else if (route === "/learn") page = <Learn />;
  else if (route === "/data") page = <Methodology />;
  else
    page = (
      <div className="panel empty-state">
        <h1>{t("Page not found", "စာမျက်နှာ မတွေ့ပါ")}</h1>
        <a href="#/">
          {t("Return to overview", "အကျဉ်းချုပ်သို့ ပြန်သွားရန်")}
        </a>
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
        archive: archive.data,
        archiveError: archive.error,
        archiveCached: archive.cached || !online,
        loading,
        lowData,
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
      <div className={`app-shell ${lowData ? "low-data" : ""}`}>
        <aside className="sidebar">
          <a className="brand" href="#/">
            <img
              src={`${import.meta.env.BASE_URL}icon.svg`}
              alt=""
              width="42"
              height="42"
            />
            <div>
              <strong>{t("Mokinn", "မိုးကင်း")}</strong>
              <span>
                {t("MYANMAR WEATHER & CLIMATE", "မြန်မာ မိုးလေဝသနှင့် ရာသီဥတု")}
              </span>
            </div>
          </a>
          <button
            ref={menuButton}
            className="mobile-menu icon-button"
            aria-expanded={menu}
            aria-controls="main-navigation"
            aria-label={t("Navigation menu", "လမ်းညွှန်မီနူး")}
            onClick={() => setMenu((x) => !x)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <div
            className={`sidebar-body ${menu ? "is-open" : ""}`}
            id="main-navigation"
          >
            <p className="nav-label">
              {t("STAY INFORMED", "အခြေအနေ သိရှိရန်")}
            </p>
            <nav aria-label={t("Main navigation", "အဓိက လမ်းညွှန်")}>
              {nav.map(([path, en, my, Icon]) => (
                <a
                  key={path}
                  href={`#${path}`}
                  aria-current={activeRoute === path ? "page" : undefined}
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{t(en, my)}</span>
                </a>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <ShieldCheck size={24} />
              <strong>
                {t("Prepared, together.", "အတူတကွ အသင့်ပြင်ဆင်ပါ။")}
              </strong>
              <p>
                {t(
                  "Clear information. Practical action. For Myanmar.",
                  "ရှင်းလင်းသောအချက်အလက်နှင့် လက်တွေ့လုပ်ဆောင်မှု။ မြန်မာနိုင်ငံအတွက်။",
                )}
              </p>
              <a href="#/data">{t("About this resource", "ဤစနစ်အကြောင်း")}</a>
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <span className="topbar-title">
              {t(
                "Myanmar weather, climate & preparedness",
                "မြန်မာ မိုးလေဝသ၊ ရာသီဥတုနှင့် ပြင်ဆင်ရေး",
              )}
            </span>
            <div className="row topbar-actions">
              <button
                className="low-data-toggle"
                aria-pressed={lowData}
                onClick={() => {
                  setLowData(!lowData);
                  setPref("mokinn-low-data", String(!lowData));
                }}
              >
                {t("Low data", "ဒေတာချွေတာ")}:{" "}
                {lowData ? t("On", "ဖွင့်") : t("Off", "ပိတ်")}
              </button>

              {install && (
                <button
                  className="icon-button"
                  aria-label={t("Install app", "အက်ပ် ထည့်သွင်းရန်")}
                  onClick={async () => {
                    await install.prompt();
                    await install.userChoice;
                    setInstall(null);
                  }}
                >
                  <Download size={19} />
                </button>
              )}
              <button
                className="language-button"
                onClick={() => setLang(lang === "en" ? "my" : "en")}
                aria-label={
                  lang === "en" ? "Switch to Burmese" : "Switch to English"
                }
              >
                <Globe size={17} />
                <span lang={lang === "en" ? "my" : "en"}>
                  {lang === "en" ? "မြန်မာ" : "English"}
                </span>
              </button>
            </div>
          </header>
          <div className="freshness-bar">
            <span>
              {loading
                ? t(
                    "Checking latest available information…",
                    "နောက်ဆုံးရရှိနိုင်သော အချက်အလက် စစ်ဆေးနေသည်…",
                  )
                : snapshot.data.checkedAt === emptySnapshot.checkedAt
                  ? t("No verified data loaded", "အတည်ပြုဒေတာ မရရှိနိုင်သေး")
                  : `${snapshot.cached ? t("Cached snapshot", "သိမ်းထားသောဒေတာ") : t("Last retrieval check", "နောက်ဆုံးရယူမှု စစ်ဆေးချိန်")} · ${mmt(snapshot.data.checkedAt, lang)}`}
            </span>
            <button
              className="refresh-button"
              onClick={() => void refresh()}
              disabled={loading}
              aria-label={t("Refresh information", "အချက်အလက် ပြန်ယူရန်")}
            >
              <RefreshCw size={14} className={loading ? "spinning" : ""} />
              {t("Refresh", "ပြန်ယူရန်")}
            </button>
          </div>
          <main ref={main} id="main-content" tabIndex={-1}>
            <ErrorBoundary>
              {(!online || snapshot.cached) && (
                <div className="offline-banner" role="status">
                  <WifiOff size={18} />
                  {t(
                    "Offline or cached — showing last validated data. Check the original dates below; preparedness checklists remain available.",
                    "သိမ်းထားသောဒေတာကို ပြသနေသည်။ မူရင်းရက်စွဲ စစ်ဆေးပါ။ တိုက်ရိုက်နောက်ဆုံးသတင်း မဟုတ်ပါ။ ပြင်ဆင်ရန်စာရင်းများကို ဆက်သုံးနိုင်သည်။",
                  )}
                  <span>{mmt(operational.data.generatedAt, lang)}</span>
                </div>
              )}
              {snapshot.error && (
                <Notice>
                  {t(
                    "The latest data could not be loaded. Any retained information is dated; otherwise status is unavailable.",
                    "နောက်ဆုံးဒေတာ မရယူနိုင်ပါ။ သိမ်းထားသောအချက်အလက်တွင် မူရင်းရက်စွဲရှိပြီး မရှိပါက အခြေအနေ မရရှိနိုင်ဟု ပြသည်။",
                  )}
                </Notice>
              )}
              {snapshot.data.ensoFetch === "failed" && (
                <Notice>
                  {t(
                    "The last NOAA source check failed. The previous bulletin keeps its original date and expiry.",
                    "နောက်ဆုံး NOAA စစ်ဆေးမှု မအောင်မြင်ပါ။ ယခင်ကြေညာချက်၏ မူရင်းရက်နှင့် သက်တမ်းကို ထားရှိသည်။",
                  )}
                </Notice>
              )}
              <Suspense
                fallback={
                  <div className="panel page-loading" role="status">
                    {t("Loading…", "ဖွင့်နေသည်…")}
                  </div>
                }
              >
                {(operational.cached || !online) &&
                  operational.data.weather && (
                    <Notice>
                      {t(
                        "Cached — last updated",
                        "သိမ်းထားသောဒေတာ — နောက်ဆုံးရယူချိန်",
                      )}{" "}
                      {mmt(operational.data.weather.fetchedAt, lang)}
                    </Notice>
                  )}
                {page}
              </Suspense>
            </ErrorBoundary>
          </main>
          <footer>
            <span data-testid="release-version">v{version}</span>
            <span>
              © {new Date(now).getFullYear()}{" "}
              {t(
                "Mokinn · Myanmar preparedness",
                "မိုးကင်း · မြန်မာ မိုးလေဝသနှင့် ရာသီဥတု",
              )}
            </span>
            <a href="#/data">
              {t(
                "Sources, limitations & privacy",
                "ရင်းမြစ်၊ အကန့်အသတ်နှင့် ကိုယ်ရေးအချက်အလက်",
              )}
            </a>
          </footer>
        </div>
      </div>
    </AppContext>
  );
}
