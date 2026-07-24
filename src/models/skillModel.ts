import { ApiResponse } from "./apiResponse";

export interface SkillPrerequisiteInput {
  prerequisiteSkillId: number;
  prerequisiteLevel?: number;
}

export interface SkillPrerequisiteEntry {
  skillId: number;
  prerequisiteSkillId: number;
  prerequisiteLevel: number | null;
  prerequisiteSkill?: Skill;
}

export interface Skill {
  skillId: number;
  skillsName: string;
  tier: string | null;
  status: string;
  skillPrequisite?: SkillPrerequisiteEntry[];
}

export interface CreateSkillRequest {
  skillId: number;
  skillsName: string;
  tier?: string;
  status?: string;
}

export interface UpdateSkillRequest {
  skillsName?: string;
  tier?: string;
  status?: string;
}

export interface CreateSkillWithPrerequisiteRequest extends CreateSkillRequest {
  prerequisites: SkillPrerequisiteInput[];
}

export interface UpdateSkillWithPrerequisiteRequest extends UpdateSkillRequest {
  prerequisites?: SkillPrerequisiteInput[];
}

export type GetSkillsResponse = ApiResponse<Skill[]>;
export type GetSkillResponse = ApiResponse<Skill>;
