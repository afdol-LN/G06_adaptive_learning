import { AppClient } from "../../../API/appRestApi";
import { ApiResponse } from "../../../models/apiResponse";
import {
  ExerciseStatDetail,
  ExerciseStatSummary,
} from "../../../models/exerciseStatsModel";

export class ExerciseStatsService {
  /** per-question stats, hardest first (the server sorts) */
  getList = async (
    skillId: number | null,
    includePretest: boolean,
  ): Promise<ApiResponse<ExerciseStatSummary[]>> => {
    try {
      const params: Record<string, string> = {
        includePretest: String(includePretest),
      };
      if (skillId !== null) params.skillId = String(skillId);
      // AppClient.get's 2nd argument IS the query params
      const res = await AppClient.get("/admin/exercise-stats", params);
      return res as ApiResponse<ExerciseStatSummary[]>;
    } catch (error: any) {
      return { isError: true, data: null, errorMessage: error.message };
    }
  };

  getDetail = async (
    exerciseId: number,
    includePretest: boolean,
  ): Promise<ApiResponse<ExerciseStatDetail>> => {
    try {
      const res = await AppClient.get(`/admin/exercise-stats/${exerciseId}`, {
        includePretest: String(includePretest),
      });
      return res as ApiResponse<ExerciseStatDetail>;
    } catch (error: any) {
      return { isError: true, data: null, errorMessage: error.message };
    }
  };
}

export const exerciseStatsService = new ExerciseStatsService();
