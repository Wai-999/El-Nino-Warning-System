import { useState } from "react";
import { useApp, dateLabel } from "../app/context";
import { learningVideos, videoReviewedAt } from "../data/videos";
import "../styles/learning.css";
function VideoCard({ video: v }: { video: (typeof learningVideos)[number] }) {
  const { t, lang, lowData } = useApp();
  const [show, setShow] = useState(false),
    [failed, setFailed] = useState(false);
  return (
    <article className="panel video-card">
      <div className="video-thumbnail">
        {show && !lowData && !failed ? (
          <img
            src={v.thumbnail}
            alt={v.title}
            width="480"
            height="360"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        ) : (
          <div>
            <span aria-hidden="true">▶</span>
            <p>
              {t(
                "BBC News မြန်မာ · video thumbnail",
                "BBC News မြန်မာ · ဗီဒီယိုပုံ",
              )}
            </p>
            {!lowData && !failed ? (
              <button onClick={() => setShow(true)}>
                {t(
                  "Load thumbnail from YouTube",
                  "YouTube မှ ဗီဒီယိုပုံ ရယူရန်",
                )}
              </button>
            ) : (
              <p>
                {failed
                  ? t(
                      "Thumbnail unavailable. The video link remains below.",
                      "ဗီဒီယိုပုံ မရရှိပါ။ အောက်ပါလင့်ခ်ကို သုံးနိုင်သည်။",
                    )
                  : t(
                      "Low data: external images paused",
                      "ဒေတာချွေတာ — ပြင်ပပုံများ ရပ်ထားသည်",
                    )}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="padded">
        <p className="evidence-label">
          {t("VERIFIED NEWS ORGANIZATION", "အတည်ပြု သတင်းဌာန")}
        </p>
        <h3 lang="my">{v.title}</h3>
        <p>
          <a href={v.channel} target="_blank" rel="noopener noreferrer">
            {v.publisher}
          </a>{" "}
          · {dateLabel(v.published, lang)} · {Math.floor(v.seconds / 60)}:
          {String(v.seconds % 60).padStart(2, "0")}
        </p>
        <p className="video-tags">{t(...v.tags)}</p>
        <p>
          <strong>
            {t("Why we included it", "ထည့်သွင်းထားရသည့် အကြောင်းရင်း")}:{" "}
          </strong>
          {t(...v.why)}
        </p>
        <a
          className="button primary"
          href={v.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Watch on YouTube", "YouTube တွင် ကြည့်ရန်")} ↗
        </a>
      </div>
    </article>
  );
}
export function VideoLibrary() {
  const { t, lang } = useApp();
  return (
    <section className="video-library">
      <h2>{t("WATCH & LEARN — MYANMAR", "ကြည့်ရှုလေ့လာရန် — မြန်မာ")}</h2>
      <p>
        {t(
          "Dated news explainers, not primary evidence for warnings, measurements or medical guidance. No autoplay or embedded player. Opening YouTube uses external data.",
          "ရက်စွဲပါ သတင်းရှင်းလင်းချက်များဖြစ်ပြီး သတိပေး၊ တိုင်းတာချက်၊ ဆေးဘက်လမ်းညွှန်၏ မူလအထောက်အထား မဟုတ်ပါ။ အလိုအလျောက်မဖွင့်ပါ။ YouTube ဖွင့်လျှင် ပြင်ပဒေတာ သုံးမည်။",
        )}
      </p>
      <div className="video-grid">
        {learningVideos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
      <details className="panel padded">
        <summary>
          {t("Selection and verification", "ရွေးချယ်မှုနှင့် စစ်ဆေးမှု")}
        </summary>
        <p>
          {t(
            "Publisher identity, publication dates, duration, URLs and descriptions checked against the BBC YouTube channel, oEmbed and player metadata. Scientific framing was checked against NOAA/WMO. Full transcripts were unavailable; this is not a line-by-line scientific endorsement.",
            "ထုတ်ဝေသူ၊ ရက်စွဲ၊ ကြာချိန်၊ လင့်ခ်နှင့် ဖော်ပြချက်ကို BBC YouTube ချန်နယ်၊ oEmbed၊ player metadata နှင့် စစ်ထားသည်။ သိပ္ပံနောက်ခံကို NOAA/WMO နှင့် နှိုင်းထားသည်။ စာသားအပြည့် မရရှိ၍ စာကြောင်းတိုင်း သိပ္ပံအတည်ပြုခြင်း မဟုတ်ပါ။",
          )}
        </p>
        <p>
          {t("Reviewed", "ပြန်စစ်")}: {dateLabel(videoReviewedAt, lang)}
        </p>
      </details>
    </section>
  );
}
