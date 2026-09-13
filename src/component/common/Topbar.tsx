import React from "react";
import { FaMoon, FaSun } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import type { Lang } from "../../i18n";
import "../decorate/Topbar.css";

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "th", label: "TH" },
  { value: "en", label: "EN" },
];

interface TopbarProps {
  title: string;
}

// แถบบนที่ใช้ร่วมกันทุกหน้า (ยกเว้นหน้า login) — ชื่อหน้า + ปุ่มสลับภาษา + สวิตช์ธีม
// วางไว้ในคอลัมน์เนื้อหาข้าง sidebar ของแต่ละหน้า จึงไม่ทับ sidebar
export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const { lang, setLang, theme, toggleTheme, t } = usePreferences();
  const isDark = theme === "dark";

  return (
    <header className="tb-bar">
      <h1 className="tb-title">{title}</h1>

      <div className="tb-prefs" data-tour="tour-topbar-prefs">
        <div className="tb-lang" role="group" aria-label={t("topbar.language")}>
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              lang={opt.value}
              className={`tb-lang-opt ${lang === opt.value ? "active" : ""}`}
              aria-pressed={lang === opt.value}
              onClick={() => setLang(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={t("topbar.darkMode")}
          title={isDark ? t("topbar.toLight") : t("topbar.toDark")}
          className={`tb-theme ${isDark ? "on" : ""}`}
          onClick={toggleTheme}
        >
          <span className="tb-theme-track">
            <span className="tb-theme-thumb">
              {isDark ? <FaMoon aria-hidden /> : <FaSun aria-hidden />}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
};
export default Topbar;
