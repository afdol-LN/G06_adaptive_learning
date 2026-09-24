import React, { useState, useEffect } from "react";
import { FaChartSimple, FaClipboardList, FaLock, FaUserGraduate } from "react-icons/fa6";
import { BranchSkill } from "../../../models/branchSkillModel";
import { BranchStats } from "../../../models/branchStatsModel";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { usePreferences } from "../../../context/PreferencesContext";
import { SkillTreeSVG } from "../skillTree/SkillTreeSVG";
import { SkillSidePanel } from "../skillTree/SkillSidePanel";
import { GoalSidePanel } from "../skillTree/GoalSidePanel";
import {
  LayoutGoalNode,
  LayoutSkill,
  getProgressColor,
  getNodeColors,
  displayProgressPercent,
  formatProgressLabel,
} from "../utils/skillTree";
import { SessionCard } from "../../common/SessionCard";
import { StatCard } from "../../common/StatCard";

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
  goal: LayoutGoalNode | null;
  goalSelected: boolean;
  onGoalClick: () => void;
  setGoalSelected: (selected: boolean) => void;
  /** เปิด modal ที่มาของคะแนนเริ่มต้นจาก pretest — ไม่ส่งมา = ยังไม่ได้ทำ pretest ไม่ต้องแสดงปุ่ม */
  onShowBreakdown?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  userProfile,
  activeBranch,
  stats,
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
  goal,
  goalSelected,
  onGoalClick,
  setGoalSelected,
  onShowBreakdown,
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
    {
      num: stats ? `${stats.goalProgressPercent}%` : "0%",
      label: t("home.stat.progress"),
      cls: "purple",
      // the same numbers as the goal node at the end of the tree (adt-learning/docs/adr/0005)
      sub:
        !stats || stats.goalRequiredCount === 0
          ? undefined
          : stats.goalComplete
            ? t("goalNode.complete")
            : t("goalNode.count", { done: stats.goalMasteredCount, total: stats.goalRequiredCount }),
    },
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
            {statsList.map((s) => (
              <StatCard key={s.label} title={s.label} value={s.num} colorClass={s.cls} sub={s.sub} />
            ))}
          </div>

          {/* Progress summary */}
          <div className="progress-summary">
            <div className="progress-summary-head">
              <span className="progress-summary-label">{t("home.progressSummary")}</span>
              {onShowBreakdown && (
                <button type="button" className="progress-summary-breakdown" onClick={onShowBreakdown}>
                  <FaChartSimple aria-hidden />
                  <span>{t("pretestBreakdown.reopen")}</span>
                </button>
              )}
            </div>
            {/* ทุก skill ใน tree เป็น block เรียงต่อกัน — สีเดียวกับโหนดใน skill tree (getNodeColors)
                ครบ 100% เขียว · ปลดล็อกแล้ว น้ำเงิน · ปลดล็อกได้ ฟ้า · ล็อก เทา */}
            <div className="progress-summary-list">
              {treeSkills.map((s) => {
                const pct = displayProgressPercent(s);
                const isUnlocked = unlocked.has(s.skillId);
                const isLocked = !isUnlocked && !canUnlock(s.skillId);
                const { bg, border, text, bar } = getNodeColors(isUnlocked, !isLocked, pct);
                return (
                  <button
                    type="button"
                    key={s.skillId}
                    className={`progress-summary-item${isLocked ? " locked" : ""}`}
                    // ล็อก: พื้น/ขอบเทาจาก tree แต่ตัวอักษรใช้ --muted (ผ่าน CSS) — --node-locked-text จางเกินสำหรับข้อความ 12px
                    style={{ background: bg, borderColor: border, color: isLocked ? undefined : text }}
                    onClick={() => handleNodeClick(s)}
                    title={t("home.progressTooltip", { name: s.skillsName, pct })}
                  >
                    <span className="progress-summary-row">
                      <span className="progress-summary-name">{s.skillsName}</span>
                      <span className="progress-summary-pct">
                        {isLocked ? <FaLock aria-label={t("skill.locked")} /> : formatProgressLabel(s, t("skill.notStarted"))}
                      </span>
                    </span>
                    <span className="progress-summary-track" style={{ background: bar }}>
                      <span
                        className="progress-summary-fill"
                        style={{ width: `${pct}%`, background: getProgressColor(pct) }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="section-label section-label-tree">{t("home.treeLabel")}</div>
        </div>

        {/* Tree */}
        <div className="home-tree-wrap" data-tour="tour-skill-tree">
          {/* Legend — มุมขวาบน อธิบายสี progress bar */}
          <div className="tree-legend">
            {[
              { pct: 10,  label: "1–19%" },
              { pct: 50,  label: "20–74%" },
              { pct: 90,  label: "75–99%" },
              { pct: 100, label: "100%" },
            ].map(({ pct, label }) => (
              <div key={pct} className="tree-legend-row">
                <span
                  className="tree-legend-dot"
                  style={{ background: getProgressColor(pct) }}
                />
                <span className="tree-legend-label">{label}</span>
              </div>
            ))}
          </div>

          <SkillTreeSVG
            skills={treeSkills}
            unlocked={unlocked}
            canUnlockFn={canUnlock}
            onNodeClick={handleNodeClick}
            selected={selected}
            hovered={hovered}
            setHovered={setHovered}
            zoomable={false}
            goal={goal}
            goalSelected={goalSelected}
            onGoalClick={onGoalClick}
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
      <GoalSidePanel
        goal={goal}
        open={goalSelected}
        onClose={() => setGoalSelected(false)}
        skills={treeSkills}
        unlocked={unlocked}
        canUnlockFn={canUnlock}
        onSelectSkill={setSelected}
      />
    </div>
  );
};
export default HomeTab;
