import type { Bilingual } from "./impactEvidence";
import { DAY, type DataState } from "./operational";
export const surveillance = {
  title: "Myanmar Health Cluster Bulletin — August 2026",
  publisher: "WHO / Myanmar Health Cluster · United Nations Myanmar",
  url: "https://myanmar.un.org/en/321949-myanmar-health-cluster-bulletin-august-2026",
  period: "2026-08",
  issuedAt: "2026-08-31T00:00:00Z",
  reviewedAt: "2026-10-04T18:00:00Z",
  reports: [
    {
      id: "awd",
      regions: ["MM-06", "MM-16", "MM-15", "MM-07", "MM-01", "MM-04", "MM-02"],
      text: [
        "The bulletin reports cholera/acute watery diarrhoea in Yangon, Sittwe, Mon and Ayeyarwady, and acute watery diarrhoea in Shwebo, Mandalay and Bago. Sittwe and Shwebo are specific localities, not evidence for every township in their State/Region.",
        "စာတမ်းတွင် ရန်ကုန်၊ စစ်တွေ၊ မွန်၊ ဧရာဝတီတို့၌ ကာလဝမ်း/ရေဝမ်းလျှော၊ ရွှေဘို၊ မန္တလေးနှင့် ပဲခူး၌ ရေဝမ်းလျှောမှု ဖော်ပြထားသည်။ စစ်တွေ၊ ရွှေဘိုသည် သီးခြားဒေသများဖြစ်၍ ပြည်နယ်/တိုင်းရှိ မြို့နယ်အားလုံးအတွက် အထောက်အထား မဟုတ်ပါ။",
      ] as Bilingual,
    },
    {
      id: "vector",
      regions: ["MM-12", "MM-05", "MM-11", "MM-14", "MM-01"],
      text: [
        "The bulletin describes increasing malaria and dengue in endemic areas including Kayah (Karenni), Tanintharyi, Kachin, Chin and Sagaing. It does not provide a complete comparable regional case series.",
        "စာတမ်းတွင် ကယား (ကရင်နီ)၊ တနင်္သာရီ၊ ကချင်၊ ချင်းနှင့် စစ်ကိုင်း အပါအဝင် ရောဂါဖြစ်ပွားလေ့ရှိရာဒေသများ၌ ငှက်ဖျား၊ ဒင်ဂီ တိုးလာမှု ဖော်ပြထားသည်။ ဒေသအလိုက် နှိုင်းယှဉ်နိုင်သော လူနာဒေတာစုံ မပါပါ။",
      ] as Bilingual,
    },
  ],
};
export function surveillanceState(now: number): DataState {
  const age = now - Date.parse(surveillance.issuedAt);
  return age < 0
    ? "unavailable"
    : age > 60 * DAY
      ? "stale"
      : age > 30 * DAY
        ? "aging"
        : "current";
}
export function reportsForLocation(id: string) {
  return surveillance.reports.filter(
    (r) => id === "MM" || r.regions.includes(id),
  );
}
