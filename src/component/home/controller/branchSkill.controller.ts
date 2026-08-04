import { useState, useEffect, useCallback } from "react";
import { BranchSkill } from "../../../models/branchSkillModel";
import { branchSkillService } from "../branchSkill.service";
import {
  layoutSkills,
  computeUnlockedSkills,
  canUnlockSkill,
  LayoutSkill,
} from "../utils/skillTree";

export function useBranchSkillController(branchId: number | null) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [skills, setSkills] = useState<BranchSkill[]>([]);
  const [treeSkills, setTreeSkills] = useState<LayoutSkill[]>([]);
  const [unlockedSkills, setUnlockedSkills] = useState<Set<number>>(new Set());
  const [selectedSkill, setSelectedSkill] = useState<LayoutSkill | null>(null);

  const fetchSkills = useCallback(async () => {
    if (!branchId) {
      setSkills([]);
      setTreeSkills([]);
      setUnlockedSkills(new Set());
      setSelectedSkill(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await branchSkillService.getBranchSkills(branchId);
    if (!res.isError && res.data) {
      const fetchedSkills = res.data;
      setSkills(fetchedSkills);

      // Perform Elo-free layout calculations
      const positioned = layoutSkills(fetchedSkills);
      setTreeSkills(positioned);

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
  }, [branchId, selectedSkill]);

  useEffect(() => {
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
    canUnlock,
    refresh: fetchSkills,
  };
}

export type BranchSkillControllerType = ReturnType<typeof useBranchSkillController>;
