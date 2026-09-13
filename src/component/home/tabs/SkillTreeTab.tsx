import React from "react";
import { SkillTreeSVG } from "../skillTree/SkillTreeSVG";
import { SkillSidePanel } from "../skillTree/SkillSidePanel";
import { LayoutSkill } from "../utils/skillTree";

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
    </div>
  );
};
export default SkillTreeTab;
