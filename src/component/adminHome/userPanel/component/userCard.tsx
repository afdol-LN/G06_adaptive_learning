import { UserResponseAdmin } from "../../../../models/userModel";

interface UserCardProps {
  user: UserResponseAdmin;
  getStatusColor: (status: string) => string;
  getScoreColor?: (score?: number) => string;
  onViewUser?: (user: UserResponseAdmin) => void;
  onToggleStatus?: (user: UserResponseAdmin) => void;
  onDeleteUser?: (user: UserResponseAdmin) => void;
}

export default function UserCard({
  user,
  getStatusColor,
  getScoreColor = (s = 0) => (s >= 80 ? "#10b981" : s >= 60 ? "#3b82f6" : "#f59e0b"),
  onViewUser = () => {},
  onToggleStatus = () => {},
}: UserCardProps) {
  const name = user.fullName || "ไม่ระบุชื่อ";
  const firstLetter = name[0] || "?";
  const campus = user.campusName || "";
  const faculty = user.facultyName || "";
  const major = user.majorName || "";
  const status = user.status || "inactive";

  const sessions = user.sessionCount ?? 0;
  const streak = user.dayStreak ?? user.dayStreak ?? 0;
  const score = user.correctPercent ?? user.correctPercent ?? 0;

  // ดึง goals และแปลงให้อยู่ในรูป Array ไม่ว่าจะมาจาก string คั่นด้วย '-' หรือเป็น Array อยู่แล้ว
  const goalsList: string[] = Array.isArray(user.goals)
    ? user.goals
    : typeof user.goals === "string" && user.goals !== "-" && user.goals.trim() !== ""
    ? user.goals.split("-").map((g: string) => g.trim()).filter(Boolean)
    : [];

  return (
    <div className="ad-user-card">
      <div className="ad-user-card-top">
        <div className="ad-avatar-md">{firstLetter}</div>
        <div className="ad-user-card-info">
          <div className="ad-user-card-name">{name}</div>
          {campus && <div className="ad-user-card-email">🏫 {campus}</div>}
          <span
            className="ad-status-badge"
            style={{
              background: status === "active" ? "#ecfdf5" : "#f1f5f9",
              color: getStatusColor(status),
              border: `1px solid ${getStatusColor(status)}40`,
            }}
          >
            {status === "active" ? "🟢 Active" : "⚫ Inactive"}
          </span>
        </div>
      </div>

      <div className="ad-user-card-meta">
        <div>
        {faculty} {major ? `- ${major}` : ""}
        </div>
        <div style={{ marginTop: "6px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
            เป้าหมายการเรียน:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {goalsList.length > 0 ? (
              goalsList.map((g, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 500,
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {g}
                </span>
              ))
            ) : (
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>- ไม่ได้ระบุ -</span>
            )}
          </div>
        </div>
      </div>

      <div className="ad-user-card-stats">
        <div className="ad-stat-mini">
          <div className="ad-stat-mini-val">{sessions}</div>
          <div className="ad-stat-mini-lbl">Sessions</div>
        </div>
        <div className="ad-stat-mini">
          <div
            className="ad-stat-mini-val"
            style={{ color: getScoreColor(score) }}
          >
            {score}%
          </div>
          <div className="ad-stat-mini-lbl">Correct %</div>
        </div>
        <div className="ad-stat-mini">
          <div className="ad-stat-mini-val">🔥{streak}</div>
          <div className="ad-stat-mini-lbl">Streak</div>
        </div>
      </div>

      <div className="ad-user-card-actions">
        <button
          className="ad-btn-sm ad-btn-view"
          onClick={() => onViewUser(user)}
        >
          👁 ดูข้อมูล
        </button>
        <button
          className="ad-btn-sm ad-btn-toggle"
          onClick={() => onToggleStatus(user)}
        >
          {status === "active" ? "🔴 ระงับ" : "🟢 เปิดใช้"}
        </button>
      </div>
    </div>
  );
}