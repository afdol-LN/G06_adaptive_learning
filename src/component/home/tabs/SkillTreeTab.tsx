import React from "react";
import { SkillTreeSVG } from "../skillTree/SkillTreeSVG";
import { SkillSidePanel } from "../skillTree/SkillSidePanel";
import { GoalSidePanel } from "../skillTree/GoalSidePanel";
import { LayoutGoalNode, LayoutSkill } from "../utils/skillTree";

interface SkillTreeTabProps {
  treeSkills: LayoutSkill[];
  unlocked: Set<number>;
  canUnlockFn: (skillId: number) => boolean;
  onNodeClick: (skill: LayoutSkill) => void;
  selected: LayoutSkill | null;
  setSelected: (skill: LayoutSkill | null) => void;
  hovered: number | null;
  setHovered: (id: number | null) => void;
  onStartExercise: (skill: LayoutSkill) => void;
  goal: LayoutGoalNode | null;
  goalSelected: boolean;
  onGoalClick: () => void;
  setGoalSelected: (selected: boolean) => void;
}

export const SkillTreeTab: React.FC<SkillTreeTabProps> = ({
  treeSkills,
  unlocked,
  canUnlockFn,
  onNodeClick,
  selected,
  setSelected,
  hovered,
  setHovered,
  onStartExercise,
  goal,
  goalSelected,
  onGoalClick,
  setGoalSelected,
}) => {
  return (
    <div className="tab-skill-tree">
      <div className="tree-main" data-tour="tour-tree-canvas">
        <SkillTreeSVG
          skills={treeSkills}
          unlocked={unlocked}
          canUnlockFn={canUnlockFn}
          onNodeClick={onNodeClick}
          selected={selected}
          hovered={hovered}
          setHovered={setHovered}
          zoomable={true}
          goal={goal}
          goalSelected={goalSelected}
          onGoalClick={onGoalClick}
        />
      </div>
      <SkillSidePanel
        selected={selected}
        setSelected={setSelected}
        skills={treeSkills}
        unlocked={unlocked}
        canUnlockFn={canUnlockFn}
        onStartExercise={onStartExercise}
      />
      <GoalSidePanel
        goal={goal}
        open={goalSelected}
        onClose={() => setGoalSelected(false)}
        skills={treeSkills}
        unlocked={unlocked}
        canUnlockFn={canUnlockFn}
        onSelectSkill={setSelected}
      />
    </div>
  );
};
export default SkillTreeTab;
