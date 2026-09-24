import React from "react";
import { FaClipboardList, FaLock } from "react-icons/fa6";
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
import { HomeProfileStrip } from "../component/HomeProfileStrip";
import type { HomeTabKey } from "../controller/homeShell.controller";

interface HomeTabProps {
  fullName: string;
  profileStripCollapsed: boolean;
  onToggleProfileStrip: () => void;
  activeBranch: {
    goalId?: number;
    goalName?: string;
    exp?: number;
  } | null;
  stats: BranchStats | null;
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
  switchTab: (tab: HomeTabKey) => void;
  goal: LayoutGoalNode | null;
  goalSelected: boolean;
  onGoalClick: () => void;
  setGoalSelected: (selected: boolean) => void;
  /** เปิด modal ที่มาของคะแนนเริ่มต้นจาก pretest — ไม่ส่งมา = ยังไม่ได้ทำ pretest ไม่ต้องแสดงปุ่ม */
  onShowBreakdown?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  fullName,
  profileStripCollapsed,
  onToggleProfileStrip,
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

  return (
    <div className="tab-home">
      <div className="tab-home-main">
        <HomeProfileStrip
          fullName={fullName}
          goalName={activeBranch?.goalName}
          stats={stats}
          collapsed={profileStripCollapsed}
          onToggle={onToggleProfileStrip}
          onShowBreakdown={onShowBreakdown}
        />

        <div className="home-body">
          {/* Tree — หัวใจของหน้า อยู่กลางจอ ขนาดอ่านชัด scroll ดู (ไม่ zoom) */}
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
                  <span className="tree-legend-dot" style={{ background: getProgressColor(pct) }} />
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
              goal={goal}
              goalSelected={goalSelected}
              onGoalClick={onGoalClick}
            />
          </div>

          {/* Right rail */}
          <aside className="home-rail">
            <button className="btn-next-exercise" onClick={() => setShowPicker(true)}>
              {t("home.nextExercise")}
            </button>

            <div className="progress-summary">
              <div className="progress-summary-head">
                <span className="progress-summary-label">{t("home.progressSummary")}</span>
              </div>
              {/* สีเดียวกับโหนดใน skill tree (getNodeColors)
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

            {/* Recent sessions (last 3) */}
            <div className="home-sessions" data-tour="tour-sessions">
              <div className="home-rail-head">
                <span className="section-label section-label-icon">
                  <FaClipboardList aria-hidden /> {t("home.recentSessions")}
                </span>
                {sessions.length > 0 && (
                  <button type="button" className="home-see-all" onClick={() => switchTab("History")}>
                    {t("home.seeAll")}
                  </button>
                )}
              </div>
              {sessions.length === 0 ? (
                <p className="empty-note">{t("home.noSessions")}</p>
              ) : (
                <div className="session-list">
                  {[...sessions]
                    .reverse()
                    .slice(0, 3)
                    .map((s) => (
                      <SessionCard key={s.sessionId} session={s} />
                    ))}
                </div>
              )}
            </div>
          </aside>
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
