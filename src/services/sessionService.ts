import { AppClient } from "../API/appRestApi";
import {
  StartSessionResponse,
  SubmitAnswerResponse,
} from "../models/sessionModel";

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
