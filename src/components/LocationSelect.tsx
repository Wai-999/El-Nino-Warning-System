import { useApp } from "../app/context";
import { regions } from "../data/regions";
import { locationName } from "../risk/locations";
export function LocationSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const { t, lang } = useApp();
  return (
    <div className="location-select">
      <label htmlFor={id}>{t("Location", "တည်နေရာ")}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="MM">{locationName("MM", lang)}</option>
        {regions.map(([code]) => (
          <option key={code} value={code}>
            {locationName(code, lang)}
          </option>
        ))}
      </select>
      <small>
        {t(
          "National or State/Region coverage. Township evidence is not available.",
          "နိုင်ငံ သို့မဟုတ် တိုင်း/ပြည်နယ်အဆင့်။ မြို့နယ်အလိုက် ဒေတာ မရရှိပါ။",
        )}
      </small>
    </div>
  );
}
