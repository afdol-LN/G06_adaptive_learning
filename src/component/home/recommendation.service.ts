import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { RecommendedSkill } from "../../models/recommendationModel";

export class RecommendationService {
  // ทักษะที่ backend แนะนำให้ฝึกต่อใน branch นี้ — null = ไม่มีอะไรแนะนำ (เช่น ครบทุกทักษะแล้ว)
  getRecommendation = async (branchId: number): Promise<ApiResponse<RecommendedSkill | null>> => {
    try {
      const result = await AppClient.get(`/branch/${branchId}/recommendation`);
      let data: RecommendedSkill | null = null;
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        data = (rawRes.data as RecommendedSkill | null) ?? null;
        errorMessage = rawRes.errorMassege || "";
      } else {
        data = (result as RecommendedSkill | null) ?? null;
      }

      return { isError, data, errorMessage };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch recommendation",
      };
    }
  };
}

export const recommendationService = new RecommendationService();
