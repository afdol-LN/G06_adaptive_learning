import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  /** tone ของการ์ด เช่น "gold" | "green" | "blue" | "purple" */
  colorClass?: string;
  /** บรรทัดรองใต้ title เช่น "2/5 ทักษะ" */
  sub?: string;
}

// สีทั้งหมดมาจาก token ของ .stat-card ใน decorate/Home.css (มีค่าธีมมืดแล้ว)
// — ห้ามใส่ class สีตายตัว (เช่น Tailwind bg-white) กลับมา เพราะพังใน dark theme
export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = "", sub }) => (
  <div className={`stat-card ${colorClass}`.trim()}>
    {icon && <span className="stat-icon" aria-hidden>{icon}</span>}
    <div className="stat-num">{value}</div>
    <div className="stat-label">{title}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);
export default StatCard;
