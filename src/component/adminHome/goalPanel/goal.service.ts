import { AppClient } from "../../../API/appRestApi";
import { ApiResponse } from "../../../models/apiResponse";
import {
  Goal,
  CreateGoalWithSkillRequireRequest,
  UpdateGoalWithSkillRequireRequest,
} from "../../../models/goalModel";

export class GoalService {
  getAllGoals = async (): Promise<ApiResponse<Goal[]>> => {
    try {
      const result = await AppClient.get("/goal");
      return { isError: false, data: result as Goal[], errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch goals",
      };
    }
  };

  createGoalWithSkillRequire = async (
    data: CreateGoalWithSkillRequireRequest,
  ): Promise<ApiResponse<Goal>> => {
    try {
      const result = await AppClient.post("/goal/with-skill-require", data);
      return { isError: false, data: result as Goal, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to create goal",
      };
    }
  };

  updateGoalWithSkillRequire = async (
    goalId: number,
    data: UpdateGoalWithSkillRequireRequest,
  ): Promise<ApiResponse<Goal>> => {
    try {
      const result = await AppClient.put(`/goal/${goalId}/with-skill-require`, data);
      return { isError: false, data: result as Goal, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to update goal",
      };
    }
  };

  updateGoalStatus = async (
    goalId: number,
    status: string,
  ): Promise<ApiResponse<Goal>> => {
    try {
      const result = await AppClient.put(`/goal/${goalId}`, { status });
      return { isError: false, data: result as Goal, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to update goal status",
      };
    }
  };
}

export const goalService = new GoalService();
