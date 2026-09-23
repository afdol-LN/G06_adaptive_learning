import { ApiResponse } from "../../../models/apiResponse";
import { AdminSummaryData } from "../../../models/summaryModel";

const EMPTY_SUMMARY_DATA: AdminSummaryData = {
  summary: {
    totalUsers: 0,
    activeToday: 0,
    totalSessions: 0,
    avgScore: 0,
    topSkill: "-",
    weekSessions: [0, 0, 0, 0, 0, 0, 0],
  },
  skillProgress: [],
  userActivity: [],
};

export class SummaryService {
  // Backend has no dashboard/summary endpoint yet; return empty state until one exists.
  getSummary = async (): Promise<ApiResponse<AdminSummaryData>> => {
    return { isError: false, data: EMPTY_SUMMARY_DATA, errorMessage: "" };
  };
}

export const summaryService = new SummaryService();
