import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { BranchSkill, BranchSkillTree } from "../../models/branchSkillModel";

// The endpoint used to return only the skill array — read that as a tree without a goal node
const toSkillTree = (payload: unknown): BranchSkillTree => {
  if (Array.isArray(payload)) return { skills: payload as BranchSkill[], goal: null };
  const tree = payload as Partial<BranchSkillTree> | null;
  return { skills: tree?.skills ?? [], goal: tree?.goal ?? null };
};

export class BranchSkillService {
  getBranchSkills = async (branchId: number): Promise<ApiResponse<BranchSkillTree>> => {
    try {
      const result = await AppClient.get(`/branch/${branchId}/skills`);
      // The backend returns RestAPIResponse which contains { isError, data, errorMassege }
      // The frontend axios interceptor AppClient unwraps it, or returns the raw JSON.
      // Let's handle both. If interceptor returns the unwrapped data, or the whole response:
      let payload: unknown = result;
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        payload = rawRes.data;
        errorMessage = rawRes.errorMassege || "";
      }

      return { isError, data: toSkillTree(payload), errorMessage };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch branch skills",
      };
    }
  };
}

export const branchSkillService = new BranchSkillService();
