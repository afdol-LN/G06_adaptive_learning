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
    // the submit button shows its own "checking…" state and the answer is locked meanwhile,
    // so no full-screen GlobalLoader over the question
    // 180s: the KT engine on Render's free plan can take ~70s to wake if the warm-up missed it
    return AppClient.post<SubmitAnswerResponse>(
      `/session/${sessionId}/answer`,
      payload,
      { skipGlobalLoader: true, timeout: 180000 },
    );
  };

  // wake the KT engine while the student is still on Home — the backend answers at once and
  // pings the engine in the background; a failure here only means no head start, so it's ignored
  static warmUpEngine = async (): Promise<void> => {
    try {
      await AppClient.post("/session/warmup", {}, { skipGlobalLoader: true });
    } catch {
      /* best effort */
    }
  };
}
