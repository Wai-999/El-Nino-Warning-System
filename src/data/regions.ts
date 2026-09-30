export const regions = [
  ["MM-01", "Sagaing", "စစ်ကိုင်းတိုင်းဒေသကြီး"],
  ["MM-02", "Bago", "ပဲခူးတိုင်းဒေသကြီး"],
  ["MM-03", "Magway", "မကွေးတိုင်းဒေသကြီး"],
  ["MM-04", "Mandalay", "မန္တလေးတိုင်းဒေသကြီး"],
  ["MM-05", "Tanintharyi", "တနင်္သာရီတိုင်းဒေသကြီး"],
  ["MM-06", "Yangon", "ရန်ကုန်တိုင်းဒေသကြီး"],
  ["MM-07", "Ayeyarwady", "ဧရာဝတီတိုင်းဒေသကြီး"],
  ["MM-11", "Kachin", "ကချင်ပြည်နယ်"],
  ["MM-12", "Kayah", "ကယားပြည်နယ်"],
  ["MM-13", "Kayin", "ကရင်ပြည်နယ်"],
  ["MM-14", "Chin", "ချင်းပြည်နယ်"],
  ["MM-15", "Mon", "မွန်ပြည်နယ်"],
  ["MM-16", "Rakhine", "ရခိုင်ပြည်နယ်"],
  ["MM-17", "Shan", "ရှမ်းပြည်နယ်"],
  ["MM-18", "Nay Pyi Taw", "နေပြည်တော် ပြည်ထောင်စုနယ်မြေ"],
] as const;
export const regionIds = regions.map((r) => r[0]);
export function regionName(id: string, lang: "en" | "my") {
  const r = regions.find((r) => r[0] === id);
  return r ? r[lang === "en" ? 1 : 2] : id;
}
