export function getTierColor(tier?: string | null): string {
  return (
    {
      T1: "#10b981",
      T2: "#3b82f6",
      T3: "#8b5cf6",
      T4: "#f59e0b",
      T5: "#0047AB",
    }[tier || ""] || "#94a3b8"
  );
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
