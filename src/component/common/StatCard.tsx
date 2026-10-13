import React from "react";
import { usePreferences } from "../../context/PreferencesContext";
import type { Translate } from "../../i18n";

// แปลงวินาที → ข้อความ เช่น 3725 → "1 ชม. 2 นาที 5 วินาที" (หน่วยที่เป็น 0 ไม่แสดง ยกเว้นวินาที)
export function formatSeconds(totalSeconds: number, t: Translate): string {
  const hour = Math.floor(totalSeconds / 3600);
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = Math.floor(totalSeconds % 60);

  let text = "";
  if (hour > 0) text += t("time.hour", { n: hour }) + " ";
  if (minute > 0) text += t("time.minute", { n: minute }) + " ";
  text += t("time.second", { n: second });
  return text;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  /** tone ของการ์ด เช่น "gold" | "green" | "blue" | "purple" */
  colorClass?: string;
  /** บรรทัดรองใต้ title เช่น "2/5 ทักษะ" */
  sub?: string;
  /** value เป็นจำนวนวินาที — แสดงเป็น ชม. / นาที / วินาที */
  isTime?: boolean;
}

// สีทั้งหมดมาจาก token ของ .stat-card ใน decorate/Home.css (มีค่าธีมมืดแล้ว)
// — ห้ามใส่ class สีตายตัว (เช่น Tailwind bg-white) กลับมา เพราะพังใน dark theme
export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = "", sub, isTime = false }) => {
  const { t } = usePreferences();

  const seconds = Number(value);
  const showValue = isTime && seconds > 0 ? formatSeconds(seconds, t) : value;

  return (
    <div className={`stat-card ${colorClass}`.trim()}>
      {icon && <span className="stat-icon" aria-hidden>{icon}</span>}
      <div className="stat-num">{showValue}</div>
      <div className="stat-label">{title}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
};
export default StatCard;
