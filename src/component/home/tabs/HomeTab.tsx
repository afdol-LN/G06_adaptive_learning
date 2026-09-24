import React from "react";
import { BranchStats } from "../../../models/branchStatsModel";
import { SkillTreeSVG } from "../skillTree/SkillTreeSVG";
import { SkillSidePanel } from "../skillTree/SkillSidePanel";
import { GoalSidePanel } from "../skillTree/GoalSidePanel";
import { LayoutGoalNode, LayoutSkill, getProgressColor } from "../utils/skillTree";
import { HomeProfileStrip } from "../component/HomeProfileStrip";
import { HomeProgressPanel } from "../component/HomeProgressPanel";
import { HomeGoalBar } from "../component/HomeGoalBar";

interface HomeTabProps {
  fullName: string;
  profileStripCollapsed: boolean;
  onToggleProfileStrip: () => void;
  progressPanelCollapsed: boolean;
  onToggleProgressPanel: () => void;
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
  onStartExercise: (skill: LayoutSkill) => void;
  setShowPicker: (show: boolean) => void;
  handleNodeClick: (skill: LayoutSkill) => void;
  goal: LayoutGoalNode | null;
  goalSelected: boolean;
  onGoalClick: () => void;
  setGoalSelected: (selected: boolean) => void;
  /** เปิด modal ที่มาของคะแนนเริ่มต้นจาก pretest — ไม่ส่งมา = ยังไม่ได้ทำ pretest ไม่ต้องแสดงปุ่ม */
  onShowBreakdown?: () => void;
  recommendedSkillId: number | null;
}

const LEGEND = [
  { pct: 10, label: "1–19%" },
  { pct: 50, label: "20–74%" },
  { pct: 90, label: "75–99%" },
  { pct: 100, label: "100%" },
];

// Home = skill tree เต็มพื้นที่ ส่วนอื่น (strip, legend, ความคืบหน้า, ปุ่มแบบฝึกหัด) ลอยทับ
export const HomeTab: React.FC<HomeTabProps> = ({
  fullName,
  profileStripCollapsed,
  onToggleProfileStrip,
  progressPanelCollapsed,
  onToggleProgressPanel,
  activeBranch,
  stats,
  treeSkills,
  unlocked,
  canUnlock,
  selected,
  setSelected,
  hovered,
  setHovered,
  onStartExercise,
  setShowPicker,
  handleNodeClick,
  goal,
  goalSelected,
  onGoalClick,
  setGoalSelected,
  onShowBreakdown,
  recommendedSkillId,
}) => {
  return (
    <div className="tab-home">
      <div className="home-canvas" data-tour="tour-skill-tree">
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
          recommendedSkillId={recommendedSkillId}
          onRecommendedClick={onStartExercise}
        />

        <div className="home-overlay-top">
          <HomeProfileStrip
            fullName={fullName}
            goalName={activeBranch?.goalName}
            stats={stats}
            collapsed={profileStripCollapsed}
            onToggle={onToggleProfileStrip}
            onShowBreakdown={onShowBreakdown}
          />
        </div>

        <HomeGoalBar goalName={activeBranch?.goalName} onNextExercise={() => setShowPicker(true)} />

        <HomeProgressPanel
          skills={treeSkills}
          unlocked={unlocked}
          canUnlock={canUnlock}
          collapsed={progressPanelCollapsed}
          onToggle={onToggleProgressPanel}
          onSkillClick={handleNodeClick}
        />

        {/* Legend — อธิบายสี progress bar — มุมล่างขวา (เดิมอยู่ใน .home-overlay-top) */}
        <div className="tree-legend home-legend">
          {LEGEND.map(({ pct, label }) => (
            <div key={pct} className="tree-legend-row">
              <span className="tree-legend-dot" style={{ background: getProgressColor(pct) }} />
              <span className="tree-legend-label">{label}</span>
            </div>
          ))}
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
