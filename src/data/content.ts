export type Copy = readonly [string, string];
export const sources = {
  noaa: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
  who: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
  whoHelp:
    "https://www.who.int/docs/librariesprovider2/default-document-library/who-heat-infosheet-eng-2026.pdf",
  fao: "https://www.fao.org/el-nino/en",
  wmo: "https://wmo.int/themes/el-nino-la-nina-phenomena",
  learn: "https://oceanservice.noaa.gov/facts/ninonina.html",
  walker: "https://www.weather.gov/media/wrn/walker-circulation.pdf",
  dmh: "https://www.dmh.gov.mm/",
};
export const actions: Copy[] = [
  [
    "Check local weather bulletins before outdoor work or travel.",
    "ပြင်ပအလုပ်နှင့် ခရီးသွားခြင်းမပြုမီ ဒေသဆိုင်ရာ မိုးလေဝသသတင်းကို စစ်ဆေးပါ။",
  ],
  [
    "Keep drinking water ready and plan a shaded place to rest.",
    "သောက်ရေ အသင့်ထားပြီး အရိပ်ရသော နားနေရာ စီစဉ်ပါ။",
  ],
  [
    "Check on older people, children, and neighbours living alone.",
    "သက်ကြီးရွယ်အိုများ၊ ကလေးများနှင့် တစ်ဦးတည်းနေသူများကို မေးမြန်းကူညီပါ။",
  ],
];
export const sectors: {
  id: string;
  name: Copy;
  summary: Copy;
  risks: Copy[];
  action: Copy;
  source: string;
}[] = [
  {
    id: "weather",
    name: ["Weather & climate", "ရာသီဥတု"],
    summary: [
      "Seasonal conditions can shift. Local forecasts still matter.",
      "ရာသီအလိုက် အခြေအနေ ပြောင်းနိုင်သဖြင့် ဒေသဆိုင်ရာ ခန့်မှန်းချက်ကို စောင့်ကြည့်ပါ။",
    ],
    risks: [
      [
        "Heat, irregular rainfall, and dry spells are possible; timing varies by season and place.",
        "အပူချိန်မြင့်ခြင်း၊ မိုးရွာသွန်းမှု မမှန်ခြင်းနှင့် မိုးပြတ်ခြင်း ဖြစ်နိုင်ပြီး ရာသီနှင့် ဒေသအလိုက် ကွာခြားပါသည်။",
      ],
      [
        "El Niño does not mean every part of Myanmar will be dry. Heavy rain can still occur.",
        "အယ်လ်နီညိုကြောင့် မြန်မာတစ်နိုင်ငံလုံး ခြောက်သွေ့မည်ဟု မဆိုလိုပါ။ မိုးသည်းထန်စွာ ရွာနိုင်သေးသည်။",
      ],
    ],
    action: [
      "Follow short-range forecasts as well as seasonal outlooks.",
      "ကာလတို မိုးလေဝသခန့်မှန်းချက်နှင့် ရာသီအလိုက် ခန့်မှန်းချက် နှစ်မျိုးလုံးကို စောင့်ကြည့်ပါ။",
    ],
    source: sources.wmo,
  },
  {
    id: "health",
    name: ["Human health", "ကျန်းမာရေး"],
    summary: [
      "Prepare for heat before someone becomes unwell.",
      "အပူဒဏ်ကြောင့် ကျန်းမာရေး မထိခိုက်မီ ကြိုတင်ပြင်ဆင်ပါ။",
    ],
    risks: [
      [
        "Heat can cause dehydration, heat exhaustion, and heatstroke. Children, older adults, outdoor workers, and people with chronic illness need extra care.",
        "အပူဒဏ်ကြောင့် ရေဓာတ်ခန်းခြောက်ခြင်း၊ အပူပင်ပန်းနွမ်းနယ်ခြင်းနှင့် အပူလျှပ်ခြင်း ဖြစ်နိုင်သည်။ ကလေး၊ သက်ကြီးရွယ်အို၊ ပြင်ပအလုပ်သမားနှင့် နာတာရှည်ရောဂါရှိသူများကို အထူးဂရုစိုက်ပါ။",
      ],
      [
        "Dizziness, headache, weakness, or nausea need attention. Rest somewhere cool and seek medical advice if symptoms persist or worsen.",
        "မူးဝေခြင်း၊ ခေါင်းကိုက်ခြင်း၊ အားနည်းခြင်း သို့မဟုတ် ပျို့အန်ခြင်းရှိပါက အေးမြသောနေရာ၌ နားပါ။ မသက်သာလျှင် သို့မဟုတ် ပိုဆိုးလျှင် ဆေးကုသမှုခံယူပါ။",
      ],
    ],
    action: [
      "Drink safe water regularly; follow your clinician’s advice if you have a fluid restriction. Reduce strenuous activity during the hottest hours.",
      "သန့်ရှင်းသော သောက်ရေကို ပုံမှန်သောက်ပါ။ ရေသောက်ပမာဏ ကန့်သတ်ထားသူများသည် ဆရာဝန်ညွှန်ကြားချက်ကို လိုက်နာပါ။ အပူဆုံးအချိန်တွင် အလုပ်ကြမ်း လျှော့လုပ်ပါ။",
    ],
    source: sources.who,
  },
  {
    id: "agriculture",
    name: ["Agriculture & livestock", "စိုက်ပျိုးရေးနှင့် မွေးမြူရေး"],
    summary: [
      "Match planting and irrigation decisions to local water conditions.",
      "စိုက်ပျိုးချိန်နှင့် ဆည်ရေပေးဝေမှုကို ဒေသရေရရှိနိုင်မှုနှင့် ချိန်ညှိပါ။",
    ],
    risks: [
      [
        "Dry spells and soil-moisture loss can stress crops, increase irrigation demand, and affect planting or harvests. Livestock may need more shade and water.",
        "မိုးပြတ်ခြင်းနှင့် မြေဆီလွှာအစိုဓာတ် လျော့ခြင်းကြောင့် သီးနှံထိခိုက်မှု၊ ဆည်ရေလိုအပ်မှုနှင့် စိုက်ပျိုးချိန် ပြောင်းလဲမှု ဖြစ်နိုင်သည်။ တိရစ္ဆာန်များအတွက် အရိပ်နှင့် ရေ လုံလောက်စွာ ထားပါ။",
      ],
    ],
    action: [
      "Inspect irrigation and feed supplies. Ask local agricultural advisers about crop timing and suitable varieties before changing plans.",
      "ရေပေးစနစ်နှင့် တိရစ္ဆာန်အစာကို စစ်ဆေးပါ။ အစီအစဉ်မပြောင်းမီ စိုက်ပျိုးချိန်နှင့် မျိုးရွေးချယ်မှုအတွက် ဒေသ စိုက်ပျိုးရေးပညာရှင်နှင့် တိုင်ပင်ပါ။",
    ],
    source: sources.fao,
  },
  {
    id: "water",
    name: ["Water resources", "ရေအရင်းအမြစ်"],
    summary: [
      "Protect drinking water and plan for interruptions.",
      "သောက်ရေကို ကာကွယ်ပြီး ရေပြတ်တောက်မှုအတွက် ပြင်ဆင်ပါ။",
    ],
    risks: [
      [
        "If rainfall deficits persist, rivers, reservoirs, and groundwater may come under pressure. Local water monitoring is needed to judge actual shortages.",
        "မိုးနည်းမှုကြာရှည်ပါက မြစ်၊ ရေလှောင်ကန်နှင့် မြေအောက်ရေ ထိခိုက်နိုင်သည်။ အမှန်တကယ် ရေရှားပါးမှုကို သိရန် ဒေသရေ အချက်အလက် လိုအပ်သည်။",
      ],
    ],
    action: [
      "Repair leaks, keep drinking-water containers clean and covered, and identify a safe alternative supply.",
      "ရေယိုစိမ့်မှု ပြုပြင်ပါ။ သောက်ရေဘူးနှင့် ကန်များကို သန့်ရှင်းစွာ အဖုံးအုပ်ထားပြီး အစားထိုး သောက်ရေရနိုင်မည့်နေရာ ရှာထားပါ။",
    ],
    source: sources.fao,
  },
  {
    id: "energy",
    name: ["Energy & essential services", "စွမ်းအင်နှင့် အခြေခံဝန်ဆောင်မှု"],
    summary: [
      "Plan cooling and essential needs during power interruptions.",
      "မီးပြတ်ချိန်တွင် အေးမြစွာနေနိုင်ရေးနှင့် အရေးကြီးလိုအပ်ချက်များကို စီစဉ်ပါ။",
    ],
    risks: [
      [
        "Heat increases cooling needs. Low inflows can constrain hydropower, but this app has no current reservoir or grid data and does not predict outages.",
        "ပူပြင်းချိန်တွင် အအေးပေးရန် လျှပ်စစ်လိုအပ်မှု တိုးနိုင်သည်။ ရေဝင်နည်းပါက ရေအားလျှပ်စစ် ထိခိုက်နိုင်သော်လည်း လက်ရှိ ရေလှောင်ကန်နှင့် ဓာတ်အားအချက်အလက် မရှိသဖြင့် မီးပြတ်မှုကို ဤစနစ်က မခန့်မှန်းပါ။",
      ],
    ],
    action: [
      "Charge essential devices when possible and identify a cool, accessible place that does not depend on your home’s power supply.",
      "အခွင့်ရချိန်တွင် အရေးကြီးကိရိယာများကို အားသွင်းထားပြီး အိမ်မီးအားကို မမှီခိုရသော အေးမြ၍ သွားလာလွယ်သောနေရာ စီစဉ်ပါ။",
    ],
    source: sources.who,
  },
];
export const checklists: {
  id: string;
  name: Copy;
  items: Copy[];
  source: string;
}[] = [
  {
    id: "household",
    name: ["Households", "အိမ်ထောင်စု"],
    items: [
      actions[0],
      actions[1],
      actions[2],
      [
        "Keep essential medicines, contact details, and a charged light accessible.",
        "လိုအပ်သောဆေးဝါး၊ ဆက်သွယ်ရန်နံပါတ်နှင့် အားသွင်းမီးအိမ်ကို လက်လှမ်းမီရာတွင် ထားပါ။",
      ],
    ],
    source: sources.who,
  },
  {
    id: "heat",
    name: ["Extreme heat", "အပူဒဏ်"],
    items: [
      [
        "Plan outdoor work for cooler hours with rest breaks.",
        "အေးသောအချိန်တွင် ပြင်ပအလုပ်လုပ်ရန်နှင့် အနားယူချိန်များ စီစဉ်ပါ။",
      ],
      [
        "Prepare loose clothing, shade, and safe drinking water.",
        "ပေါ့ပါးချောင်ချိသောအဝတ်၊ အရိပ်နှင့် သန့်ရှင်းသောသောက်ရေ ပြင်ဆင်ပါ။",
      ],
      [
        "Know heatstroke warning signs and how to reach medical help.",
        "အပူလျှပ်သတိပေးလက္ခဏာနှင့် ဆေးကုသမှု ရရှိနိုင်မည့်နည်းကို သိထားပါ။",
      ],
      [
        "Never leave children or animals inside a parked vehicle.",
        "ရပ်ထားသောယာဉ်အတွင်း ကလေးနှင့် တိရစ္ဆာန်များကို တစ်ဦးတည်း မထားပါနှင့်။",
      ],
    ],
    source: sources.who,
  },
  {
    id: "water",
    name: ["Water shortage", "ရေရှားပါးမှု"],
    items: [
      [
        "Clean and cover drinking-water containers.",
        "သောက်ရေထည့်ပုံးများကို သန့်ရှင်းစွာ အဖုံးအုပ်ထားပါ။",
      ],
      [
        "Find a safe alternative water source and check local supply notices.",
        "အစားထိုးသောက်ရေ ရနိုင်မည့်နေရာရှာပြီး ဒေသရေပေးဝေမှု ကြေညာချက်ကို စစ်ဆေးပါ။",
      ],
      [
        "Fix leaks and prioritise drinking, cooking, and hygiene.",
        "ရေယိုစိမ့်မှု ပြင်ပြီး သောက်သုံး၊ ချက်ပြုတ်နှင့် တစ်ကိုယ်ရေသန့်ရှင်းရေးကို ဦးစားပေးပါ။",
      ],
    ],
    source: sources.fao,
  },
  {
    id: "farmers",
    name: ["Farmers", "တောင်သူများ"],
    items: [
      [
        "Review local rainfall forecasts before sowing.",
        "မျိုးမကြဲမီ ဒေသမိုးရေခန့်မှန်းချက်ကို စစ်ဆေးပါ။",
      ],
      [
        "Inspect irrigation channels and available water.",
        "ဆည်မြောင်းနှင့် ရေရရှိနိုင်မှု စစ်ဆေးပါ။",
      ],
      [
        "Discuss crop choices and planting dates with a local adviser.",
        "သီးနှံရွေးချယ်မှုနှင့် စိုက်ချိန်ကို ဒေသပညာရှင်နှင့် တိုင်ပင်ပါ။",
      ],
      [
        "Keep a simple record of rainfall and crop stress.",
        "မိုးရွာသွန်းမှုနှင့် သီးနှံထိခိုက်မှုကို ရိုးရှင်းစွာ မှတ်တမ်းတင်ပါ။",
      ],
    ],
    source: sources.fao,
  },
  {
    id: "livestock",
    name: ["Livestock owners", "မွေးမြူသူများ"],
    items: [
      [
        "Provide shade and clean drinking water.",
        "အရိပ်နှင့် သန့်ရှင်းသောသောက်ရေ ပေးပါ။",
      ],
      [
        "Check stored feed and plan alternative supplies.",
        "သိုလှောင်အစာ စစ်ဆေးပြီး အစားထိုးအစာ စီစဉ်ပါ။",
      ],
      [
        "Watch for unusual breathing or weakness and contact a veterinary worker.",
        "အသက်ရှူမမှန်ခြင်း သို့မဟုတ် အားနည်းခြင်းကို စောင့်ကြည့်ပြီး တိရစ္ဆာန်ဆေးကုဝန်ထမ်းနှင့် ဆက်သွယ်ပါ။",
      ],
    ],
    source: sources.fao,
  },
  {
    id: "schools",
    name: ["Schools", "ကျောင်းများ"],
    items: [
      [
        "Arrange shade, drinking water, and regular breaks.",
        "အရိပ်၊ သောက်ရေနှင့် ပုံမှန်နားချိန် စီစဉ်ပါ။",
      ],
      [
        "Reschedule strenuous outdoor activities during very hot weather.",
        "အလွန်ပူချိန်တွင် အားစိုက်ရသော ပြင်ပလှုပ်ရှားမှုများကို အချိန်ပြောင်းပါ။",
      ],
      [
        "Keep caregiver contacts and a plan for a child who becomes unwell.",
        "အုပ်ထိန်းသူ ဆက်သွယ်ရန်နံပါတ်နှင့် ကလေးနေမကောင်းလျှင် ကူညီမည့်အစီအစဉ် ထားပါ။",
      ],
    ],
    source: sources.who,
  },
  {
    id: "workplaces",
    name: ["Workplaces", "လုပ်ငန်းခွင်"],
    items: [
      [
        "Agree on shaded breaks and access to water.",
        "အရိပ်ရနားချိန်နှင့် ရေရရှိနိုင်မှုကို စီစဉ်ပါ။",
      ],
      [
        "Use a buddy system to notice heat illness early.",
        "အပူဒဏ်လက္ခဏာ စောစီးစွာသိရန် လုပ်ဖော်ကိုင်ဖက်အချင်းချင်း စောင့်ကြည့်ပါ။",
      ],
      [
        "Plan lighter duties during the hottest hours.",
        "အပူဆုံးအချိန်တွင် ပေါ့ပါးသောအလုပ် လုပ်ရန် စီစဉ်ပါ။",
      ],
    ],
    source: sources.who,
  },
  {
    id: "community",
    name: ["Community groups", "ရပ်ရွာအဖွဲ့များ"],
    items: [
      [
        "Identify people who may need help reaching water or a cool place.",
        "ရေ သို့မဟုတ် အေးမြသောနေရာသို့ သွားရန် အကူအညီလိုသူများကို သိရှိထားပါ။",
      ],
      [
        "Share dated official bulletins with their source.",
        "နေ့စွဲနှင့် ရင်းမြစ်ပါသော တရားဝင်ကြေညာချက်များကို မျှဝေပါ။",
      ],
      [
        "Agree on a check-in plan that works during power or phone interruptions.",
        "မီးနှင့် ဖုန်းလိုင်းပြတ်ချိန်တွင်လည်း အချင်းချင်း ဆက်သွယ်ကူညီနိုင်မည့်အစီအစဉ် ထားပါ။",
      ],
    ],
    source: sources.who,
  },
];
export const lessons: { q: Copy; a: Copy; source: string }[] = [
  {
    q: ["What are El Niño and ENSO?", "အယ်လ်နီညိုနှင့် ENSO ဆိုတာ ဘာလဲ။"],
    a: [
      "ENSO is a natural pattern linking the tropical Pacific Ocean and atmosphere. El Niño is its warm phase, La Niña its cool phase, and neutral is the state between them.",
      "ENSO သည် အပူပိုင်း ပစိဖိတ်သမုဒ္ဒရာနှင့် လေထု ဆက်နွယ်ပြောင်းလဲသည့် သဘာဝဖြစ်စဉ်ဖြစ်သည်။ အယ်လ်နီညိုသည် ပူနွေးသောအဆင့်၊ လာနီညာသည် အေးသောအဆင့်ဖြစ်ပြီး ကြားအဆင့်ကို ပုံမှန်အဆင့်ဟု ခေါ်သည်။",
    ],
    source: sources.wmo,
  },
  {
    q: [
      "Why does the Pacific change?",
      "ပစိဖိတ်သမုဒ္ဒရာက ဘာကြောင့် ပြောင်းလဲသလဲ။",
    ],
    a: [
      "Normally, trade winds push warm surface water west. When they weaken, warm water spreads east and less cold water rises from below. Ocean and atmosphere changes reinforce each other.",
      "ပုံမှန်တွင် ကုန်သွယ်လေများက ပူနွေးသော မျက်နှာပြင်ရေကို အနောက်သို့ တွန်းပို့သည်။ လေအားနည်းလာလျှင် ရေနွေး အရှေ့သို့ပြန့်ကာ အောက်မှ ရေအေးတက်လာမှု လျော့သည်။ သမုဒ္ဒရာနှင့် လေထုပြောင်းလဲမှုများ အပြန်အလှန် အားဖြည့်ကြသည်။",
    ],
    source: sources.learn,
  },
  {
    q: ["What is the Walker circulation?", "Walker လေထုလည်ပတ်မှု ဆိုတာ ဘာလဲ။"],
    a: [
      "Air rises over warm tropical waters, moves east or west high in the atmosphere, sinks over cooler areas, and returns near the surface. El Niño shifts this circulation and its rainfall belts.",
      "အပူပိုင်းရေနွေးပြင်အထက်တွင် လေတက်၍ အမြင့်ပိုင်း၌ အရှေ့ သို့မဟုတ် အနောက်သို့ ရွေ့သည်။ ပိုအေးသောဒေသတွင် လေဆင်းပြီး မျက်နှာပြင်အနီးမှ ပြန်လည်စီးဆင်းသည်။ အယ်လ်နီညိုကြောင့် ဤလည်ပတ်မှုနှင့် မိုးရွာသည့်ဇုန်များ ပြောင်းလဲသည်။",
    ],
    source: sources.walker,
  },
  {
    q: [
      "How can it affect Myanmar?",
      "မြန်မာနိုင်ငံကို ဘယ်လို သက်ရောက်နိုင်သလဲ။",
    ],
    a: [
      "Changes in tropical heating alter atmospheric circulation far away. Parts of Southeast Asia can become hotter or drier, but Myanmar outcomes depend on the monsoon, Indian Ocean conditions, season, and location. ENSO alone is not a local forecast.",
      "အပူပိုင်းအပူဖြန့်ဝေမှု ပြောင်းလဲခြင်းက အဝေးဒေသ လေထုလည်ပတ်မှုကို သက်ရောက်သည်။ အရှေ့တောင်အာရှ အချို့ဒေသများ ပိုပူ၊ ပိုခြောက်နိုင်သော်လည်း မြန်မာနိုင်ငံတွင် မုတ်သုံလေ၊ အိန္ဒိယသမုဒ္ဒရာ၊ ရာသီနှင့် နေရာအပေါ် မူတည်သည်။ ENSO တစ်ခုတည်းသည် ဒေသခန့်မှန်းချက် မဟုတ်ပါ။",
    ],
    source: sources.fao,
  },
  {
    q: [
      "What comes next, and how often?",
      "နောက်ဘာဖြစ်မလဲ၊ ဘယ်လောက်ကြာတစ်ခါ ဖြစ်သလဲ။",
    ],
    a: [
      "ENSO events recur irregularly, roughly every 2–7 years. An El Niño can fade to neutral; La Niña may follow, but is not guaranteed. Follow new outlooks rather than a fixed calendar.",
      "ENSO သည် ပုံသေမဟုတ်ဘဲ အကြမ်းဖျင်း ၂ နှစ်မှ ၇ နှစ်အတွင်း တစ်ကြိမ် ဖြစ်တတ်သည်။ အယ်လ်နီညိုမှ ပုံမှန်အဆင့်သို့ ပြန်ရောက်နိုင်ပြီး လာနီညာ ဆက်ဖြစ်နိုင်သော်လည်း မသေချာပါ။ နောက်ဆုံးခန့်မှန်းချက်များကို စောင့်ကြည့်ပါ။",
    ],
    source: sources.learn,
  },
  {
    q: [
      "Is El Niño the same as climate change?",
      "အယ်လ်နီညိုနှင့် ရာသီဥတုပြောင်းလဲမှု တူသလား။",
    ],
    a: [
      "No. ENSO is natural variability. Long-term warming raises background temperatures and can compound heat impacts. It does not mean that climate change directly causes each El Niño or every local extreme.",
      "မတူပါ။ ENSO သည် သဘာဝအတက်အကျဖြစ်သည်။ ရေရှည်ကမ္ဘာပူနွေးမှုက နောက်ခံအပူချိန် မြှင့်တင်ပြီး အပူဒဏ်ကို ပိုဆိုးစေနိုင်သည်။ အယ်လ်နီညိုတစ်ကြိမ်စီ သို့မဟုတ် ပြင်းထန်ရာသီဥတုတိုင်းကို ရာသီဥတုပြောင်းလဲမှုက တိုက်ရိုက်ဖြစ်စေသည်ဟု မဆိုလိုပါ။",
    ],
    source: sources.wmo,
  },
];
