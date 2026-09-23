import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { SessionHistoryItem } from "../../models/sessionHistoryModel";

export class SessionHistoryService {
  getSessions = async (branchId: number): Promise<ApiResponse<SessionHistoryItem[]>> => {
    try {
      const result = await AppClient.get(`/history/branch/${branchId}/sessions`);
      let data: SessionHistoryItem[] = [];
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        data = rawRes.data as SessionHistoryItem[];
        errorMessage = rawRes.errorMassege || "";
      } else {
        data = result as SessionHistoryItem[];
      }

      return { isError, data, errorMessage };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch session history",
      };
    }
  };
}

export const sessionHistoryService = new SessionHistoryService();
