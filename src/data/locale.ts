const myDigits = "၀၁၂၃၄၅၆၇၈၉";
export type NumeralSystem = "latn" | "mymr";
let numeralSystem: NumeralSystem = "latn";
export function configureNumerals(system: NumeralSystem) {
  numeralSystem = system;
}
export function localDigits(
  value: string,
  lang: string,
  system = numeralSystem,
) {
  const latin = value.replace(/[၀-၉]/g, (d) => String(myDigits.indexOf(d)));
  return lang === "my" && system === "mymr"
    ? latin.replace(/\d/g, (d) => myDigits[Number(d)])
    : latin;
}
const months = [
  "ဇန်နဝါရီ",
  "ဖေဖော်ဝါရီ",
  "မတ်",
  "ဧပြီ",
  "မေ",
  "ဇွန်",
  "ဇူလိုင်",
  "ဩဂုတ်",
  "စက်တင်ဘာ",
  "အောက်တိုဘာ",
  "နိုဝင်ဘာ",
  "ဒီဇင်ဘာ",
];
// Safari may lack a my-MM locale. Keep Myanmar dates/numerals consistent across engines.
export function localDate(value: string, lang: string, withTime = false) {
  const date = new Date(value);
  if (!Number.isFinite(+date)) return "—";
  if (lang !== "my")
    return (
      new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        ...(withTime ? { timeStyle: "short" as const } : {}),
        timeZone: "Asia/Yangon",
      }).format(date) + (withTime ? " MMT" : "")
    );
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Yangon",
  }).formatToParts(date);
  const get = (key: string) => parts.find((p) => p.type === key)!.value;
  return `${localDigits(get("year"), lang)} ${months[Number(get("month")) - 1]} ${localDigits(String(Number(get("day"))), lang)}${withTime ? `၊ ${localDigits(get("hour") + ":" + get("minute"), lang)} MMT` : ""}`;
}
