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
