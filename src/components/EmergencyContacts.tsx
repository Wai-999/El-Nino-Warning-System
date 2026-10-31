import { useApp } from "../app/context";
import { Source } from "./Service";
export default function EmergencyContacts() {
  const { t } = useApp();
  return (
    <section className="surface padded emergency-contacts">
      <h2>
        {t("Verified contact information", "အတည်ပြု ဆက်သွယ်ရန် အချက်အလက်")}
      </h2>
      <p className="small muted">
        {t(
          "Sources checked 31 October 2026. Service availability and local coverage can change; no test calls were made.",
          "ရင်းမြစ်များကို 2026 အောက်တိုဘာ 31 တွင် စစ်ဆေးထားသည်။ ဝန်ဆောင်မှုနှင့် ဒေသလွှမ်းခြုံမှု ပြောင်းလဲနိုင်ပြီး စမ်းသပ်ဖုန်း မခေါ်ထားပါ။",
        )}
      </p>
      <dl className="facts">
        <div>
          <dt>
            {t("Myanmar Red Cross ambulance", "မြန်မာကြက်ခြေနီ လူနာတင်ယာဉ်")}
          </dt>
          <dd>
            <a href="tel:+959669958858">+95 9 669 958 858</a>
            <p>
              {t(
                "ICRC lists ambulance services in some locations; nationwide dispatch and availability are not verified.",
                "ICRC အရ နေရာအချို့တွင်သာ လူနာတင်ယာဉ်ဝန်ဆောင်မှု ရှိသည်။ တစ်နိုင်ငံလုံးပေးပို့နိုင်မှုနှင့် လက်ရှိရရှိမှုကို အတည်မပြုနိုင်ပါ။",
              )}
            </p>
            <a
              href="https://www.icrc.org/en/article/FAQ-icrc-work-myanmar"
              target="_blank"
              rel="noreferrer"
            >
              ICRC · {t("Original directory", "မူရင်းစာရင်း")} ↗
            </a>
          </dd>
        </div>
        <div>
          <dt>
            {t(
              "Red Cross emergency coordination",
              "ကြက်ခြေနီ အရေးပေါ်ညှိနှိုင်းရေး",
            )}
          </dt>
          <dd>
            <a href="tel:+959940078898">+95 9 940 078 898</a>
            <p>
              {t(
                "EOC coordination hotline, not an ambulance dispatch line. MRCS states 24/7 operation during emergency activation.",
                "EOC ညှိနှိုင်းရေးဖုန်းဖြစ်ပြီး လူနာတင်ယာဉ်ပို့ဆောင်ရေးဖုန်း မဟုတ်ပါ။ MRCS အရ အရေးပေါ်လုပ်ငန်းဖွင့်ချိန်တွင်သာ 24 နာရီ လည်ပတ်သည်။",
              )}
            </p>
            <a
              href="https://www.redcross.org.mm/our-work/emergency-operations-center/"
              target="_blank"
              rel="noreferrer"
            >
              MRCS · {t("Original contact page", "မူရင်းဆက်သွယ်ရန်စာမျက်နှာ")} ↗
            </a>
          </dd>
        </div>
      </dl>
      <Source id="emergency-contacts" />
    </section>
  );
}
