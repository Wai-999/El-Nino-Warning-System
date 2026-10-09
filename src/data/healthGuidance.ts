import type { Bilingual } from "./impactEvidence";

export const healthReviewedAt = "2026-10-04T18:00:00Z";
export const healthSources = {
  dehydration: {
    publisher: "NHS",
    title: "Dehydration",
    date: "2026-05-01",
    url: "https://www.nhs.uk/conditions/dehydration/",
  },
  heat: {
    publisher: "CDC / NIOSH",
    title: "Heat-related illnesses",
    date: "2026-03-03",
    url: "https://www.cdc.gov/niosh/heat-stress/about/illnesses.html",
  },
  stroke: {
    publisher: "NHS",
    title: "Heat exhaustion and heatstroke",
    date: "2026-05-28",
    url: "https://www.nhs.uk/conditions/heat-exhaustion-heatstroke/",
  },
  climate: {
    publisher: "WHO",
    title: "Heat and health",
    date: "2026-07-31",
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
  },
  water: {
    publisher: "WHO",
    title: "Diarrhoeal disease",
    date: "2024-03-07",
    url: "https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease",
  },
  cholera: {
    publisher: "WHO",
    title: "Cholera",
    date: "2026-09-29",
    url: "https://www.who.int/news-room/fact-sheets/detail/cholera",
  },
  dengue: {
    publisher: "WHO",
    title: "Dengue and severe dengue",
    date: "2025-08-21",
    url: "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue",
  },
  malaria: {
    publisher: "WHO",
    title: "Malaria",
    date: "2025-12-04",
    url: "https://www.who.int/news-room/fact-sheets/detail/malaria",
  },
  smoke: {
    publisher: "WHO",
    title: "Public health advice during wildfires",
    date: "2023-06-16",
    url: "https://www.who.int/europe/news-room/questions-and-answers/item/public-health-advice-during-the-wildfires--how-to-protect-your-health-and-keep-safe",
  },
  food: {
    publisher: "CDC",
    title: "Symptoms of food poisoning",
    date: "2025-11-24",
    url: "https://www.cdc.gov/food-safety/signs-symptoms/",
  },
  foodSafety: {
    publisher: "WHO",
    title: "Five keys to safer food",
    date: null,
    url: "https://www.who.int/activities/promoting-safe-food-handling/promoting-safe-food-handling",
  },
} as const;
export type HealthSourceId = keyof typeof healthSources;
export type HealthTopic = {
  id: string;
  name: Bilingual;
  pathway: Bilingual;
  vulnerable: Bilingual;
  signs: Bilingual;
  now: Bilingual;
  care: Bilingual;
  emergency: Bilingual;
  prevention: Bilingual;
  sources: HealthSourceId[];
};
// Public first aid, never a diagnosis or a disease-risk algorithm. Each topic's
// symptom/action/triage fields share the authoritative references listed below.
export const healthTopics: HealthTopic[] = [
  {
    id: "dehydration",
    name: ["Dehydration", "ရေဓာတ်ခန်းခြောက်ခြင်း"],
    pathway: [
      "Heat and sweating, or diarrhoea/vomiting → dehydration.",
      "အပူနှင့် ချွေးထွက်မှု၊ ဝမ်းလျှော/အန်ခြင်း → ရေဓာတ်ခန်းခြောက်မှု။",
    ],
    vulnerable: [
      "Babies, older people and people who need help drinking.",
      "ကလေးငယ်၊ သက်ကြီးရွယ်အိုနှင့် ရေသောက်ရန် အကူအညီလိုသူများ။",
    ],
    signs: [
      "Thirst, dry mouth, dark or less urine, dizziness or tiredness.",
      "ရေငတ်ခြင်း၊ ပါးစပ်ခြောက်ခြင်း၊ ဆီးအရောင်ရင့်/ဆီးနည်းခြင်းများ၊ မူးဝေ သို့မဟုတ် နွမ်းနယ်ခြင်း။",
    ],
    now: [
      "If awake and able to swallow, take small frequent sips. Ask a pharmacist about oral rehydration solution for diarrhoea or vomiting.",
      "သတိရှိ၍ မျိုချနိုင်ပါက အရည်ကို နည်းနည်းနှင့် မကြာခဏသောက်ပါ။ ဝမ်းလျှော/အန်လျှင် ဓာတ်ဆားရည် (ORS) အကြောင်း ဆေးဝါးကျွမ်းကျင်သူထံ မေးမြန်းပါ။",
    ],
    care: [
      "Persistent dizziness on standing, very little urine, unusual drowsiness, or fewer wet nappies in a baby.",
      "ထရပ်ချိန် မူးဝေမှုမပျောက်၊ ဆီးအလွန်နည်း၊ ပုံမှန်မဟုတ်ဘဲ အိပ်ငိုက်၊ ကလေးဆီးစိုအနှီး နည်းလာလျှင်။",
    ],
    emergency: [
      "Confusion, difficulty waking, or difficulty breathing: get emergency help now.",
      "သတိလစ်ခြင်း သို့မဟုတ် အသက်ရှူခက်ခြင်းများကြုံရလျှင် အရေးပေါ်အကူအညီ ချက်ချင်းရယူပါ။",
    ],
    prevention: [
      "Drink regularly. Follow your clinician’s plan if you have a fluid restriction.",
      "ပုံမှန်ရေသောက်ပါ။ အရည်သောက်ပမာဏ ကန့်သတ်ထားသူသည် ဆရာဝန်၏ ညွှန်ကြားချက်ကို လိုက်နာပါ။",
    ],
    sources: ["dehydration"],
  },
  {
    id: "cramps",
    name: ["Heat cramps", "အပူကြောင့် ကြွက်တက်ခြင်း"],
    pathway: [
      "Hard work in heat → heavy sweating → muscle cramps.",
      "ပူပြင်းချိန် အလုပ်ကြမ်းလုပ်ခြင်း → ချွေးများထွက်ခြင်း → ကြွက်တက်ခြင်း။",
    ],
    vulnerable: [
      "Outdoor workers and people exercising in heat.",
      "အပြင်ထွက်အလုပ်လုပ်သူနှင့် ပူပြင်းချိန် လေ့ကျင့်ခန်းလုပ်သူများ။",
    ],
    signs: [
      "Painful muscle spasms, often in arms, legs or abdomen.",
      "လက်၊ ခြေ သို့မဟုတ် ဝမ်းဗိုက်ကြွက်သားများ နာကျင်ခြင်း။",
    ],
    now: [
      "Stop exertion, rest somewhere cool and drink water if able to swallow.",
      "အေးသောနေရာတွင် အနားယူပါ။ မျိုချနိုင်ပါက ရေသောက်ပါ။",
    ],
    care: [
      "Cramps lasting over an hour, heart disease or a prescribed low-sodium diet.",
      "တစ်နာရီကျော်၍ မသက်သာလျှင်၊ နှလုံးရောဂါရှိသူ သို့မဟုတ် ဆားလျှော့စားရန် ညွှန်ကြားထားခြင်းခံရလျှင်။",
    ],
    emergency: [
      "Confusion, collapse or seizures may signal heatstroke: get help and cool immediately.",
      "မူး‌‌ဝေလဲကျခြင်း၊ တက်ခြင်း သို့မဟုတ် အပူလျှပ်ခြင်း ဖြစ်နိုင်သည်။ အကူအညီရယူ၍ ချက်ချင်းအအေးပေးပါ။",
    ],
    prevention: [
      "Take cool rest breaks and reduce strenuous work during the hottest hours.",
      "အေးသောနေရာ၌ အနားယူ၍ အပူဆုံးအချိန် အလုပ်ကြမ်း လျှော့ပါ။",
    ],
    sources: ["heat", "climate"],
  },
  {
    id: "exhaustion",
    name: ["Heat exhaustion", "အပူဒဏ်ကြောင့် နွမ်းနယ်ခြင်း"],
    pathway: [
      "Heat exposure → loss of water and salt through sweat → heat illness.",
      "အပူထိတွေ့မှု → ချွေးမှ ရေနှင့် ဓာတ်ဆားဆုံးရှုံးမှု → အပူဒဏ်ခံရခြင်း။",
    ],
    vulnerable: [
      "Older people, outdoor workers and people with chronic illness.",
      "သက်ကြီးရွယ်အို၊ အပြင်အလုပ်လုပ်သူနှင့် နာတာရှည်ရောဂါရှိသူများ။",
    ],
    signs: [
      "Heavy sweating, weakness, headache, nausea, dizziness or thirst.",
      "ချွေးများ၊ အားနည်း၊ ခေါင်းကိုက်၊ ပျို့၊ မူးဝေ သို့မဟုတ် ရေငတ်ခြင်း။",
    ],
    now: [
      "Stop activity; move to shade, loosen clothing and cool with wet cloths. Sip cool water only if alert and swallowing safely; stay with the person.",
      "လှုပ်ရှားမှုရပ်၍ အရိပ်သို့ရွှေ့၊ အဝတ်လျှော့၊ ရေစိုအဝတ်ဖြင့် အအေးပေးပါ။ သတိကောင်း၍ မျိုချနိုင်မှ ရေအေးနည်းနည်းစီ သောက်ပါ။ အနားတွင် နေပေးပါ။",
    ],
    care: [
      "Arrange prompt medical assessment, particularly if symptoms persist or worsen.",
      "အမြန်ဆုံး ဆေးကုသမှု စီစဉ်ပါ။ လက္ခဏာမသက်သာ သို့မဟုတ် ပိုဆိုးလျှင် ပို၍အရေးကြီးသည်။",
    ],
    emergency: [
      "Confusion, seizures or loss of consciousness: treat as an emergency, not simple exhaustion.",
      "စိတ်ရှုပ်ထွေး၊ တက် သို့မဟုတ် သတိလစ်လျှင် အရေးပေါ်အခြေအနေဖြစ်သည်။ ရိုးရိုးနွမ်းနယ်ခြင်းဟု မယူဆပါနှင့်။",
    ],
    prevention: [
      "Pace work, take shade breaks and check on people at higher risk.",
      "အလုပ်အရှိန်လျှော့၊ အရိပ်တွင်နား၍ ထိခိုက်လွယ်သူများကို စောင့်ရှောက်ပါ။",
    ],
    sources: ["heat", "climate"],
  },
  {
    id: "heatstroke",
    name: ["Heatstroke — emergency", "အပူလျှပ်ခြင်း — အရေးပေါ်"],
    pathway: [
      "Severe heat exposure → body cannot control temperature → possible organ injury.",
      "အပူဒဏ်ပြင်းထန်မှု → ကိုယ်အပူချိန် မထိန်းနိုင်ခြင်း → ကိုယ်တွင်းအင်္ဂါ ထိခိုက်နိုင်ခြင်း။",
    ],
    vulnerable: [
      "Anyone can be affected, including workers, children and older people.",
      "အလုပ်သမား၊ ကလေး၊ သက်ကြီးရွယ်အို အပါအဝင် မည်သူမဆို ထိခိုက်နိုင်သည်။",
    ],
    signs: [
      "Very hot body with confusion, poor coordination or unusual behaviour. Sweating may still be present.",
      "ကိုယ်ပူပြင်းပြီး စိတ်ရှုပ်ထွေး၊ လှုပ်ရှားမှုမထိန်းနိုင် သို့မဟုတ် အပြုအမူပြောင်းခြင်း။ ချွေးဆက်ထွက်နေနိုင်သည်။",
    ],
    now: [
      "Get emergency medical help immediately and cool while help is arranged: shade, remove excess clothing, wet the skin and fan. Do not give drinks to someone confused, unconscious or unable to swallow safely.",
      "အရေးပေါ်ဆေးကုသမှု ချက်ချင်းတောင်း၍ စောင့်နေစဉ် အအေးပေးပါ — အရိပ်သို့ရွှေ့၊ အပိုအဝတ်ဖယ်၊ အရေပြားရေစိုစေပြီး ယပ်ခတ်ပါ။ စိတ်ရှုပ်ထွေး၊ သတိလစ် သို့မဟုတ် မျိုချမရသူကို အရည်မတိုက်ပါနှင့်။",
    ],
    care: [
      "Suspected heatstroke always needs emergency care. Do not wait for a temperature reading or for cooling to work.",
      "အပူလျှပ်သည်ဟု သံသယရှိလျှင် အရေးပေါ်ကုသမှု လိုသည်။ အပူချိန်တိုင်းရသည်အထိ၊ အအေးပေး၍ သက်သာသည်အထိ မစောင့်ပါနှင့်။",
    ],
    emergency: [
      "Confusion, seizures, collapse or unconsciousness in the heat: act now.",
      "ပူပြင်းချိန် စိတ်ရှုပ်ထွေး၊ တက်၊ လဲကျ သို့မဟုတ် သတိလစ်လျှင် ချက်ချင်းဆောင်ရွက်ပါ။",
    ],
    prevention: [
      "Avoid overheating; never leave anyone in a parked vehicle.",
      "အပူလွန်ကဲမှု ရှောင်ပါ။ ရပ်ထားသောကားထဲတွင် လူကို တစ်ယောက်တည်း မထားပါနှင့်။",
    ],
    sources: ["stroke", "heat", "climate"],
  },
  {
    id: "diarrhoea",
    name: [
      "Acute watery diarrhoea & sanitation",
      "ရုတ်တရက် ရေဝမ်းလျှောခြင်းနှင့် သန့်ရှင်းရေး",
    ],
    pathway: [
      "Unsafe food/water or poor sanitation → exposure to germs → diarrhoea; not every watery diarrhoea illness is cholera.",
      "မသန့်ရှင်းသော အစားအစာ/ရေ သို့မဟုတ် မိလ္လာစနစ်ချို့တဲ့မှု → ရောဂါပိုးထိတွေ့မှု → ဝမ်းလျှောခြင်း။ ရေဝမ်းလျှောတိုင်း ကာလဝမ်း မဟုတ်ပါ။",
    ],
    vulnerable: [
      "Young children, malnourished people and those without safe water.",
      "ကလေးငယ်၊ အာဟာရချို့တဲ့သူနှင့် သန့်ရှင်းသောရေ မရရှိသူများ။",
    ],
    signs: [
      "Frequent loose or watery stools, sometimes vomiting; thirst or reduced urine suggests fluid loss.",
      "မကြာခဏ ဝမ်းပျော့/ရေဝမ်းသွား၊ တစ်ခါတစ်ရံ အန်ခြင်း။ ရေငတ်၊ ဆီးနည်းခြင်းသည် အရည်ဆုံးရှုံးမှု လက္ခဏာဖြစ်နိုင်သည်။",
    ],
    now: [
      "If able to drink, start packaged ORS mixed with safe water exactly as directed. Continue breastfeeding and food as tolerated. Seek prompt care for profuse watery diarrhoea.",
      "သောက်နိုင်ပါက ထုပ်ပိုးဓာတ်ဆား (ORS) ကို ညွှန်ကြားချက်အတိုင်း သန့်ရှင်းသောရေနှင့်ဖျော်၍ တိုက်ပါ။ နို့တိုက်ခြင်း၊ စားနိုင်သမျှ အစာကျွေးခြင်း ဆက်လုပ်ပါ။ ရေဝမ်းအများကြီးသွားလျှင် အမြန်ကုသမှု ရယူပါ။",
    ],
    care: [
      "Blood in stool, persistent diarrhoea, repeated vomiting or dehydration needs medical review.",
      "ဝမ်းတွင်သွေးပါ၊ ဝမ်းလျှောမပျောက်၊ ဆက်တိုက်အန် သို့မဟုတ် ရေဓာတ်ခန်းခြောက်လျှင် ဆေးကုသမှု ရယူပါ။",
    ],
    emergency: [
      "Unable to drink, very drowsy or unconscious: urgent medical help. Severe fluid loss can become life-threatening quickly.",
      "မသောက်နိုင်၊ အလွန်အိပ်ငိုက် သို့မဟုတ် သတိလစ်လျှင် အရေးပေါ်အကူအညီ ရယူပါ။ အရည်ဆုံးရှုံးမှုများလျှင် လျင်မြန်စွာ အသက်အန္တရာယ် ရှိနိုင်သည်။",
    ],
    prevention: [
      "Use safe water, wash hands with soap, protect food and safely dispose of faeces.",
      "သန့်ရှင်းသောရေသုံး၊ ဆပ်ပြာဖြင့် လက်ဆေး၊ အစားအစာဖုံးအုပ်၍ မစင်ကို စနစ်တကျ စွန့်ပစ်ပါ။",
    ],
    sources: ["water", "cholera"],
  },
  {
    id: "dengue",
    name: ["Dengue", "သွေးလွန်တုပ်ကွေး (Dengue)"],
    pathway: [
      "Infected Aedes mosquito bite → dengue infection. Weather alone cannot establish transmission or cases.",
      "ရောဂါပိုးရှိ Aedes ခြင်ကိုက်ခြင်း → ဒင်ဂီကူးစက်မှု။ မိုးလေဝသတစ်ခုတည်းဖြင့် ကူးစက်မှုနှင့် လူနာအရေအတွက် မသတ်မှတ်နိုင်ပါ။",
    ],
    vulnerable: [
      "Anyone exposed to infected mosquitoes; severe illness needs prompt recognition.",
      "ရောဂါပိုးရှိခြင်နှင့် ထိတွေ့သူအားလုံး။ ပြင်းထန်လက္ခဏာကို စောစီးစွာ သတိပြုရန် လိုသည်။",
    ],
    signs: [
      "Fever, headache, pain behind the eyes, body aches, nausea or rash.",
      "ဖျား၊ ခေါင်းကိုက်၊ မျက်လုံးနောက်ဘက်နာ၊ ကိုယ်လက်ကိုက်၊ ပျို့ သို့မဟုတ် အဖုထွက်ခြင်း။",
    ],
    now: [
      "Rest, drink if able and seek medical advice. Avoid aspirin and ibuprofen because of bleeding risk; ask a clinician about treatment.",
      "နားပါ၊ သောက်နိုင်လျှင် အရည်သောက်၍ ဆေးဘက်ဆိုင်ရာအကြံဉာဏ် ရယူပါ။ သွေးယိုနိုင်သောကြောင့် aspirin နှင့် ibuprofen ရှောင်ပြီး ကုသမှုကို ဆရာဝန်ထံ မေးပါ။",
    ],
    care: [
      "Suspected dengue needs medical advice. Keep watching after fever falls: danger signs can start then.",
      "ဒင်ဂီဟု သံသယရှိပါက ဆေးဘက်ဆိုင်ရာအကြံဉာဏ် ရယူပါ။ အဖျားကျပြီးမှ အန္တရာယ်လက္ခဏာ ပေါ်လာနိုင်သဖြင့် ဆက်စောင့်ကြည့်ပါ။",
    ],
    emergency: [
      "Severe belly pain, persistent vomiting, bleeding, rapid breathing or cold pale skin: seek urgent care.",
      "ဝမ်းဗိုက်အလွန်နာ၊ မရပ်မနားအန်၊ သွေးယို၊ အသက်ရှူမြန် သို့မဟုတ် အသားအရေအေးဖျော့လျှင် အရေးပေါ်ကုသမှု ရယူပါ။",
    ],
    prevention: [
      "Prevent daytime mosquito bites; cover stored water and remove standing water.",
      "နေ့ဘက် ခြင်ကိုက်မှုကာကွယ်၊ သိုလှောင်ရေဖုံး၍ ရေတင်ကျန်နေရာများ ရှင်းပါ။",
    ],
    sources: ["dengue"],
  },
  {
    id: "malaria",
    name: ["Malaria", "ငှက်ဖျား (Malaria)"],
    pathway: [
      "Infected Anopheles mosquito bite → malaria parasites. Risk depends on local transmission and exposure, not ENSO phase.",
      "ရောဂါပိုးရှိ Anopheles ခြင်ကိုက်ခြင်း → ငှက်ဖျားပိုးကူးစက်မှု။ အန္တရာယ်သည် ဒေသကူးစက်မှုနှင့် ထိတွေ့မှုအပေါ် မူတည်သည်။ ENSO အဆင့်ဖြင့် မသတ်မှတ်ပါ။",
    ],
    vulnerable: [
      "Young children, pregnant people and those without immunity.",
      "ကလေးငယ်၊ ကိုယ်ဝန်ဆောင်နှင့် ကိုယ်ခံအားမရှိသူများ။",
    ],
    signs: [
      "Fever, chills and headache can resemble other illnesses.",
      "ဖျား၊ ချမ်းတုန်၊ ခေါင်းကိုက်ခြင်းသည် အခြားရောဂါနှင့် ဆင်တူနိုင်သည်။",
    ],
    now: [
      "Seek prompt testing and treatment from a health service after possible exposure. Do not diagnose or choose antimalarials yourself.",
      "ထိတွေ့နိုင်ခြေရှိပြီး ဖျားလျှင် ကျန်းမာရေးဌာန၌ အမြန်စစ်ဆေးကုသပါ။ ကိုယ်တိုင်ရောဂါမသတ်မှတ်၊ ငှက်ဖျားဆေး ကိုယ်တိုင်မရွေးပါနှင့်။",
    ],
    care: [
      "Any suspected malaria needs prompt assessment; delay can allow severe disease.",
      "ငှက်ဖျားဟု သံသယရှိတိုင်း အမြန်စစ်ဆေးမှု လိုသည်။ နှောင့်နှေးလျှင် ပြင်းထန်လာနိုင်သည်။",
    ],
    emergency: [
      "Confusion, repeated seizures, breathing difficulty, jaundice or dark/bloody urine needs urgent care.",
      "စိတ်ရှုပ်ထွေး၊ မကြာခဏတက်၊ အသက်ရှူခက်၊ အသားဝါ သို့မဟုတ် ဆီးနက်/သွေးပါလျှင် အရေးပေါ်ကုသမှု လိုသည်။",
    ],
    prevention: [
      "Use insecticide-treated bed nets, repellents as labelled and clothing that reduces bites.",
      "ဆေးစိမ်ခြင်ထောင်၊ ညွှန်ကြားချက်အတိုင်း ခြင်ကာဆေးနှင့် ခြင်ကိုက်မှုလျှော့သည့် အဝတ်အစား သုံးပါ။",
    ],
    sources: ["malaria"],
  },
  {
    id: "smoke",
    name: ["Smoke & haze irritation", "မီးခိုးနှင့် မီးခိုးမြူဒဏ်"],
    pathway: [
      "Smoke exposure → airway irritation or worsening heart/lung disease. A dry-weather signal is not a smoke measurement.",
      "မီးခိုးထိတွေ့မှု → အသက်ရှူလမ်းကြောင်း ယားယံခြင်း သို့မဟုတ် နှလုံး/အဆုတ်ရောဂါ ပိုဆိုးခြင်း။ ခြောက်သွေ့ညွှန်းကိန်းသည် မီးခိုးတိုင်းတာချက် မဟုတ်ပါ။",
    ],
    vulnerable: [
      "Children, older adults, pregnant people and people with heart/lung illness.",
      "ကလေး၊ သက်ကြီး၊ ကိုယ်ဝန်ဆောင်နှင့် နှလုံး/အဆုတ်ရောဂါရှိသူများ။",
    ],
    signs: [
      "Irritated eyes or throat, cough, wheezing or breathlessness.",
      "မျက်လုံး/လည်ချောင်း စပ်၊ ချောင်းဆိုး၊ ရင်ကျပ်သံ သို့မဟုတ် မောခြင်း။",
    ],
    now: [
      "Move to cleaner air; reduce exertion. Keep smoky air out only if indoors remains safe and cool. Follow evacuation instructions.",
      "လေသန့်ရာသို့ရွှေ့၍ အားစိုက်လှုပ်ရှားမှု လျှော့ပါ။ အိမ်တွင်းလုံခြုံအေးမြမှ မီးခိုးဝင်မှု ပိတ်ထားပါ။ ရွှေ့ပြောင်းညွှန်ကြားချက် လိုက်နာပါ။",
    ],
    care: [
      "New or worsening breathing symptoms need medical advice, especially with existing heart/lung disease.",
      "အသက်ရှူလက္ခဏာ အသစ်ပေါ်/ပိုဆိုးလျှင် ဆေးဘက်အကြံဉာဏ် ရယူပါ။ နှလုံး/အဆုတ်ရောဂါရှိသူများ အထူးသတိထားပါ။",
    ],
    emergency: [
      "Severe breathing difficulty or chest pain: get urgent medical help.",
      "အသက်ရှူအလွန်ခက် သို့မဟုတ် ရင်ဘတ်နာလျှင် အရေးပေါ်ဆေးကုသမှု ရယူပါ။",
    ],
    prevention: [
      "Check local air-quality and fire advice; use a well-fitting N95/FFP2 if smoke exposure cannot be avoided.",
      "ဒေသလေထုနှင့် မီးဘေးသတင်း စစ်ဆေးပါ။ မီးခိုးထိတွေ့မှု မရှောင်နိုင်လျှင် မျက်နှာနှင့် ကောင်းစွာအံဝင်သော N95/FFP2 သုံးပါ။",
    ],
    sources: ["smoke"],
  },
  {
    id: "food",
    name: ["Food safety", "အစားအစာ ဘေးကင်းရေး"],
    pathway: [
      "Unsafe storage, preparation or contaminated water → foodborne germs → illness.",
      "မသင့်လျော်သော သိုလှောင်/ပြင်ဆင်မှု သို့မဟုတ် ညစ်ညမ်းရေ → အစားအစာမှပိုးကူးစက်မှု → နာမကျန်းမှု။",
    ],
    vulnerable: [
      "Young children, pregnant people, older adults and people with weakened immunity.",
      "ကလေးငယ်၊ ကိုယ်ဝန်ဆောင်၊ သက်ကြီးနှင့် ကိုယ်ခံအားနည်းသူများ။",
    ],
    signs: [
      "Diarrhoea, stomach cramps, nausea, vomiting or fever.",
      "ဝမ်းလျှော၊ ဗိုက်အောင့်၊ ပျို့၊ အန် သို့မဟုတ် ဖျားခြင်း။",
    ],
    now: [
      "Drink fluids if able to swallow. Do not keep eating suspect food. Ask a health professional if you are concerned.",
      "မျိုချနိုင်လျှင် အရည်သောက်ပါ။ မသန့်ဟု သံသယရှိသော အစားအစာ ဆက်မစားပါနှင့်။ စိုးရိမ်ပါက ကျန်းမာရေးဝန်ထမ်းထံ မေးပါ။",
    ],
    care: [
      "Bloody diarrhoea, high fever, inability to keep fluids down or dehydration needs medical care. Pregnancy with fever needs prompt advice.",
      "သွေးဝမ်း၊ အဖျားကြီး၊ သောက်သမျှပြန်အန် သို့မဟုတ် ရေဓာတ်ခန်းခြောက်လျှင် ကုသမှု လိုသည်။ ကိုယ်ဝန်ဆောင်ဖျားလျှင် အမြန်အကြံဉာဏ် ရယူပါ။",
    ],
    emergency: [
      "Confusion, difficulty waking or breathing difficulty with dehydration: get emergency help.",
      "ရေဓာတ်ခန်းခြောက်ပြီး စိတ်ရှုပ်ထွေး၊ နှိုးရခက် သို့မဟုတ် အသက်ရှူခက်လျှင် အရေးပေါ်အကူအညီ ရယူပါ။",
    ],
    prevention: [
      "Keep clean; separate raw and cooked food; cook thoroughly; keep food at safe temperatures; use safe water and ingredients.",
      "သန့်ရှင်းစွာထား၊ အစိမ်း/အကျက်ခွဲ၊ ကျက်အောင်ချက်၊ သင့်လျော်သောအပူချိန်၌ထား၊ သန့်ရှင်းသောရေနှင့် ကုန်ကြမ်းသုံးပါ။",
    ],
    sources: ["food", "foodSafety", "dehydration"],
  },
];

export const burmeseHealthResources = [
  {
    name: [
      "WHO: protect yourself from heat",
      "WHO — အပူဒဏ်မှ ကာကွယ်ရန်",
    ] as Bilingual,
    url: "https://www.who.int/myanmar/emergencies/protect-yourself-from-heat--heatwave",
  },
  {
    name: [
      "WHO: monsoon and flood safety",
      "WHO — မိုးရာသီနှင့် ရေဘေးကင်းရေး",
    ] as Bilingual,
    url: "https://www.who.int/myanmar/emergencies/safety-during-monsoons-and-floods",
  },
  {
    name: [
      "WHO: acute watery diarrhoea Q&A (Myanmar)",
      "WHO — ရေဝမ်းလျှော မေးခွန်းနှင့်အဖြေ (မြန်မာ)",
    ] as Bilingual,
    url: "https://www.who.int/india/multimedia/item/acute-watery-diarrhoea-q-a-%28myanmar%29",
  },
  {
    name: [
      "WHO: five keys to safer food (Myanmar)",
      "WHO — ဘေးကင်းသောအစားအစာ အချက် ၅ ချက် (မြန်မာ)",
    ] as Bilingual,
    url: "https://www.who.int/southeastasia/multimedia/item/5-keys-to-safer-food-poster-%28myanmar%29",
  },
];
