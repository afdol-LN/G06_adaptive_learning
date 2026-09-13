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

/** The goal node that ends every branch's skill tree. The backend derives it on every read and
 *  never stores it, so every branch has one (adt-learning/docs/adr/0005). Complete when every
 *  required skill is at Progress 100% — counted by the backend, the frontend only draws it. */
export interface GoalNode {
  goalId: number;
  goalName: string;
  /** an edge runs from each of these skills into the goal node */
  requiredSkillIds: number[];
  masteredCount: number;
  requiredCount: number;
  isComplete: boolean;
}

/** GET /branch/:branchId/skills */
export interface BranchSkillTree {
  skills: BranchSkill[];
  /** null when the goal requires no skills */
  goal: GoalNode | null;
}
