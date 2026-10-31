import {
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Thermometer,
  Leaf,
  Droplets,
  Sun,
} from "lucide-react";
import { useApp, dateLabel } from "../app/context";
import { activeAlerts } from "../risk/engine";
import { number } from "../data/presentation";
import {
  WeatherSummary,
  OfficialNotice,
  Source,
  SectionHeading,
} from "../components/Service";
import ClimateSummary from "../components/ClimateSummary";
import HomeMap from "../components/HomeMap";
import SavedPlaces from "../components/SavedPlaces";
import LocalBriefing from "../components/LocalBriefing";
export default function Home() {
  const { t, lang, selected, operational: op, data, now } = useApp();
  const w = op.weather?.regions.find((r) => r.id === selected);
  const alerts = activeAlerts(data, now).filter((a) => a.regionId === selected);
  return (
    <>
      <div className="home-intro">
        <div>
          <p className="eyebrow">
            <span className="tiny-rule" />
            {t(
              "MYANMAR · WEATHER & CLIMATE",
              "မြန်မာနိုင်ငံ · မိုးလေဝသနှင့် ရာသီဥတု",
            )}
          </p>
          <h1>
            {t("Understand the weather.", "မိုးလေဝသကို သိရှိပြီး")}
            <br />
            <span>
              {t("Be ready for your day.", "နေ့ရက်တိုင်း အသင့်ပြင်ဆင်ပါ။")}
            </span>
          </h1>
          <p>
            {t(
              "Your local forecast, the climate context, and small steps that make a difference.",
              "သင့်ဒေသ မိုးလေဝသခန့်မှန်းချက်၊ ရာသီဥတုနောက်ခံနှင့် လက်တွေ့ ကြိုတင်ပြင်ဆင်ရန် အချက်များ။",
            )}
          </p>
        </div>
        <a className="intro-learn" href="#/learn">
          <BookOpen size={20} />
          <span>
            {t("A little knowledge.", "နည်းနည်းချင်း လေ့လာပါ။")}
            <strong>
              {t("A little more prepared.", "ပိုမို အသင့်ပြင်ဆင်နိုင်ပါ။")}
            </strong>
          </span>
          <ArrowRight size={18} />
        </a>
      </div>
      {alerts.map((a) => (
        <OfficialNotice key={a.id} alert={a} />
      ))}
      <div className="home-grid">
        <div>
          <WeatherSummary />
          {w && (
            <section className="short-forecast">
              <div className="section-heading">
                <h3>{t("The next few days", "လာမည့် ရက်အနည်းငယ်")}</h3>
                <a href="#/weather">
                  {t("7-day forecast", "၇ ရက် ခန့်မှန်းချက်")}
                  <ArrowRight size={14} />
                </a>
              </div>
              <div className="forecast-preview">
                {w.days.slice(1, 4).map((d) => (
                  <div key={d.date}>
                    <span>{dateLabel(d.date + "T12:00:00+06:30", lang)}</span>
                    <Thermometer size={26} strokeWidth={1.4} />
                    <strong>
                      {number(d.max, lang, 0)}°{" "}
                      <small>/ {number(d.min, lang, 0)}°</small>
                    </strong>
                    <small>
                      <Droplets size={12} />
                      {number(d.rain, lang)} mm
                    </small>
                  </div>
                ))}
              </div>
              <Source id="rain-forecast" />
            </section>
          )}
        </div>
        <HomeMap />
      </div>
      <SavedPlaces />
      <LocalBriefing />
      <ClimateSummary />
      <div className="coverage-note">
        <ShieldCheck size={20} />
        <div>
          <strong>
            {t(
              "Official warning coverage is not connected",
              "တရားဝင် သတိပေးဒေတာ မချိတ်ဆက်ရသေးပါ",
            )}
          </strong>
          <p>
            {t(
              "An empty warning list does not mean all clear. Check Myanmar DMH and local instructions.",
              "သတိပေးစာရင်း ဗလာဖြစ်ခြင်းသည် ဘေးကင်းကြောင်း မဆိုလိုပါ။ မိုးဇလနှင့် ဒေသညွှန်ကြားချက်များကို စစ်ဆေးပါ။",
            )}
          </p>
        </div>
        <a href="#/safety">
          {t("Safety & official links", "ဘေးကင်းရေးနှင့် တရားဝင်လင့်ခ်များ")}
          <ArrowRight size={16} />
        </a>
      </div>
      <section className="daily-actions">
        <SectionHeading
          title={t("A few useful steps", "လက်တွေ့ အသုံးဝင်သော အချက်များ")}
          link={t("Make a simple plan", "ရိုးရှင်းသော အစီအစဉ်ပြုရန်")}
          href="#/safety"
        />
        <div className="action-grid">
          {[
            [
              Sun,
              "Plan around the heat",
              "အပူဒဏ်အတွက် ပြင်ဆင်ပါ",
              "Keep water and shade within reach. Check on children and older adults.",
              "ရေနှင့် အရိပ်ရရှိအောင် ပြင်ဆင်ပါ။ ကလေးနှင့် သက်ကြီးရွယ်အိုများကို ဂရုစိုက်ပါ။",
              "safety-heat",
            ],
            [
              Droplets,
              "Be ready for heavy rain",
              "မိုးကြီးလျှင် အသင့်ရှိပါ",
              "Keep a safe route in mind. Never walk or drive through floodwater.",
              "ဘေးကင်းလမ်းကြောင်းကို သိထားပါ။ ရေကြီးနေသောနေရာကို ခြေလျင်၊ ကားဖြင့် မဖြတ်ပါနှင့်။",
              "safety-flood",
            ],
            [
              Leaf,
              "Consider your crop & season",
              "သီးနှံနှင့် ရာသီကို စဉ်းစားပါ",
              "Water needs vary with crop and growth stage. Check conditions in your field.",
              "သီးနှံနှင့် ကြီးထွားအဆင့်အလိုက် ရေလိုအပ်ချက် ကွာသည်။ လယ်ကွင်းအခြေအနေ စစ်ဆေးပါ။",
              "agriculture",
            ],
          ].map(([Icon, en, my, body, bmy, id]) => {
            const I = Icon as typeof Leaf;
            return (
              <article key={String(en)} className="action-item">
                <span className="action-icon">
                  <I size={22} strokeWidth={1.5} />
                </span>
                <h3>{t(String(en), String(my))}</h3>
                <p>{t(String(body), String(bmy))}</p>
                <Source id={String(id)} />
              </article>
            );
          })}
        </div>
        <p className="small muted">
          {t(
            "General educational guidance, independent of today's weather. Your local situation may differ.",
            "ယေဘုယျ ပညာပေးအကြံပြုချက်ဖြစ်ပြီး ယနေ့မိုးလေဝသပေါ် မမူတည်ပါ။ သင့်ဒေသအခြေအနေ ကွာခြားနိုင်ပါသည်။",
          )}
        </p>
      </section>
    </>
  );
}
