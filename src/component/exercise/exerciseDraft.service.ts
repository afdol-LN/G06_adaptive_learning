// The part of an Exercise draft only this browser knows: the answer picked or typed but not yet
// submitted. Answered questions and the question on screen live in the backend session, which
// /session/start resumes (adt-learning/docs/adr/0003).
const draftKey = (sessionId: number) => `exerciseDraft:${sessionId}`;

export interface UnsentAnswer {
  exerciseId: number;
  choiceId: number | null;
  text: string;
}

export class ExerciseDraftService {
  // storage may be unreadable (private mode / blocked) or hold junk — treat both as "nothing kept"
  load = (sessionId: number): UnsentAnswer | null => {
    try {
      const parsed = JSON.parse(localStorage.getItem(draftKey(sessionId)) ?? "null");
      return parsed && typeof parsed.exerciseId === "number" ? (parsed as UnsentAnswer) : null;
    } catch {
      return null;
    }
  };

  save = (sessionId: number, answer: UnsentAnswer): void => {
    try {
      localStorage.setItem(draftKey(sessionId), JSON.stringify(answer));
    } catch {
      // not kept — the student just re-picks after coming back
    }
  };

  clear = (sessionId: number): void => {
    try {
      localStorage.removeItem(draftKey(sessionId));
    } catch {
      // nothing to do
    }
  };
}

export const exerciseDraftService = new ExerciseDraftService();
