import { ApiResponse } from "../../../models/apiResponse";
import { HistoryEntry } from "../../../models/historyModel";

export class HistoryService {
  // Backend has no exercise-history endpoint yet; return empty state until one exists.
  getAllHistory = async (): Promise<ApiResponse<HistoryEntry[]>> => {
    return { isError: false, data: [], errorMessage: "" };
  };
}

export const historyService = new HistoryService();
