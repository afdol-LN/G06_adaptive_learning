import { AppClient } from "../API/appRestApi";
import {
  StartSessionResponse,
  SubmitAnswerResponse,
} from "../models/sessionModel";

/** /answer refused because an admin edited the question while it was on screen — reload it */
export const isExerciseChangedError = (err: unknown): boolean =>
  typeof err === "object" && err !== null && (err as { code?: unknown }).code === "EXERCISE_CHANGED";

export class SessionService {
  static startSession = async (
    branchId: number,
    skillId: number,
  ): Promise<StartSessionResponse> => {
    return AppClient.post<StartSessionResponse>("/session/start", {
      branchId,
      skillId,
    });
  };

  static submitAnswer = async (
    sessionId: number,
    payload: {
      exerciseId: number;
      /** CHOICE: the option picked — the backend grades by this id, not by its text */
      choiceId?: number;
      chosenAnswer?: string;
      startTime: string;
      endTime: string;
    },
  ): Promise<SubmitAnswerResponse> => {
    return AppClient.post<SubmitAnswerResponse>(
      `/session/${sessionId}/answer`,
      payload,
    );
  };
}
