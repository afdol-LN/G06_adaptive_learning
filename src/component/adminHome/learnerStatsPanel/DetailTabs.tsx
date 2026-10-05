import { FaChartColumn, FaFileLines } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";

export type DetailTab = "detail" | "stats";

interface Props {
  tab: DetailTab;
  onChange: (tab: DetailTab) => void;
  ariaLabel: string;
}

/** แท็บ "รายละเอียด / สถิติ" มุมขวาบนของ modal รายละเอียด Exercise / Goal / Skill */
export function DetailTabs({ tab, onChange, ariaLabel }: Props) {
  const { t } = usePreferences();
  const item = (key: DetailTab, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === key}
      className={`ad-ev-tab${tab === key ? " is-active" : ""}`}
      onClick={() => onChange(key)}
    >
      {icon} {label}
    </button>
  );
  return (
    <div className="ad-ev-tabs" role="tablist" aria-label={ariaLabel}>
      {item("detail", <FaFileLines aria-hidden />, t("admin.exView.tabDetail"))}
      {item("stats", <FaChartColumn aria-hidden />, t("admin.exView.tabStats"))}
    </div>
  );
}
