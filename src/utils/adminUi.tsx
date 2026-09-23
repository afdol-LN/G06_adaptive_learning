import {
  FaChartPie,
  FaUsers,
  FaBook,
  FaBullseye,
  FaPenToSquare,
  FaClipboardList,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import type { TKey } from "../i18n";

export interface TierInfo {
  code: string;
  label: string;
  color: string;
}

export const TIERS: TierInfo[] = [
  { code: "T1", label: "Basic", color: "#10b981" },
  { code: "T2", label: "Novice", color: "#3b82f6" },
  { code: "T3", label: "Intermediate", color: "#8b5cf6" },
  { code: "T4", label: "Advance", color: "#f59e0b" },
  { code: "T5", label: "Specialist", color: "#0047AB" },
];

export function getTierInfo(tier?: string | null): TierInfo | undefined {
  return TIERS.find((t) => t.code === tier);
}

export function getTierColor(tier?: string | null): string {
  return getTierInfo(tier)?.color || "#94a3b8";
}

export function getTierLabel(tier?: string | null): string {
  return getTierInfo(tier)?.label || tier || "-";
}

export function getScoreColor(score?: number): string {
  const s = score || 0;
  if (s >= 80) return "#10b981";
  if (s >= 60) return "#3b82f6";
  return "#f59e0b";
}

export function getStatusColor(status?: string): string {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "#10b981";
    case "pending":
      return "#f59e0b";
    case "inactive":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

// ข้อความของเกรดอยู่ใน i18n — component เรียก t(gradeKey(grade))
export function gradeKey(grade: string): TKey {
  return grade === "great" ? "admin.grade.great" : grade === "good" ? "admin.grade.good" : "admin.grade.low";
}

// สถานะ active/inactive ที่แสดงบนหน้าจอ — ค่าอื่นที่ไม่รู้จักแสดงตามที่ backend ส่งมา
export function statusKey(status?: string): TKey | null {
  if (status === "active") return "admin.status.active";
  if (status === "inactive") return "admin.status.inactive";
  return null;
}

export const TABS: { key: string; icon: React.ReactNode; labelKey: TKey }[] = [
  { key: "summary", icon: <FaChartPie />, labelKey: "admin.tab.summary" },
  { key: "users", icon: <FaUsers />, labelKey: "admin.tab.users" },
  { key: "skills", icon: <FaBook />, labelKey: "admin.tab.skills" },
  { key: "goals", icon: <FaBullseye />, labelKey: "admin.tab.goals" },
  { key: "exercises", icon: <FaPenToSquare />, labelKey: "admin.tab.exercises" },
  { key: "history", icon: <FaClipboardList />, labelKey: "admin.tab.history" },
  { key: "ai", icon: <FaWandMagicSparkles />, labelKey: "admin.tab.ai" },
];
