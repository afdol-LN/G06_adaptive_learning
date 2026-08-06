import { AppClient } from "../../../API/appRestApi";
import { ApiResponse } from "../../../models/apiResponse";
import {
  Skill,
  CreateSkillRequest,
  UpdateSkillRequest,
  CreateSkillWithPrerequisiteRequest,
  UpdateSkillWithPrerequisiteRequest,
} from "../../../models/skillModel";

export class SkillService {
  getAllSkills = async (): Promise<ApiResponse<Skill[]>> => {
    try {
      const result = await AppClient.get("/skill");
      return { isError: false, data: result as Skill[], errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch skills",
      };
    }
  };

  createSkill = async (data: CreateSkillRequest): Promise<ApiResponse<Skill>> => {
    try {
      const result = await AppClient.post("/skill", data);
      return { isError: false, data: result as Skill, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to create skill",
      };
    }
  };

  createSkillWithPrerequisite = async (
    data: CreateSkillWithPrerequisiteRequest,
  ): Promise<ApiResponse<Skill>> => {
    try {
      const result = await AppClient.post("/skill/with-prerequisite", data);
      return { isError: false, data: result as Skill, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to create skill",
      };
    }
  };

  updateSkill = async (
    skillId: number,
    data: UpdateSkillRequest,
  ): Promise<ApiResponse<Skill>> => {
    try {
      const result = await AppClient.put(`/skill/${skillId}`, data);
      return { isError: false, data: result as Skill, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to update skill",
      };
    }
  };

  updateSkillWithPrerequisite = async (
    skillId: number,
    data: UpdateSkillWithPrerequisiteRequest,
  ): Promise<ApiResponse<Skill>> => {
    try {
      const result = await AppClient.put(`/skill/${skillId}/with-prerequisite`, data);
      return { isError: false, data: result as Skill, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to update skill",
      };
    }
  };

  deleteSkill = async (skillId: number): Promise<ApiResponse<null>> => {
    try {
      await AppClient.delete(`/skill/${skillId}`);
      return { isError: false, data: null, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to delete skill",
      };
    }
  };
}

export const skillService = new SkillService();
