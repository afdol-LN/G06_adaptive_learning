import { AppClient } from "../../../API/appRestApi";
import { ApiResponse } from "../../../models/apiResponse";
import { GoalLearnerStats, SkillLearnerStats } from "../../../models/learnerStatsModel";

const fail = (error: any) => ({
  isError: true as const,
  data: null,
  errorMessage:
    (typeof error === "string" ? error : error?.errorMessage || error?.message) || "error",
});

export class LearnerStatsService {
  /** who picked this goal and how far along they are */
  getGoal = async (goalId: number): Promise<ApiResponse<GoalLearnerStats>> => {
    try {
      return (await AppClient.get(`/admin/goal-stats/${goalId}`)) as ApiResponse<GoalLearnerStats>;
    } catch (error: any) {
      return fail(error);
    }
  };

  /** who practised this skill and their progress */
  getSkill = async (skillId: number): Promise<ApiResponse<SkillLearnerStats>> => {
    try {
      return (await AppClient.get(`/admin/skill-stats/${skillId}`)) as ApiResponse<SkillLearnerStats>;
    } catch (error: any) {
      return fail(error);
    }
  };
}

export const learnerStatsService = new LearnerStatsService();
