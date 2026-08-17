import React, { useState, useEffect } from "react";
import { BranchSkill } from "../../../models/branchSkillModel";
import { BranchStats } from "../../../models/branchStatsModel";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { SkillTreeSVG } from "../skillTree/SkillTreeSVG";
import { SkillSidePanel } from "../skillTree/SkillSidePanel";
import { LayoutSkill, getProgressColor, displayProgressPercent } from "../utils/skillTree";
import { SessionCard } from "../../common/SessionCard";

interface HomeTabProps {
  userProfile: {
    fname?: string;
    lname?: string;
    gender?: string;
  } | null;
  activeBranch: {
    goalId?: number;
    goalName?: string;
    exp?: number;
  } | null;
  stats: BranchStats | null;
  skills: BranchSkill[];
  treeSkills: LayoutSkill[];
  unlocked: Set<number>;
  canUnlock: (skillId: number) => boolean;
  selected: LayoutSkill | null;
  setSelected: (skill: LayoutSkill | null) => void;
  hovered: number | null;
  setHovered: (id: number | null) => void;
  sessions: SessionHistoryItem[];
  onStartExercise: (skill: LayoutSkill) => void;
  setShowPicker: (show: boolean) => void;
  handleNodeClick: (skill: LayoutSkill) => void;
  switchTab: (tab: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  userProfile,
  activeBranch,
  stats,
  skills,
  treeSkills,
  unlocked,
  canUnlock,
  selected,
  setSelected,
  hovered,
  setHovered,
  sessions,
  onStartExercise,
  setShowPicker,
  handleNodeClick,
  switchTab,
}) => {
  const [twText, setTwText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const profileFullName = [userProfile?.fname, userProfile?.lname].filter(Boolean).join(" ");
  const fullName = profileFullName || localStorage.getItem("fullname") || "นักเรียน ALS";
  const avatar = userProfile?.gender === "FEMALE" ? "👩‍🎓" : "👨‍🎓";

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setTwText("");
    setShowCursor(true);
    const timer = setInterval(() => {
      setTwText(fullName.substring(0, i + 1));
      i++;
      if (i >= fullName.length) {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 1500);
      }
    }, 70);
    return () => clearInterval(timer);
  }, [fullName]);

  // Safe Stats mapping from backend API values
  const statsList = [
    { num: stats ? `${stats.skillsUnlockedCount}` : "0", label: "Skills Unlocked", cls: "gold" },
    { num: stats ? `${stats.sessionsCount}` : "0", label: "Sessions Done", cls: "green" },
    { num: stats ? `${stats.dayStreak}` : "0", label: "Day Streak", cls: "blue" },
    { num: stats ? `${stats.goalProgressPercent}%` : "0%", label: "Goal Progress", cls: "purple" },
  ];

  return (
    <div className="tab-home">
      <div className="tab-home-main">
        <div className="home-top">
          {/* Hero */}
          <div className="home-hero">
            <div className="home-hero-avatar">{avatar}</div>
            <div className="home-hero-info">
              <div className="home-greeting">ยินดีต้อนรับกลับ</div>
              <h1 className="home-username">
                {twText}
                {showCursor && <span className="cursor" />}
              </h1>
              <div className="home-goal">
                เป้าหมาย: <span className="goal-badge">{activeBranch?.goalName || "ยังไม่ระบุ"}</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="stats-grid" data-tour="tour-stats">
            {statsList.map((s, i) => (
              <div key={i} className={`stat-card ${s.cls}`}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress summary */}
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0369a1" }}>
              Progress โดยรวม
            </span>
            {skills
              .filter((s) => s.attemptCount > 0)
              .map((s) => {
                const positionedSkill = treeSkills.find((ts) => ts.skillId === s.skillId);
                return (
                  <div
                    key={s.skillId}
                    onClick={() => positionedSkill && handleNodeClick(positionedSkill)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    title={`Skill: ${s.skillsName}\nProgress: ${displayProgressPercent(s)}%`}
                  >
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                      {s.skillsName.length > 12 ? s.skillsName.substring(0, 10) + "…" : s.skillsName}
                    </span>
                    <div
                      style={{
                        width: "40px",
                        height: "6px",
                        background: "#e0f2fe",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${displayProgressPercent(s)}%`,
                          height: "100%",
                          background: getProgressColor(displayProgressPercent(s)),
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="section-label">Skill Tree — คลิกที่โหนดเพื่อดูรายละเอียด</div>
        </div>

        {/* Tree */}
        <div
          className="home-tree-wrap"
          data-tour="tour-skill-tree"
          style={{ height: "640px", overflow: "hidden", position: "relative" }}
        >
          <SkillTreeSVG
            skills={treeSkills}
            unlocked={unlocked}
            canUnlockFn={canUnlock}
            onNodeClick={handleNodeClick}
            selected={selected}
            hovered={hovered}
            setHovered={setHovered}
            zoomable={false}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              switchTab("SkillTree");
            }}
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              background: "#fff",
              border: "1px solid #c2d3e0",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              zIndex: 10,
            }}
            title="ขยายเต็มจอ"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0047AB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        </div>

        {/* Next exercise */}
        <div className="home-next-ex-bar">
          <button className="btn-next-exercise" onClick={() => setShowPicker(true)}>
            Next Exercise — เลือกเรื่องที่จะทำ
          </button>
        </div>

        {/* Recent sessions (last 5) */}
        <div className="home-sessions" data-tour="tour-sessions">
          <div className="section-label">📋 Session ล่าสุด</div>
          {sessions.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "24px" }}>
              ยังไม่มี session — เริ่มทำ Exercise ได้เลย!
            </p>
          ) : (
            <div className="session-list">
              {[...sessions]
                .reverse()
                .slice(0, 5)
                .map((s) => (
                  <SessionCard key={s.sessionId} session={s} />
                ))}
            </div>
          )}
        </div>
      </div>

      <SkillSidePanel
        selected={selected}
        setSelected={setSelected}
        skills={treeSkills}
        unlocked={unlocked}
        canUnlockFn={canUnlock}
        onStartExercise={onStartExercise}
      />
    </div>
  );
};
export default HomeTab;
