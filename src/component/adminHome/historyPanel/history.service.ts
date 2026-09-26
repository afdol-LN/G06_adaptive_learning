import { AppClient } from "../../../API/appRestApi";
import { ApiResponse } from "../../../models/apiResponse";
import { ActivityPage, ActivityQuery } from "../../../models/historyModel";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";

export class HistoryService {
  getActivity = async (
    query: ActivityQuery,
  ): Promise<ApiResponse<ActivityPage>> => {
    try {
      const f = query.filter;
      const params: Record<string, string> = {
        types: query.tab,
        page: String(query.page),
        pageSize: String(query.pageSize),
      };
      if (query.userId !== null) params.userId = String(query.userId);
      if (query.from) params.from = query.from;
      if (query.to) params.to = query.to;
      if (f.goalId !== null) params.goalId = String(f.goalId);
      if (f.skillId !== null) params.skillId = String(f.skillId);
      if (f.event) params.event = f.event;
      if (f.result) params.result = f.result;
      if (f.sessionType) params.sessionType = f.sessionType;
      if (f.grade) params.grade = f.grade;
      if (f.status) params.status = f.status;
      if (f.hasWrong) params.hasWrong = "true";
      // AppClient.get's 2nd argument IS the query params (it wraps them in { params } itself)
      const res = await AppClient.get("/userprofile/admin/activity", params);
      return res as ApiResponse<ActivityPage>;
    } catch (error: any) {
      return { isError: true, data: null, errorMessage: error.message };
    }
  };

  /** one session with every answer, shaped like the student's history card */
  getSessionDetail = async (
    sessionId: number,
  ): Promise<ApiResponse<SessionHistoryItem>> => {
    try {
      const res = await AppClient.get(`/history/admin/session/${sessionId}`);
      return res as ApiResponse<SessionHistoryItem>;
    } catch (error: any) {
      return { isError: true, data: null, errorMessage: error.message };
    }
  };
}

export const historyService = new HistoryService();
