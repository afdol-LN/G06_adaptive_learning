export interface SkillPrerequisite {
  skillId: number;
  prerequisiteSkillId: number;
  prerequisiteLevel: number;
}

/** What the student sees for a skill: the skill-tree node, the Exercise progress bar
 *  and the session popup all render this pair (adt-learning/docs/adr/0001).
 *  attemptCount 0 = "not started", otherwise progressPercent. Never show raw P(L). */
export interface SkillProgress {
  progressPercent: number;
  attemptCount: number;
}

export interface BranchSkill extends SkillProgress {
  skillId: number;
  skillCode: string;
  skillsName: string;
  tier: string;
  status: string;
  /** questions answered in this skill's unfinished session (its draft); 0 / missing = none (adt-learning/docs/adr/0003) */
  draftAnsweredCount?: number;
  skillPrequisite: SkillPrerequisite[];
}
