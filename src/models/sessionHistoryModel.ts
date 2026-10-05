export interface SessionQuestionChoice {
  id: number;
  script: string;
  isAnswer: boolean;
}

export interface SessionQuestionHistory {
  id: number; // history record id
  exerciseId: number;
  questionText: string;
  questionType: string;
  choices: SessionQuestionChoice[];
  isCorrect: boolean;
  startTime: string;
  endTime: string;
  chosenAnswer: string | null;
  correctAnswer: string;
  isCasesensitive: string; // 'YES' or 'NO'
  /** code shown with the question — rendered through CodeBlock, never inside questionText */
  code?: string | null;
  language?: string | null;
  /** question level, 1–5 */
  skillLevel?: number | null;
  /** seconds the question is expected to take */
  expectTime?: number | null;
}

export type SessionStopReason = "mastered" | "completed" | "exhausted" | "abandoned";

export interface SessionHistoryItem {
  sessionId: number;
  startTime: string;
  endTime: string;
  isPretest: boolean;
  /** unfinished practice session — a draft the student can resume (adt-learning/docs/adr/0003) */
  inProgress?: boolean;
  /** distinct names of the skills the session's exercises practise */
  skillNames?: string[];
  /** why it ended; null while in progress and for pretests */
  stopReason?: SessionStopReason | null;
  /** the skill's Progress (from the backend, never computed from pL here) before / after the session;
   *  before is null when there was no earlier practice of that skill */
  progressBefore?: number | null;
  progressAfter?: number | null;
  questions: SessionQuestionHistory[];
}
