import type { SectorId } from "../risk/impacts";
export type Bilingual = [string, string];
export const impactSources = {
  mechanism: {
    organization: "NOAA PMEL",
    title: "What is El Niño?",
    url: "https://www.pmel.noaa.gov/elnino/what-is-el-nino",
    publication: "1982–83 / 1997–98 examples; publication date not stated",
  },
  patterns: {
    organization: "NOAA CPC",
    title: "El Niño temperature and precipitation patterns",
    url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/elninosfc_body.html",
    publication: "Publication date and composite years not stated",
  },
  myanmar: {
    organization: "FAO",
    title:
      "Early Action and Response for Agriculture, Food Security and Nutrition",
    url: "https://www.fao.org/fileadmin/user_upload/emergencies/docs/FAOEl%20NinoReportMarch2016.pdf#page=38",
    publication: "March 2016 · Myanmar, printed p. 35 / PDF p. 38",
  },
  agriculture: {
    organization: "FAO",
    title: "El Niño",
    url: "https://www.fao.org/el-nino/en/",
    publication: "Living topic page; publication date varies",
  },
  heat: {
    organization: "WHO",
    title: "Heat and health",
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health",
    publication: "31 July 2026",
  },
  water: {
    organization: "WHO",
    title: "Drinking-water",
    url: "https://www.who.int/news-room/fact-sheets/detail/drinking-water",
    publication: "13 September 2023",
  },
  health: {
    organization: "WHO",
    title: "El Niño Southern Oscillation (ENSO)",
    url: "https://www.who.int/news-room/fact-sheets/detail/el-nino-southern-oscillation-(enso)",
    publication: "9 November 2023",
  },
  energy: {
    organization: "WMO",
    title: "Energy",
    url: "https://wmo.int/themes/energy",
    publication: "Publication date not stated",
  },
} as const;
export type ImpactSourceId = keyof typeof impactSources;
export const lastVerified = "2026-10-01";
export type ClimateImpact = {
  id: string;
  title: Bilingual;
  location: Bilingual;
  relationship: "historical-association" | "scenario";
  direction: "increase" | "decrease" | "mixed" | "uncertain";
  confidence: "unknown";
  evidenceSummary: Bilingual;
  period: Bilingual;
  limitation: Bilingual;
  sourceIds: ImpactSourceId[];
  lastVerified: string;
};
export const historicalImpacts: ClimateImpact[] = [
  {
    id: "myanmar-2015-16",
    title: [
      "Myanmar: a past event, not a template",
      "မြန်မာ — ယခင်ဖြစ်ရပ်ကို ယခုနှင့် တစ်ထပ်တည်း မယူဆရ",
    ],
    location: ["Myanmar", "မြန်မာနိုင်ငံ"],
    relationship: "historical-association",
    direction: "mixed",
    confidence: "unknown",
    evidenceSummary: [
      "FAO’s March 2016 review described drier conditions since November and water-shortage concerns, alongside recovery from the July–August 2015 floods. Wet and dry hazards occurred within the same El Niño period.",
      "FAO ၂၀၁၆ မတ်လ သုံးသပ်ချက်တွင် နိုဝင်ဘာမှစ၍ မိုးနည်းခြင်းနှင့် ရေရှားပါးနိုင်မှုကို ဖော်ပြထားပြီး ၂၀၁၅ ဇူလိုင်–ဩဂုတ် ရေကြီးမှုမှ ပြန်လည်ထူထောင်နေရဆဲ ဖြစ်သည်။ အယ်လ်နီညိုကာလတစ်ခုအတွင်း ရေကြီးမှုနှင့် ခြောက်သွေ့မှု နှစ်မျိုးစလုံး ရှိနိုင်သည်။",
    ],
    period: [
      "July 2015–March 2016 report context",
      "၂၀၁၅ ဇူလိုင်–၂၀၁၆ မတ်လ အစီရင်ခံစာ နောက်ခံ",
    ],
    limitation: [
      "One event review is not a long-term probability or proof that ENSO caused each flood or drought. No current township inference is made.",
      "ဖြစ်ရပ်တစ်ခု သုံးသပ်ချက်သည် ရေရှည်ဖြစ်နိုင်နှုန်း သို့မဟုတ် ရေကြီး၊ မိုးခေါင်တိုင်း၏ အကြောင်းရင်း ENSO ဖြစ်ကြောင်း သက်သေမဟုတ်ပါ။ လက်ရှိမြို့နယ်အဆင့်ကို မခန့်မှန်းပါ။",
    ],
    sourceIds: ["myanmar"],
    lastVerified,
  },
  {
    id: "global-patterns",
    title: [
      "Global and Asian patterns vary by season",
      "ကမ္ဘာနှင့် အာရှတွင် ရာသီအလိုက် သက်ရောက်မှု ကွာခြားသည်",
    ],
    location: [
      "Tropical Pacific and Southeast Asia; broad scale",
      "အပူပိုင်းပစိဖိတ်နှင့် အရှေ့တောင်အာရှ — ကျယ်ပြန့်သော နယ်ပယ်",
    ],
    relationship: "historical-association",
    direction: "mixed",
    confidence: "unknown",
    evidenceSummary: [
      "NOAA describes wetter conditions in the eastern equatorial Pacific, drier conditions in Indonesia and the Philippines, and a tendency toward warmer Southeast Asian temperatures in December–February during El Niño.",
      "NOAA အရ အယ်လ်နီညိုကာလတွင် အရှေ့အီကွေတာပစိဖိတ်၌ မိုးပိုခြင်း၊ အင်ဒိုနီးရှားနှင့် ဖိလစ်ပိုင်၌ မိုးနည်းခြင်း၊ ဒီဇင်ဘာ–ဖေဖော်ဝါရီ အရှေ့တောင်အာရှ၌ ပိုပူခြင်းတို့နှင့် ဆက်စပ်တတ်သည်။",
    ],
    period: [
      "Season-dependent historical summary; composite years not specified by source",
      "ရာသီအလိုက် သမိုင်းအကျဉ်းချုပ် — အသုံးပြုနှစ်များ ရင်းမြစ်တွင် မဖော်ပြ",
    ],
    limitation: [
      "These broad relationships are not a Myanmar seasonal forecast. Event strength, other climate drivers and local conditions matter.",
      "ကျယ်ပြန့်သော ဆက်နွယ်မှုဖြစ်ပြီး မြန်မာရာသီအလိုက် ခန့်မှန်းချက် မဟုတ်ပါ။ ဖြစ်ရပ်ပြင်းအား၊ အခြားရာသီဥတုအကြောင်းရင်းနှင့် ဒေသအခြေအနေတို့ ပါဝင်သည်။",
    ],
    sourceIds: ["patterns", "health"],
    lastVerified,
  },
];
export const sectorEvidence: Record<
  SectorId,
  {
    name: Bilingual;
    what: Bilingual;
    why: Bilingual;
    who: Bilingual;
    when: Bilingual;
    prepare: Bilingual;
    limitation: Bilingual;
    sources: ImpactSourceId[];
  }
> = {
  health: {
    name: ["Health", "ကျန်းမာရေး"],
    what: [
      "Heat illness and disruption to safe water are potential concerns.",
      "အပူဒဏ်ဖျားနာမှုနှင့် သန့်ရှင်းရေ ရရှိမှု ထိခိုက်နိုင်သည်။",
    ],
    why: [
      "Heat and humidity limit body cooling. Rain and water access can alter exposure to contamination or mosquito habitats; disease outcomes also depend on sanitation, health services and human behaviour.",
      "အပူနှင့် စိုထိုင်းမှုက ခန္ဓာကိုယ် အေးမြစေမှုကို တားဆီးနိုင်သည်။ မိုးရေနှင့် ရေရရှိမှုကြောင့် ညစ်ညမ်းမှုနှင့် ခြင်ပေါက်ဖွားရာ ပြောင်းလဲနိုင်သော်လည်း ရောဂါဖြစ်ပွားမှုတွင် သန့်ရှင်းရေး၊ ကျန်းမာရေးဝန်ဆောင်မှုနှင့် လူတို့အပြုအမူလည်း ပါဝင်သည်။",
    ],
    who: [
      "Older people, children, outdoor workers and people with limited access to cooling or safe water.",
      "သက်ကြီးရွယ်အို၊ ကလေး၊ ပြင်ပလုပ်သားနှင့် အေးမြရာ၊ သန့်ရှင်းရေ မလုံလောက်သူများ။",
    ],
    when: [
      "During heat or unsafe-water exposure; no disease forecast is available.",
      "အပူဒဏ် သို့မဟုတ် မသန့်ရှင်းရေနှင့် ထိတွေ့ချိန် — ရောဂါခန့်မှန်းချက် မရှိပါ။",
    ],
    prepare: [
      "Use cooler hours for strenuous work, rest in shade, drink safe water and check on vulnerable neighbours. Follow WHO heat and water guidance below.",
      "အားစိုက်ရသောအလုပ်ကို အေးချမ်းချိန် လုပ်၍ အရိပ်တွင်နားပါ၊ သန့်ရှင်းရေသောက်ပါ။ ထိခိုက်လွယ်သော အိမ်နီးချင်းများကို ဂရုစိုက်ပါ။ အောက်ပါ WHO လမ်းညွှန်ကို ဖတ်ပါ။",
    ],
    limitation: [
      "No disease surveillance or individual medical assessment is included.",
      "ရောဂါစောင့်ကြည့်ဒေတာနှင့် တစ်ဦးချင်း ဆေးဘက်ဆိုင်ရာ သုံးသပ်ချက် မပါပါ။",
    ],
    sources: ["heat", "water", "health"],
  },
  agriculture: {
    name: ["Agriculture", "စိုက်ပျိုးရေး"],
    what: [
      "Heat or too little or too much water can stress crops and field work; these signals do not establish crop loss.",
      "အပူ၊ ရေနည်းခြင်း သို့မဟုတ် ရေများခြင်းက သီးနှံနှင့် လယ်ယာလုပ်ငန်းကို ဖိအားပေးနိုင်သည်။ သီးနှံဆုံးရှုံးမှုကို ဤညွှန်းကိန်းက မအတည်ပြုပါ။",
    ],
    why: [
      "Climate signal → crop exposure and growth stage → water availability → possible heat or water stress.",
      "ရာသီဥတုအခြေအနေ → သီးနှံထိတွေ့မှုနှင့် ကြီးထွားအဆင့် → ရေရရှိမှု → ဖြစ်နိုင်သော အပူနှင့် ရေဖိအား။",
    ],
    who: [
      "Farmers and livestock keepers where local crops, soils and water supplies are exposed.",
      "ဒေသသီးနှံ၊ မြေနှင့် ရေရရှိမှု ထိခိုက်နိုင်သော လယ်သမားနှင့် မွေးမြူသူများ။",
    ],
    when: [
      "Depends on planting, flowering and harvest timing; local crop calendars are not connected.",
      "စိုက်ချိန်၊ ပန်းပွင့်ချိန်၊ ရိတ်သိမ်းချိန်ပေါ် မူတည်သည်။ ဒေသသီးနှံပြက္ခဒိန် မချိတ်ဆက်ထားပါ။",
    ],
    prepare: [
      "Inspect soil moisture and drainage; seek local crop-stage advice before changing planting or irrigation.",
      "မြေအစိုဓာတ်နှင့် ရေစီးဆင်းမှု စစ်ဆေးပါ။ စိုက်ချိန်နှင့် ရေပေးမှု မပြောင်းမီ ဒေသပညာရှင်အကြံဉာဏ် ရယူပါ။",
    ],
    limitation: [
      "No validated crop model, crop-area exposure or yield-loss percentage is available.",
      "အတည်ပြု သီးနှံမော်ဒယ်၊ စိုက်ဧရိယာ ထိတွေ့မှုနှင့် အထွက်နှုန်းဆုံးရှုံးမှု ရာခိုင်နှုန်း မရှိပါ။",
    ],
    sources: ["agriculture", "myanmar"],
  },
  water: {
    name: ["Water", "ရေ"],
    what: [
      "Rainfall deficits may pressure supplies; heavy rain may compromise exposed water sources.",
      "မိုးနည်းခြင်းက ရေရရှိမှုကို ဖိအားပေးနိုင်ပြီး မိုးသည်းထန်ခြင်းက ရေအရင်းအမြစ်ကို ထိခိုက်နိုင်သည်။",
    ],
    why: [
      "Rain affects replenishment, runoff and contamination pathways. Storage, treatment and demand determine local supply outcomes.",
      "မိုးရေသည် ရေပြန်ဖြည့်မှု၊ ရေစီးနှင့် ညစ်ညမ်းမှုပျံ့နှံ့မှုအပေါ် သက်ရောက်သည်။ သိုလှောင်မှု၊ သန့်စင်မှုနှင့် သုံးစွဲမှုက ဒေသရေရရှိမှုကို ဆုံးဖြတ်သည်။",
    ],
    who: [
      "Households and services relying on vulnerable wells, surface water or limited storage.",
      "ထိခိုက်လွယ်သော ရေတွင်း၊ မျက်နှာပြင်ရေနှင့် ရေလှောင်မှုနည်းသော အိမ်ထောင်စုနှင့် ဝန်ဆောင်မှုများ။",
    ],
    when: [
      "During heavy rain or persistent shortages; the 30-day rain proxy is delayed evidence.",
      "မိုးသည်းထန်ချိန် သို့မဟုတ် ရေကြာရှည်ရှားချိန် — ရက် ၃၀ မိုးရေညွှန်းကိန်းသည် နောက်ကျရရှိသော ဒေတာဖြစ်သည်။",
    ],
    prepare: [
      "Check actual storage, protect drinking-water sources and confirm safe treatment with local water providers.",
      "ရေလက်ကျန်ကို စစ်ဆေး၍ သောက်သုံးရေအရင်းအမြစ်ကို ကာကွယ်ပါ။ ဘေးကင်းသော ရေသန့်စင်နည်းကို ဒေသရေပေးသူနှင့် အတည်ပြုပါ။",
    ],
    limitation: [
      "River levels, reservoirs, groundwater and water quality are not measured here. Rainfall is not flood probability.",
      "မြစ်ရေ၊ ဆည်ရေ၊ မြေအောက်ရေနှင့် ရေအရည်အသွေးကို ဤနေရာတွင် မတိုင်းတာပါ။ မိုးရေပမာဏသည် ရေကြီးဖြစ်နိုင်နှုန်း မဟုတ်ပါ။",
    ],
    sources: ["water", "myanmar"],
  },
  energy: {
    name: ["Energy", "စွမ်းအင်"],
    what: [
      "Heat can raise cooling demand; limited water and strong winds can stress energy services.",
      "အပူကြောင့် အအေးပေးလိုအပ်ချက်တိုးနိုင်ပြီး ရေနည်းခြင်းနှင့် လေပြင်းက စွမ်းအင်ဝန်ဆောင်မှုကို ဖိအားပေးနိုင်သည်။",
    ],
    why: [
      "Hydropower depends on water availability; exposed equipment and networks can be affected by severe weather.",
      "ရေအားလျှပ်စစ်သည် ရေရရှိမှုပေါ် မူတည်သည်။ ပြင်ပပစ္စည်းနှင့် ကွန်ရက်များကို ပြင်းထန်မိုးလေဝသက ထိခိုက်နိုင်သည်။",
    ],
    who: [
      "Electricity users and operators with exposed equipment or water-dependent generation.",
      "ပြင်ပပစ္စည်း သို့မဟုတ် ရေအခြေခံထုတ်လုပ်မှုကို မှီခိုသော လျှပ်စစ်သုံးသူနှင့် လုပ်ငန်းရှင်များ။",
    ],
    when: [
      "During high cooling demand, prolonged supply pressure or strong winds.",
      "အအေးပေးလိုအပ်ချက်များချိန်၊ ရေရရှိမှု ကြာရှည်ဖိအားရှိချိန် သို့မဟုတ် လေပြင်းချိန်။",
    ],
    prepare: [
      "Check provider notices and household backup plans; keep away from damaged power lines.",
      "ပံ့ပိုးသူအသိပေးချက်နှင့် အိမ်သုံးအရန်အစီအစဉ်ကို စစ်ဆေးပါ။ ပျက်စီးဓာတ်ကြိုးများမှ ဝေးဝေးနေပါ။",
    ],
    limitation: [
      "No outage or generation forecast is available. Reservoir inflows and grid operations are not connected.",
      "မီးပြတ်မှုနှင့် ထုတ်လုပ်ပမာဏ ခန့်မှန်းချက် မရှိပါ။ ဆည်ရေဝင်နှင့် ဓာတ်အားကွန်ရက်ဒေတာ မချိတ်ဆက်ထားပါ။",
    ],
    sources: ["energy"],
  },
};
