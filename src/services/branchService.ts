import { AppClient } from "../API/appRestApi";

export interface BranchDTO {
  id: number;
  userId: number;
  goalId: number;
  expForGoal: number;
  isAlreadyPretest: boolean;
  goal: {
    id: number;
    goal: string;
    goalDescription: string;
  };
}

export class BranchService {
  static async getMyBranches(): Promise<BranchDTO[]> {
    const res = await AppClient.get("branch/mine");
    // Ensure it returns an array
    if (Array.isArray(res)) {
      return res;
    } else if (res && Array.isArray((res as any).data)) {
      return (res as any).data;
    }
    return [];
  }
}
