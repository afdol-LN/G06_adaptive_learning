export interface SkillPrerequisite {
  skillId: number;
  prerequisiteSkillId: number;
  prerequisiteLevel: number;
}

export interface BranchSkill {
  skillId: number;
  skillCode: string;
  skillsName: string;
  tier: string;
  status: string;
  progressPercent: number;
  skillPrequisite: SkillPrerequisite[];
}
