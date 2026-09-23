import { AppClient } from "../../../../API/appRestApi";
import { ApiResponse } from "../../../../models/apiResponse";
import { GoalWorkspace, PublishGoalResult } from "../../../../models/goalModel";

/**
 * เฉพาะ endpoint ใหม่ของ Goal Workspace — การเขียน skill / goal / exercise / ร่าง AI
 * ใช้ service เดิมของแต่ละแท็บ ไม่เขียน HTTP ซ้ำที่นี่
 */
export class WorkspaceService {
  getWorkspace = async (goalId: number): Promise<ApiResponse<GoalWorkspace>> => {
    try {
      const result = await AppClient.get(`/goal/${goalId}/workspace`);
      return { isError: false, data: result as GoalWorkspace, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error?.message || "Failed to load goal workspace",
      };
    }
  };

  /** 400 เมื่อยังไม่พร้อม — body คือ { message, checks } จาก backend */
  publish = async (goalId: number): Promise<ApiResponse<PublishGoalResult>> => {
    try {
      const result = await AppClient.post(`/goal/${goalId}/publish`);
      return { isError: false, data: result as PublishGoalResult, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error?.message || "Failed to publish goal",
      };
    }
  };
}

export const workspaceService = new WorkspaceService();
