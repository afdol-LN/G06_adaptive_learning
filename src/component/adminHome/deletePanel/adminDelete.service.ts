import { AppClient } from "../../../API/appRestApi";
import { ApiResponse } from "../../../models/apiResponse";

export type DeleteKind = "exercise" | "skill" | "goal" | "user";

/** why the backend refused (adt-learning adminDelete.service DeleteBlockedError) */
export interface DeleteBlocked {
  code?:
    | "EXERCISE_ANSWERED"
    | "SKILL_HAS_LEARNERS"
    | "SKILL_IN_USE"
    | "GOAL_HAS_LEARNERS"
    | "USER_HAS_BRANCHES"
    | "CANNOT_DELETE_SELF";
  count?: number;
  goals?: string[];
  skills?: string[];
}

const PATH: Record<DeleteKind, string> = {
  exercise: "exercises",
  skill: "skills",
  goal: "goals",
  user: "users",
};

/**
 * Hard delete — only works for things no learner has used; otherwise isError with data.code.
 * (The older DELETE /skill/:id etc. only deactivate.)
 */
export async function adminDelete(kind: DeleteKind, id: number): Promise<ApiResponse<DeleteBlocked | null>> {
  try {
    return (await AppClient.delete(`/admin/${PATH[kind]}/${id}`)) as ApiResponse<DeleteBlocked | null>;
  } catch (error: any) {
    return {
      isError: true,
      data: null,
      errorMessage:
        (typeof error === "string" ? error : error?.errorMessage || error?.message) || "error",
    };
  }
}
