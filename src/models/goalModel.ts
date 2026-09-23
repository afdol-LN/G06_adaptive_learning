import { ApiResponse } from "./apiResponse";
import { Skill } from "./skillModel";

export interface GoalSkillRequireInput {
  skillId: number;
  levelRequire?: number;
}

export interface GoalSkillRequireEntry {
  goalId: number;
  skillId: number;
  levelRequire: number | null;
  skill?: Skill;
}

export interface Goal {
  id: number;
  goal: string;
  goalDescription?: string | null;
  status: string;
  goalSkillRequire?: GoalSkillRequireEntry[];
}

export interface CreateGoalRequest {
  goal: string;
  goalDescription?: string;
  status?: string;
}

export interface UpdateGoalRequest {
  goal?: string;
  goalDescription?: string;
  status?: string;
}

export interface CreateGoalWithSkillRequireRequest extends CreateGoalRequest {
  skillRequires: GoalSkillRequireInput[];
}

export interface UpdateGoalWithSkillRequireRequest extends UpdateGoalRequest {
  skillRequires?: GoalSkillRequireInput[];
}

export type GetGoalsResponse = ApiResponse<Goal[]>;
export type GetGoalResponse = ApiResponse<Goal>;

// ── Goal Workspace — ตรงกับ GoalWorkspaceDto / goalReadiness.ts ฝั่ง backend ──

export type SkillReadiness = "empty" | "partial" | "ready";

export type ReadinessRule =
  | "HAS_REQUIRED_SKILL"
  | "MIN_EXERCISES"
  | "LEVEL_COVERAGE"
  | "NO_PREREQ_CYCLE";

export interface ReadinessCheck {
  rule: ReadinessRule;
  passed: boolean;
  /** skill ที่ทำให้กฎนี้ไม่ผ่าน */
  skillIds: number[];
}

export interface ReadinessResult {
  ready: boolean;
  checks: ReadinessCheck[];
}

export interface WorkspaceSkill {
  skillId: number;
  skillCode: string;
  skillsName: string;
  tier: string | null;
  status: string;
  /** false = ถูกดึงเข้ามาเพราะเป็น prerequisite ของ required skill */
  required: boolean;
  levelRequire: number | null;
  prerequisiteSkillIds: number[];
  goalCount: number;
  activeExerciseCount: number;
  activeExerciseLevels: number[];
  pendingDraftCount: number;
  readiness: SkillReadiness;
}

export interface GoalWorkspace {
  goal: { id: number; goal: string; goalDescription: string | null; status: string };
  branchCount: number;
  minExercisesPerSkill: number;
  skills: WorkspaceSkill[];
  readiness: ReadinessResult;
}

export interface PublishGoalResult {
  activatedGoal: boolean;
  activatedSkillIds: number[];
}
