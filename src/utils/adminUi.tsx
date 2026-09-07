import {
  FaChartPie,
  FaUsers,
  FaBook,
  FaBullseye,
  FaPenToSquare,
  FaClipboardList,
  FaWandMagicSparkles,
} from "react-icons/fa6";

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

export function gradeLabel(grade: string): string {
  return grade === "great" ? "ดีเยี่ยม" : grade === "good" ? "ดี" : "ต้องปรับปรุง";
}

export const TABS = [
  { key: "summary", icon: <FaChartPie />, label: "สรุปภาพรวม" },
  { key: "users", icon: <FaUsers />, label: "ผู้ใช้งาน" },
  { key: "skills", icon: <FaBook />, label: "จัดการ Skill" },
  { key: "goals", icon: <FaBullseye />, label: "จัดการ Goal" },
  { key: "exercises", icon: <FaPenToSquare />, label: "จัดการ Exercise" },
  { key: "history", icon: <FaClipboardList />, label: "ประวัติโจทย์" },
  { key: "ai", icon: <FaWandMagicSparkles />, label: "AI ผู้ช่วย" },
];

