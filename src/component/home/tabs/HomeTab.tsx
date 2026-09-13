import React, { useState, useEffect } from "react";
import { FaClipboardList, FaUserGraduate } from "react-icons/fa6";
import { BranchSkill } from "../../../models/branchSkillModel";
import { BranchStats } from "../../../models/branchStatsModel";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { usePreferences } from "../../../context/PreferencesContext";
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
  switchTab: (tab: "Home" | "SkillTree" | "History" | "Profile") => void;
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
  const { t } = usePreferences();
  const [twText, setTwText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const profileFullName = [userProfile?.fname, userProfile?.lname].filter(Boolean).join(" ");
  const fullName = profileFullName || localStorage.getItem("fullname") || t("user.fallbackName");

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
    { num: stats ? `${stats.skillsUnlockedCount}` : "0", label: t("home.stat.skills"), cls: "gold" },
    { num: stats ? `${stats.sessionsCount}` : "0", label: t("home.stat.sessions"), cls: "green" },
    { num: stats ? `${stats.dayStreak}` : "0", label: t("home.stat.streak"), cls: "blue" },
    { num: stats ? `${stats.goalProgressPercent}%` : "0%", label: t("home.stat.progress"), cls: "purple" },
  ];

  return (
    <div className="tab-home">
      <div className="tab-home-main">
        <div className="home-top">
          {/* Hero */}
          <div className="home-hero">
            <div className="home-hero-avatar"><FaUserGraduate aria-hidden /></div>
            <div className="home-hero-info">
              <div className="home-greeting">{t("home.greeting")}</div>
              <h1 className="home-username">
                {twText}
                {showCursor && <span className="cursor" />}
              </h1>
              <div className="home-goal">
                {t("home.goal")} <span className="goal-badge">{activeBranch?.goalName || t("home.goalUnset")}</span>
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
          <div className="progress-summary">
            <span className="progress-summary-label">{t("home.progressSummary")}</span>
            {skills
              .filter((s) => s.attemptCount > 0)
              .map((s) => {
                const positionedSkill = treeSkills.find((ts) => ts.skillId === s.skillId);
                const pct = displayProgressPercent(s);
                return (
                  <div
                    key={s.skillId}
                    className="progress-summary-item"
                    onClick={() => positionedSkill && handleNodeClick(positionedSkill)}
                    title={t("home.progressTooltip", { name: s.skillsName, pct })}
                  >
                    <span className="progress-summary-name">
                      {s.skillsName.length > 12 ? s.skillsName.substring(0, 10) + "…" : s.skillsName}
                    </span>
                    <div className="progress-summary-track">
                      <div
                        className="progress-summary-fill"
                        style={{ width: `${pct}%`, background: getProgressColor(pct) }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="section-label">{t("home.treeLabel")}</div>
        </div>

        {/* Tree */}
        <div className="home-tree-wrap" data-tour="tour-skill-tree">
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
            className="tree-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              switchTab("SkillTree");
            }}
            title={t("home.expandTree")}
            aria-label={t("home.expandTree")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        </div>

        {/* Next exercise */}
        <div className="home-next-ex-bar">
          <button className="btn-next-exercise" onClick={() => setShowPicker(true)}>
            {t("home.nextExercise")}
          </button>
        </div>

        {/* Recent sessions (last 5) */}
        <div className="home-sessions" data-tour="tour-sessions">
          <div className="section-label section-label-icon">
            <FaClipboardList aria-hidden /> {t("home.recentSessions")}
          </div>
          {sessions.length === 0 ? (
            <p className="empty-note">{t("home.noSessions")}</p>
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
