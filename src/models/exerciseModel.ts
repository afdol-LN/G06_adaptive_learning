import { ApiResponse } from "./apiResponse";
import { Skill } from "./skillModel";

export type ExerciseType = "CHOICE" | "FILL_IN_BLANK";
export type ExerciseStatus = "active" | "inactive";
export type IsCaseSensitive = "YES" | "NO";

export interface ExerciseChoice {
  id: number;
  exerciseId: number;
  script: string;
  isAnswer: boolean;
}

export interface Exercise {
  id: number;
  description: string;
  level: number;
  status: ExerciseStatus;
  expectTime: number | null;
  skillId: number;
  skillLevel: number;
  type: ExerciseType;
  fillInBlank: string | null;
  isCasesensitive: IsCaseSensitive;
  code?: string | null;
  language?: string | null;
  skill?: Skill;
  exerciseChoices?: ExerciseChoice[];
}

export interface ExerciseChoiceInput {
  script: string;
  isAnswer: boolean;
}

export interface CreateExerciseRequest {
  description: string;
  skillId: number;
  skillLevel: number;
  type: ExerciseType;
  status?: ExerciseStatus;
  expectTime?: number;
  code?: string;
  language?: string;

  choices?: ExerciseChoiceInput[];
}

export interface UpdateExerciseRequest {
  description?: string;
  skillId?: number;
  skillLevel?: number;
  type?: ExerciseType;
  status?: ExerciseStatus;
  expectTime?: number;
  code?: string;
  language?: string;

  choices?: ExerciseChoiceInput[];
}

export type GetExercisesResponse = ApiResponse<Exercise[]>;
export type GetExerciseResponse = ApiResponse<Exercise>;
