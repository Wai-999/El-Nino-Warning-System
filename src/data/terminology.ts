export const terminology = [
  [
    "Forecast",
    "ခန့်မှန်းချက်",
    "A model's estimate for a future period, not a station observation.",
    "အနာဂတ်ကာလအတွက် မော်ဒယ်ခန့်မှန်းတန်ဖိုးဖြစ်ပြီး စခန်းတိုင်းတာချက် မဟုတ်ပါ။",
  ],
  [
    "Reanalysis",
    "ပြန်လည်ဆန်းစစ်ဒေတာ",
    "Past weather reconstructed using observations and a weather model.",
    "တိုင်းတာချက်နှင့် မော်ဒယ်ပေါင်းစပ်၍ အတိတ်မိုးလေဝသကို ပြန်လည်ဆန်းစစ်ထားသောဒေတာ။",
  ],
  [
    "Anomaly",
    "ပုံမှန်နှင့် ကွာဟချက်",
    "The value minus a matching reference average; units and reference period matter.",
    "သင့်လျော်သော ပုံမှန်ပျမ်းမျှကို နုတ်ထားသည့်တန်ဖိုး။ ယူနစ်နှင့် ရည်ညွှန်းကာလကို တွဲကြည့်ပါ။",
  ],
  [
    "Probability",
    "ဖြစ်နိုင်ခြေ",
    "The chance of a defined event in a stated period; not its amount or a guarantee.",
    "သတ်မှတ်ဖြစ်စဉ်တစ်ခု သတ်မှတ်ကာလအတွင်း ဖြစ်နိုင်ခြေ။ ပမာဏ သို့မဟုတ် ကတိပြုချက် မဟုတ်ပါ။",
  ],
  [
    "Official warning",
    "တရားဝင် သတိပေးချက်",
    "A verified original notice from an authorized issuing agency, with its own severity and validity.",
    "တာဝန်ရှိဌာန၏ အတည်ပြုမူရင်းကြေညာချက်။ မူရင်းအဆင့်နှင့် သက်တမ်းကို ထိန်းထားသည်။",
  ],
  [
    "Screening estimate",
    "စစ်ဆေးခန့်မှန်းချက်",
    "An application rule applied to available evidence; not an official warning or calibrated impact prediction.",
    "ရရှိဒေတာကို အက်ပ်စည်းမျဉ်းဖြင့် စစ်ဆေးခြင်း။ တရားဝင်သတိပေးချက် သို့မဟုတ် အတည်ပြုထိခိုက်မှုခန့်မှန်းချက် မဟုတ်ပါ။",
  ],
  [
    "Unavailable",
    "ဒေတာ မရရှိ",
    "Evidence is missing or cannot be validated. It does not mean zero or safe.",
    "အထောက်အထားမရှိ သို့မဟုတ် အတည်မပြုနိုင်ခြင်း။ သုည သို့မဟုတ် ဘေးကင်းသည်ဟု မဆိုလိုပါ။",
  ],
  [
    "Parent-region fallback",
    "သက်ဆိုင်ရာ ပြည်နယ်/တိုင်းဒေတာ",
    "A coarser regional estimate shown for context when township data is absent.",
    "မြို့နယ်ဒေတာမရှိချိန် နောက်ခံအဖြစ် သက်ဆိုင်ရာပြည်နယ်/တိုင်း ခန့်မှန်းတန်ဖိုးကို ပြသည်။",
  ],
  [
    "PCode",
    "တည်နေရာကုဒ်",
    "A source administrative identifier. Include its level and dataset version when reviewing changes.",
    "ရင်းမြစ်၏ အုပ်ချုပ်ရေးတည်နေရာအမှတ်အသား။ ပြောင်းလဲမှုစစ်ဆေးရာတွင် အဆင့်နှင့် ဒေတာဗားရှင်းကို တွဲသုံးပါ။",
  ],
  [
    "ENSO / RONI",
    "ENSO / RONI",
    "Pacific climate conditions and a relative ocean-temperature index; not a local Myanmar warning.",
    "ပစိဖိတ်ရာသီဥတုအခြေအနေနှင့် နှိုင်းရပင်လယ်အပူချိန်ညွှန်းကိန်း။ မြန်မာဒေသသတိပေးချက် မဟုတ်ပါ။",
  ],
] as const;
