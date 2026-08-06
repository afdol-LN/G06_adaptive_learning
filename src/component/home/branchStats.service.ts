import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { BranchStats } from "../../models/branchStatsModel";

export class BranchStatsService {
  getBranchStats = async (branchId: number): Promise<ApiResponse<BranchStats>> => {
    try {
      const result = await AppClient.get(`/branch/${branchId}/stats`);
      let data: BranchStats | null = null;
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        data = rawRes.data as BranchStats;
        errorMessage = rawRes.errorMassege || "";
      } else {
        data = result as BranchStats;
      }

      return { isError, data, errorMessage };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch branch stats",
      };
    }
  };
}

export const branchStatsService = new BranchStatsService();
