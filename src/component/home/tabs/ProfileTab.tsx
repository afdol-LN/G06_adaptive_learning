import React from "react";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { computeBehavior, BEHAVIOR_META, DIM_LABELS } from "../utils/behavior";
import { FaClock, FaBullseye, FaBolt } from "react-icons/fa6";

const DIM_ICONS = {
  time: <FaClock />,
  streak: <FaBullseye />,
  momentum: <FaBolt />,
};

interface ProfileTabProps {
  unlocked: Set<number>;
  sessions: SessionHistoryItem[];
  userProfile: {
    fname?: string;
    lname?: string;
    gender?: string;
    dob?: string;
    username?: string;
  } | null;
  activeBranch: {
    goalName?: string;
    campus?: string;
    faculty?: string;
    major?: string;
    year?: string | number;
  } | null;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  unlocked,
  sessions,
  userProfile,
  activeBranch,
}) => {
  const behavior = computeBehavior(sessions);
  const meta = BEHAVIOR_META[behavior.cls];

  const profileFullName = [userProfile?.fname, userProfile?.lname].filter(Boolean).join(" ");
  const fullName = profileFullName || localStorage.getItem("fullname") || "นักเรียน ALS";
  const avatar = userProfile?.gender === "FEMALE" ? "👩‍🎓" : "👨‍🎓";

  return (
    <div className="tab-profile">
      <div className="profile-container">
        <div className="profile-hero">
          <div className="profile-avatar-lg">{avatar}</div>
          <div className="profile-info-main">
            <div className="profile-name">{fullName}</div>
            <div className="profile-goal">
              เป้าหมาย: {activeBranch?.goalName || "ยังไม่ได้ตั้งเป้าหมาย"}
            </div>
          </div>
          <div className="profile-skill-count">
            <div className="profile-skill-count-label">Skills ปลดล็อก</div>
            <div className="profile-skill-count-num">{unlocked.size}</div>
          </div>
        </div>

        <div className="behavior-card" style={{ background: meta.bg, borderColor: meta.border }}>
          <div className="behavior-class-header">
            <div className="behavior-class-badge" style={{ background: meta.color }}>
              <span className="bcb-label">{meta.label} Learner</span>
            </div>
            <div
              className="behavior-score-wrap"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
            >
              <div
                className="behavior-score-ring"
                style={{ border: `3px solid ${meta.color}`, borderRadius: "50%", padding: "8px 12px" }}
              >
                <span className="behavior-score-num" style={{ color: meta.color, fontWeight: "800" }}>
                  {behavior.score}
                </span>
                <span className="behavior-score-sub">/ 100</span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: "600", color: meta.color }}>
                คะแนนพฤติกรรม
              </span>
            </div>
          </div>
          <p className="behavior-desc" style={{ color: meta.color }}>
            {meta.desc}
          </p>
          <div className="behavior-dims">
            <div
              className="behavior-dim-row"
              style={{ padding: "8px 0", borderBottom: "1px solid #e2e8f0", marginBottom: "8px" }}
            >
              <span className="bdim-icon" style={{ fontSize: "16px", display: "flex", alignItems: "center", color: "#64748b" }}>
                <FaClock />
              </span>
              <span className="bdim-label" style={{ fontWeight: "600", color: "#334155" }}>
                เวลาทำโจทย์เฉลี่ย
              </span>
              <span className="bdim-val" style={{ marginLeft: "auto", fontWeight: "800", color: meta.color }}>
                {behavior.avgTime} วินาที / ข้อ
              </span>
            </div>
            {Object.entries(behavior.dims).map(([key, val]) => {
              const dm = DIM_LABELS[key as keyof typeof DIM_LABELS];
              const icon = DIM_ICONS[key as keyof typeof DIM_ICONS];
              return (
                <div key={key} className="behavior-dim-row">
                  <span className="bdim-icon" style={{ display: "flex", alignItems: "center", color: meta.color }}>{icon}</span>
                  <span className="bdim-label">{dm.label}</span>
                  <div className="bdim-track">
                    <div className="bdim-fill" style={{ width: `${val}%`, background: meta.color }} />
                    <div className="bdim-marker" style={{ left: "50%" }} />
                    <div className="bdim-marker" style={{ left: "70%" }} />
                  </div>
                  <span className="bdim-val" style={{ color: meta.color }}>
                    {val}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="behavior-class-legend">
            {Object.entries(BEHAVIOR_META).map(([k, m]) => (
              <span
                key={k}
                className={`bcl-item ${behavior.cls === k ? "active" : ""}`}
                style={
                  behavior.cls === k
                    ? { background: m.color, color: "#fff", borderColor: m.color }
                    : {}
                }
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-card-title">ข้อมูลส่วนตัว</div>
            {[
              { label: "ชื่อ-นามสกุล", value: fullName },
              { label: "คณะ", value: activeBranch?.faculty || "—" },
              { label: "สาขา", value: activeBranch?.major || "—" },
              { label: "ชั้นปี", value: activeBranch?.year || "—" },
              { label: "วิทยาเขต", value: activeBranch?.campus || "—" },
              { label: "เป้าหมายการเรียน", value: activeBranch?.goalName || "—" },
            ].map((row, i) => (
              <div key={i} className="profile-row">
                <span className="profile-row-label">{row.label}</span>
                <span className="profile-row-val">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileTab;
