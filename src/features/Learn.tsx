import { useState, useId } from "react";
import { RotateCcw, ArrowRight, FlaskConical } from "lucide-react";
import { useApp } from "../app/context";
import { Source } from "../components/Service";
import { number } from "../data/presentation";
import { heatIndex } from "../climate/calculations";
import {
  educationalAnomaly,
  educationalStandardScore,
  educationalOutcomes,
} from "../climate/education";
const modules = [
  ["enso", "The connected Pacific", "ဆက်နွယ်နေသော ပစိဖိတ်"],
  ["rain", "Rainfall & the baseline", "မိုးရေနှင့် အခြေခံကာလ"],
  ["drought", "A drought-index concept", "မိုးခေါင်ညွှန်းကိန်း အယူအဆ"],
  ["probability", "What does 60% mean?", "၆၀% ဆိုတာ ဘာလဲ။"],
  ["heat", "Temperature & humidity", "အပူချိန်နှင့် စိုထိုင်းဆ"],
  ["flood", "A safer flood decision", "ရေကြီးချိန် ဘေးကင်းဆုံးဖြတ်ရန်"],
] as const;
export default function Learn() {
  const { t, lang } = useApp(),
    id = useId();
  const [active, setActive] = useState("enso"),
    [phase, setPhase] = useState(1),
    [rain, setRain] = useState(120),
    [baseline, setBaseline] = useState(100),
    [drought, setDrought] = useState(50),
    [probability, setProbability] = useState(60),
    [temperature, setTemperature] = useState(32),
    [humidity, setHumidity] = useState(70),
    [decision, setDecision] = useState("");
  const anomaly = educationalAnomaly(rain, baseline),
    score = educationalStandardScore(drought, 100, 30),
    outcomes = educationalOutcomes(probability);
  function reset() {
    setPhase(1);
    setRain(120);
    setBaseline(100);
    setDrought(50);
    setProbability(60);
    setTemperature(32);
    setHumidity(70);
    setDecision("");
  }
  const slider = (
    key: string,
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (v: number) => void,
    unit: string,
    step = 1,
  ) => (
    <label className="simulation-slider" htmlFor={`${id}-${key}`}>
      <span>
        {label}
        <strong>
          {number(value, lang, 0)} {unit}
        </strong>
      </span>
      <input
        id={`${id}-${key}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="slider-extents">
        <small>
          {number(min, lang, 0)} {unit}
        </small>
        <small>
          {number(max, lang, 0)} {unit}
        </small>
      </span>
    </label>
  );
  return (
    <>
      <header className="page-title">
        <p className="eyebrow">
          {t(
            "LEARN A LITTLE. UNDERSTAND MORE.",
            "နည်းနည်းချင်း လေ့လာ၊ ပိုမိုနားလည်။",
          )}
        </p>
        <h1>{t("Explore how weather works", "မိုးလေဝသ ဖြစ်ပုံကို လေ့လာပါ")}</h1>
        <p>
          {t(
            "Six small, interactive lessons. Change an example, see what changes, and take your time.",
            "အပြန်အလှန် လေ့လာခန်းခြောက်ခုဖြစ်သည်။ နမူနာတန်ဖိုးပြောင်း၍ ရလဒ်ကွာပုံကို ဖြည်းဖြည်းချင်း လေ့လာပါ။",
          )}
        </p>
      </header>
      <div className="education-banner">
        <FlaskConical size={22} />
        <div>
          <strong>
            {t(
              "Educational / synthetic examples",
              "ပညာပေး / စိတ်ကူးယဉ် နမူနာများ",
            )}
          </strong>
          <p>
            {t(
              "These are learning tools, not real measurements or forecasts. No simulation result is used in warnings.",
              "သင်ယူရန်ကိရိယာများဖြစ်ပြီး အမှန်တကယ်တိုင်းတာချက် သို့မဟုတ် ခန့်မှန်းချက် မဟုတ်ပါ။ စမ်းသပ်ရလဒ်ကို သတိပေးချက်တွင် မသုံးပါ။",
            )}
          </p>
        </div>
      </div>
      <div className="learn-layout">
        <nav
          className="lesson-navigation"
          aria-label={t("Learning modules", "လေ့လာခန်းများ")}
        >
          {modules.map(([key, en, my], i) => (
            <button
              key={key}
              aria-pressed={active === key}
              onClick={() => setActive(key)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{t(en, my)}</strong>
              <ArrowRight size={16} />
            </button>
          ))}
        </nav>
        <section
          className="simulation-frame"
          aria-label={t(
            "Interactive learning example",
            "အပြန်အလှန် လေ့လာနမူနာ",
          )}
        >
          <div className="simulation-top">
            <span className="status-pill">
              {t("Educational · synthetic", "ပညာပေး · စိတ်ကူးယဉ်")}
            </span>
            <button onClick={reset}>
              <RotateCcw size={15} />
              {t("Reset", "မူလအတိုင်း ပြန်ထား")}
            </button>
          </div>
          {active === "enso" && (
            <>
              <h2>
                {t("The Pacific, in three phases", "ပစိဖိတ်၏ အဆင့်သုံးမျိုး")}
              </h2>
              <p>
                {t(
                  "Trade winds and ocean temperatures influence one another. Explore the pattern; it cannot predict your local rainfall.",
                  "ကုန်သွယ်လေနှင့် သမုဒ္ဒရာအပူချိန်သည် အပြန်အလှန် သက်ရောက်သည်။ ဖြစ်စဉ်ကို လေ့လာနိုင်သော်လည်း သင့်ဒေသမိုးရေကို မခန့်မှန်းနိုင်ပါ။",
                )}
              </p>
              <div
                className="range-tabs"
                role="group"
                aria-label={t("ENSO phase example", "ENSO အဆင့်နမူနာ")}
              >
                {[
                  ["La Niña", "လာနီညာ"],
                  ["Neutral", "ကြားနေ"],
                  ["El Niño", "အယ်လ်နီညို"],
                ].map(([en, my], i) => (
                  <button
                    key={en}
                    aria-pressed={phase === i}
                    onClick={() => setPhase(i)}
                  >
                    {t(en, my)}
                  </button>
                ))}
              </div>
              <div
                className={`pacific-schematic phase-${phase}`}
                role="img"
                aria-label={
                  phase === 2
                    ? t(
                        "El Niño schematic: weaker trade winds and warm surface water spreading east.",
                        "အယ်လ်နီညိုပုံ၊ ကုန်သွယ်လေ အားနည်း၍ ရေနွေး အရှေ့သို့ ပြန့်သည်။",
                      )
                    : phase === 0
                      ? t(
                          "La Niña schematic: stronger trade winds, colder eastern surface water.",
                          "လာနီညာပုံ၊ ကုန်သွယ်လေ အားကောင်း၍ အရှေ့မျက်နှာပြင်ရေ ပိုအေးသည်။",
                        )
                      : t(
                          "Neutral schematic: trade winds push warm surface water west.",
                          "ကြားနေပုံ၊ ကုန်သွယ်လေက ရေနွေးကို အနောက်သို့ တွန်းသည်။",
                        )
                }
              >
                <div className="pacific-labels">
                  <span>{t("WEST · ASIA", "အနောက် · အာရှ")}</span>
                  <span>{t("EAST · AMERICAS", "အရှေ့ · အမေရိက")}</span>
                </div>
                <p className="trade-wind">
                  {phase === 2
                    ? t("← Weaker trade winds", "← ကုန်သွယ်လေ အားနည်း")
                    : phase === 0
                      ? t(
                          "⟵ ⟵ Stronger trade winds",
                          "⟵ ⟵ ကုန်သွယ်လေ အားကောင်း",
                        )
                      : t("⟵ Trade winds", "⟵ ကုန်သွယ်လေ")}
                </p>
                <div className="ocean-example">
                  <div className="warm-surface">
                    {t("Warm surface water", "မျက်နှာပြင်ရေနွေး")}
                  </div>
                  <span>{t("Cooler water below", "အောက်ပိုင်း ရေအေး")}</span>
                </div>
              </div>
              <p aria-live="polite">
                {phase === 2
                  ? t(
                      "Weaker winds allow warm water to spread east. This changes large-scale circulation, with different impacts in different seasons and places.",
                      "လေအားနည်းလျှင် ရေနွေး အရှေ့သို့ ပြန့်လာသည်။ လေထုလည်ပတ်မှု ပြောင်းလဲပြီး ရာသီနှင့် နေရာအလိုက် သက်ရောက်မှု ကွာသည်။",
                    )
                  : phase === 0
                    ? t(
                        "Stronger winds push warm water west, while upwelling supports cooler eastern-Pacific conditions.",
                        "လေအားကောင်းလျှင် ရေနွေးကို အနောက်သို့ တွန်းပြီး ရေအေးတက်မှုက အရှေ့ပစိဖိတ်ကို ပိုအေးစေသည်။",
                      )
                    : t(
                        "Ocean and atmosphere are coupled. The neutral example has warm water in the west and cooler water rising in the east.",
                        "သမုဒ္ဒရာနှင့် လေထု ဆက်နွယ်နေသည်။ ကြားနေနမူနာတွင် အနောက်ဘက်ရေနွေးနှင့် အရှေ့ဘက်ရေအေးတက်မှု ရှိသည်။",
                      )}
              </p>
              <Source id="enso-education" />
            </>
          )}
          {active === "rain" && (
            <>
              <h2>
                {t("Compared with what?", "ဘယ်တန်ဖိုးနှင့် နှိုင်းယှဉ်သလဲ။")}
              </h2>
              <p>
                {t(
                  "An anomaly is a difference from a stated baseline. Use the same place, period and dataset on both sides.",
                  "ကွာဟချက်သည် သတ်မှတ်အခြေခံတန်ဖိုးနှင့် ခြားနားမှုဖြစ်သည်။ နှစ်ဖက်လုံးတွင် တူညီနေရာ၊ ကာလနှင့် ဒေတာကို သုံးရသည်။",
                )}
              </p>
              {slider(
                "rain",
                t("Example rainfall", "နမူနာ မိုးရေ"),
                rain,
                0,
                300,
                setRain,
                "mm",
                10,
              )}
              {slider(
                "baseline",
                t("Example normal rainfall", "နမူနာ ပုံမှန်မိုးရေ"),
                baseline,
                0,
                300,
                setBaseline,
                "mm",
                10,
              )}
              <div className="simulation-result" aria-live="polite">
                <strong>{number(anomaly.difference, lang)} mm</strong>
                <span>
                  {anomaly.percent === null
                    ? t(
                        "Percentage undefined when the baseline is zero.",
                        "အခြေခံတန်ဖိုး သုညဖြစ်လျှင် ရာခိုင်နှုန်း မတွက်နိုင်ပါ။",
                      )
                    : `${number(anomaly.percent, lang)}% · ${anomaly.difference >= 0 ? t("wetter than this example baseline", "နမူနာအခြေခံထက် မိုးပိုများ") : t("drier than this example baseline", "နမူနာအခြေခံထက် မိုးပိုနည်း")}`}
                </span>
              </div>
              <p className="small">
                {t(
                  "A rainfall deficit does not prove a drought, and a surplus does not prove a flood. The live data suppresses percentages for very small expected rainfall.",
                  "မိုးရေလိုငွေက မိုးခေါင်မှုကို မသက်သေပြသကဲ့သို့ ပိုလျှံမှုက ရေကြီးမှုကို မသက်သေပြပါ။ အမှန်ဒေတာတွင် ပုံမှန်မိုးရေအလွန်နည်းလျှင် ရာခိုင်နှုန်း မပြပါ။",
                )}
              </p>
              <Source id="rain-anomaly" />
            </>
          )}
          {active === "drought" && (
            <>
              <h2>
                {t(
                  "A standardized score: the idea behind SPI",
                  "စံပြုရမှတ်၊ SPI နောက်ခံအယူအဆ",
                )}
              </h2>
              <p>
                {t(
                  "This toy model uses a simple normal-distribution score: (rain − mean) / standard deviation. Real SPI needs a long seasonal record and a fitted probability distribution. This score is not SPI.",
                  "ဤနမူနာက (မိုးရေ − ပျမ်းမျှ) / စံသွေဖည်မှု ရိုးရှင်းရမှတ်ကို သုံးသည်။ SPI အမှန်တွက်ရန် ရှည်လျားသောရာသီသမိုင်းနှင့် ဖြစ်နိုင်ခြေဖြန့်ဝေမှု ချိန်ညှိရသည်။ ဤရမှတ်သည် SPI မဟုတ်ပါ။",
                )}
              </p>
              {slider(
                "drought",
                t("Synthetic rainfall", "စိတ်ကူးယဉ် မိုးရေ"),
                drought,
                0,
                200,
                setDrought,
                "mm",
                5,
              )}
              <p>
                {t(
                  "Synthetic mean = 100 mm; standard deviation = 30 mm.",
                  "စိတ်ကူးယဉ်ပျမ်းမျှ = ၁၀၀ မီလီမီတာ၊ စံသွေဖည်မှု = ၃၀ မီလီမီတာ။",
                )}
              </p>
              <div className="simulation-result" aria-live="polite">
                <strong>{number(score, lang, 2)}</strong>
                <span>
                  {t(
                    "Synthetic standard score · not a drought warning",
                    "စိတ်ကူးယဉ် စံပြုရမှတ် · မိုးခေါင်သတိပေးချက် မဟုတ်ပါ",
                  )}
                </span>
              </div>
              <Source id="spi" />
            </>
          )}
          {active === "probability" && (
            <>
              <h2>
                {t(
                  "Probability is not certainty",
                  "ဖြစ်နိုင်ခြေသည် သေချာမှု မဟုတ်ပါ",
                )}
              </h2>
              <p>
                {t(
                  "Imagine ten equally likely synthetic cases. The marked cases represent the selected chance. This is a visual analogy, not a forecast.",
                  "ဖြစ်နိုင်ခြေတူ စိတ်ကူးယဉ်ဖြစ်ရပ်ဆယ်ခုဟု ယူဆပါ။ မှတ်သားထားသောအကွက်များက ရွေးထားသည့်ဖြစ်နိုင်ခြေကို ကိုယ်စားပြုသည်။ ရှင်းလင်းနမူနာသာဖြစ်ပြီး ခန့်မှန်းချက် မဟုတ်ပါ။",
                )}
              </p>
              {slider(
                "probability",
                t("Example event probability", "နမူနာ ဖြစ်ရပ်ဖြစ်နိုင်ခြေ"),
                probability,
                0,
                100,
                setProbability,
                "%",
                10,
              )}
              <div
                className="probability-tiles"
                role="img"
                aria-label={`${outcomes} / 10 ${t("example cases marked", "နမူနာ ဖြစ်ရပ်မှတ်သားထား")}`}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <span
                    key={i}
                    className={i < outcomes ? "marked" : ""}
                    aria-hidden="true"
                  >
                    {i < outcomes ? "✓" : "—"}
                  </span>
                ))}
              </div>
              <p aria-live="polite">
                <strong>
                  {number(outcomes, lang, 0)} / {number(10, lang, 0)}
                </strong>{" "}
                {t(
                  "synthetic cases marked. A 60% rain probability does not mean 60 mm of rain, 60% of the day, or certainty of flooding.",
                  "နမူနာဖြစ်ရပ် မှတ်သားထားသည်။ မိုးရွာနိုင်ခြေ ၆၀% ဆိုခြင်းသည် မိုးရေ ၆၀ မီလီမီတာ၊ နေ့၏ ၆၀% သို့မဟုတ် ရေကြီးသေချာမှု မဟုတ်ပါ။",
                )}
              </p>
              <Source id="enso-probabilities" />
            </>
          )}
          {active === "heat" && (
            <>
              <h2>
                {t(
                  "Humidity changes how heat feels",
                  "စိုထိုင်းဆက အပူခံစားရပုံကို ပြောင်းလဲစေသည်",
                )}
              </h2>
              <p>
                {t(
                  "Change synthetic temperature and humidity to explore the NWS heat-index estimate. The equation assumes shade and light wind; direct sun and physical work can increase heat stress.",
                  "စိတ်ကူးယဉ်အပူချိန်နှင့် စိုထိုင်းဆကို ပြောင်း၍ NWS အပူဒဏ်ညွှန်းကိန်း လေ့လာပါ။ အရိပ်နှင့် လေအေးအေးဟု ယူဆထားသည်။ နေရောင်နှင့် အလုပ်အားစိုက်မှုက အပူဒဏ်တိုးနိုင်သည်။",
                )}
              </p>
              {slider(
                "temperature",
                t("Synthetic temperature", "စိတ်ကူးယဉ် အပူချိန်"),
                temperature,
                20,
                42,
                setTemperature,
                "°C",
              )}
              {slider(
                "humidity",
                t(
                  "Synthetic relative humidity",
                  "စိတ်ကူးယဉ် နှိုင်းရစိုထိုင်းဆ",
                ),
                humidity,
                20,
                90,
                setHumidity,
                "%",
                5,
              )}
              <div className="simulation-result" aria-live="polite">
                <strong>
                  {number(heatIndex(temperature, humidity), lang)}°C
                </strong>
                <span>
                  {t(
                    "Educational heat-index estimate; not a medical assessment or warning",
                    "ပညာပေး အပူဒဏ်ညွှန်းကိန်း၊ ဆေးဘက်သုံးသပ်ချက် သို့မဟုတ် သတိပေးချက် မဟုတ်ပါ",
                  )}
                </span>
              </div>
              <Source id="heat-index" />
            </>
          )}
          {active === "flood" && (
            <>
              <h2>
                {t("The road ahead is flooded", "ရှေ့လမ်းတွင် ရေကြီးနေသည်")}
              </h2>
              <p>
                {t(
                  "Synthetic scenario: you cannot see the road surface or judge the current. What is the safer next step?",
                  "စိတ်ကူးယဉ်နမူနာ၊ လမ်းမျက်နှာပြင်ကို မမြင်ရဘဲ ရေစီးအား မသိနိုင်ပါ။ ဘေးကင်းသော နောက်တစ်ဆင့်က ဘာလဲ။",
                )}
              </p>
              <div className="scenario-choices">
                {[
                  [
                    "cross",
                    "Try crossing slowly",
                    "ဖြည်းဖြည်း ဖြတ်ကူးကြည့်မည်",
                  ],
                  [
                    "return",
                    "Turn back and find a safe route",
                    "ပြန်လှည့်၍ ဘေးကင်းလမ်းရှာမည်",
                  ],
                  [
                    "follow",
                    "Follow a larger vehicle",
                    "ကားကြီးနောက် လိုက်မည်",
                  ],
                ].map(([key, en, my]) => (
                  <button
                    key={key}
                    aria-pressed={decision === key}
                    onClick={() => setDecision(key)}
                  >
                    {t(en, my)}
                  </button>
                ))}
              </div>
              {decision && (
                <div className="simulation-result" aria-live="polite">
                  <strong>
                    {decision === "return"
                      ? t("Turn back.", "ပြန်လှည့်ပါ။")
                      : t("Choose a safer route.", "ဘေးကင်းလမ်း ရွေးပါ။")}
                  </strong>
                  <span>
                    {t(
                      "Floodwater depth, road damage and current are hard to judge. Avoid walking or driving through floodwater and follow official local instructions.",
                      "ရေအနက်၊ လမ်းပျက်စီးမှုနှင့် ရေစီးအားကို ခန့်မှန်းရခက်သည်။ ရေကြီးနေရာကို ခြေလျင်၊ ကားဖြင့် မဖြတ်ဘဲ ဒေသတရားဝင်ညွှန်ကြားချက် လိုက်နာပါ။",
                    )}
                  </span>
                </div>
              )}
              <Source id="preparedness" />
            </>
          )}
        </section>
      </div>
      <p className="learning-footer">
        {t(
          "Use Tab to move between controls and arrow keys to change sliders. Reset restores every synthetic example. For actual source-backed conditions, return to Weather or Climate.",
          "Tab ဖြင့် ခလုတ်ရွှေ့၍ မြှားခလုတ်များဖြင့် တန်ဖိုးပြောင်းနိုင်သည်။ မူလအတိုင်းခလုတ်က နမူနာအားလုံးကို ပြန်ထားသည်။ အမှန်တကယ်ရင်းမြစ်ပါ အခြေအနေအတွက် မိုးလေဝသ သို့မဟုတ် ရာသီဥတုစာမျက်နှာသို့ ပြန်သွားပါ။",
        )}
      </p>
    </>
  );
}
