// Admin stats tab of the Goal / Skill detail modals — mirrors adt-learning learnerStats.dto.ts.
// Every percentage is Progress (0-100, what students see), never raw P(L).

export interface GoalLearner {
  branchId: number;
  userId: number;
  name: string;
  username: string;
  startedAt: string;
  pretestDone: boolean;
  progressPercent: number;
  masteredCount: number;
  requiredCount: number;
  completedAt: string | null;
  lastActiveAt: string | null;
}

export interface GoalLearnerStats {
  goalId: number;
  goalName: string;
  requiredCount: number;
  totalLearners: number;
  completedCount: number;
  pretestDoneCount: number;
  avgProgress: number | null;
  learners: GoalLearner[];
}

export interface SkillLearner {
  branchId: number;
  userId: number;
  name: string;
  username: string;
  goalName: string;
  /** null = not started */
  progressPercent: number | null;
  attemptCount: number;
  mastered: boolean;
  answered: number;
  correct: number;
  lastActiveAt: string | null;
}

export interface SkillLearnerStats {
  skillId: number;
  skillName: string;
  totalLearners: number;
  masteredCount: number;
  avgProgress: number | null;
  totalAnswered: number;
  correctRate: number | null;
  learners: SkillLearner[];
}
