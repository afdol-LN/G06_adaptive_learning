import type { HTMLAttributes } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import type { Lang } from "../../i18n";
import "../decorate/Topbar.css";

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "th", label: "TH" },
  { value: "en", label: "EN" },
];

// ปุ่มสลับภาษา TH | EN + สวิตช์ธีม (role="switch") — ใช้ร่วมกันใน Topbar และหน้า login
// สไตล์ tb-* อยู่ใน Topbar.css และอ่านสีจาก token ของหน้าที่วางอยู่ (--border, --text, --accent …)
export default function PreferenceControls({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const { lang, setLang, theme, toggleTheme, t } = usePreferences();
  const isDark = theme === "dark";

  return (
    <div {...rest} className={className ? `tb-prefs ${className}` : "tb-prefs"}>
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
  );
}
