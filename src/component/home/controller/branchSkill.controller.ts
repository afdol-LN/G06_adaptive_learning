import { useState, useEffect, useCallback } from "react";
import { BranchSkill } from "../../../models/branchSkillModel";
import { branchSkillService } from "../branchSkill.service";
import {
  layoutSkills,
  layoutGoalNode,
  computeUnlockedSkills,
  canUnlockSkill,
  LayoutSkill,
  LayoutGoalNode,
} from "../utils/skillTree";

export function useBranchSkillController(branchId: number | null) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [skills, setSkills] = useState<BranchSkill[]>([]);
  const [treeSkills, setTreeSkills] = useState<LayoutSkill[]>([]);
  const [unlockedSkills, setUnlockedSkills] = useState<Set<number>>(new Set());
  const [selectedSkill, setSelectedSkillState] = useState<LayoutSkill | null>(null);
  // goal node at the bottom of the tree (adt-learning/docs/adr/0005)
  const [goalNode, setGoalNode] = useState<LayoutGoalNode | null>(null);
  const [goalSelected, setGoalSelectedState] = useState<boolean>(false);

  // The side panel shows one thing at a time — a skill or the goal node — so picking one clears the other
  const setSelectedSkill = useCallback((skill: LayoutSkill | null) => {
    setSelectedSkillState(skill);
    if (skill) setGoalSelectedState(false);
  }, []);

  const setGoalSelected = useCallback((selected: boolean) => {
    setGoalSelectedState(selected);
    if (selected) setSelectedSkillState(null);
  }, []);

  const fetchSkills = useCallback(async () => {
    if (!branchId) {
      setSkills([]);
      setTreeSkills([]);
      setUnlockedSkills(new Set());
      setSelectedSkill(null);
      setGoalNode(null);
      setGoalSelectedState(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await branchSkillService.getBranchSkills(branchId);
    if (!res.isError && res.data) {
      const { skills: fetchedSkills, goal } = res.data;
      setSkills(fetchedSkills);

      // Perform Elo-free layout calculations
      const positioned = layoutSkills(fetchedSkills);
      setTreeSkills(positioned);

      const positionedGoal = layoutGoalNode(goal, positioned);
      setGoalNode(positionedGoal);
      if (!positionedGoal) setGoalSelectedState(false);

      // Calculate unlocked skill IDs
      const unlocked = computeUnlockedSkills(fetchedSkills);
      setUnlockedSkills(unlocked);

      // Maintain selection mapping if it exists
      if (selectedSkill) {
        const updatedSelected = positioned.find(
          (s) => s.skillId === selectedSkill.skillId
        );
        setSelectedSkill(updatedSelected || null);
      }
    }
    setIsLoading(false);
  }, [branchId, selectedSkill, setSelectedSkill]);

  useEffect(() => {
    // a goal selected in the previous branch must not open the next branch's goal panel
    setGoalSelectedState(false);
    fetchSkills();
  }, [branchId]);

  const canUnlock = useCallback(
    (skillId: number) => {
      return canUnlockSkill(skillId, skills, unlockedSkills);
    },
    [skills, unlockedSkills]
  );

  return {
    isLoading,
    skills,
    treeSkills,
    unlockedSkills,
    selectedSkill,
    setSelectedSkill,
    goalNode,
    goalSelected,
    setGoalSelected,
    canUnlock,
    refresh: fetchSkills,
  };
}

export type BranchSkillControllerType = ReturnType<typeof useBranchSkillController>;
