import { ApiResponse } from "./apiResponse";
import { ExerciseType, IsCaseSensitive } from "./exerciseModel";

export type AiDraftEntityType = "exercise" | "skill" | "goal";
export type AiDraftStatus = "pending" | "approved" | "rejected";

/** payload ของร่าง exercise — หน้าตาตรงกับ CreateExerciseDto ฝั่ง backend */
export interface ExerciseDraftPayload {
  description: string;
  skillId: number;
  skillLevel: number;
  type: ExerciseType;
  expectTime?: number;
  code?: string;
  language?: string;
  fillInBlank?: string;
  isCasesensitive?: IsCaseSensitive;
  choices?: { script: string; isAnswer: boolean }[];
}

/** payload ของร่าง skill — ตรงกับ CreateSkillWithPrerequisiteDto */
export interface SkillDraftPayload {
  skillCode: string;
  skillsName: string;
  tier?: string;
  prerequisites: { prerequisiteSkillId: number }[];
}

/** payload ของร่าง goal — ตรงกับ CreateGoalWithSkillRequireDto */
export interface GoalDraftPayload {
  goal: string;
  goalDescription?: string;
  skillRequires: { skillId: number; levelRequire?: number }[];
}

export type AiDraftPayload =
  | ExerciseDraftPayload
  | SkillDraftPayload
  | GoalDraftPayload;

export interface AiDraft {
  id: number;
  batchId: string;
  entityType: AiDraftEntityType;
  payload: AiDraftPayload;
  status: AiDraftStatus;
  prompt: string | null;
  generateParams: {
    skillId?: number;
    skillLevel?: number;
    exerciseType?: "CHOICE" | "FILL_IN_BLANK" | "MIXED";
  } | null;
  model: string | null;
  createdBy: number | null;
  approvedEntityId: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateDraftRequest {
  entityType: AiDraftEntityType;
  count: number;
  skillId?: number;
  skillLevel?: number;
  exerciseType?: "CHOICE" | "FILL_IN_BLANK" | "MIXED";
  instruction?: string;
}

export interface GenerateDraftResult {
  batchId: string;
  created: number;
  /** รายการที่ LLM สร้างมาแล้วไม่ผ่านการตรวจ — แสดงให้ admin เห็น ไม่ซ่อน */
  rejected: { reason: string }[];
}

export type GetDraftsResponse = ApiResponse<AiDraft[]>;
export type GetDraftResponse = ApiResponse<AiDraft>;
