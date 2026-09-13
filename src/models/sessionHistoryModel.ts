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
}

export interface SessionHistoryItem {
  sessionId: number;
  startTime: string;
  endTime: string;
  isPretest: boolean;
  /** unfinished practice session — a draft the student can resume (adt-learning/docs/adr/0003) */
  inProgress?: boolean;
  questions: SessionQuestionHistory[];
}
