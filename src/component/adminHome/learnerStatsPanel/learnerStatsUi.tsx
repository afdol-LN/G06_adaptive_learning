import { usePreferences } from "../../../context/PreferencesContext";

/** แถบความคืบหน้า + ตัวเลข % — เขียวเมื่อผ่าน 100% แล้ว */
export function ProgressCell({ percent, done }: { percent: number; done: boolean }) {
  return (
    <div className="ad-stats-rate">
      <div className="ad-stats-bar">
        <div
          className={`ad-stats-bar-fill ${done ? "is-ok" : "is-pick"}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <span className={`ad-stats-pct${done ? " is-ok" : ""}`}>{percent}%</span>
    </div>
  );
}

export function useFormatDate() {
  const { lang } = usePreferences();
  const locale = lang === "th" ? "th-TH" : "en-GB";
  return {
    date: (iso: string) =>
      new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }),
    dateTime: (iso: string) =>
      new Date(iso).toLocaleString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  };
}
