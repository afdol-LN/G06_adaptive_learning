import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { BranchSkill } from "../../models/branchSkillModel";

export class BranchSkillService {
  getBranchSkills = async (branchId: number): Promise<ApiResponse<BranchSkill[]>> => {
    try {
      const result = await AppClient.get(`/branch/${branchId}/skills`);
      // The backend returns RestAPIResponse which contains { isError, data, errorMassege }
      // The frontend axios interceptor AppClient unwraps it, or returns the raw JSON.
      // Let's handle both. If interceptor returns the unwrapped data, or the whole response:
      let data: BranchSkill[] = [];
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        data = rawRes.data as BranchSkill[];
        errorMessage = rawRes.errorMassege || "";
      } else {
        data = result as BranchSkill[];
      }

      return { isError, data, errorMessage };
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
