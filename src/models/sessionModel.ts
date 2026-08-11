export type ExerciseQuestionType = "CHOICE" | "FILL_IN_BLANK";

export interface QuestionChoice {
  id: number;
  script: string;
}

export interface NextQuestion {
  exerciseId: number;
  description: string;
  type: ExerciseQuestionType;
  expectTime: number | null;
  choices?: QuestionChoice[];
}

export interface StartSessionResponse {
  sessionId: number;
  skillId: number;
  pL: number;
  question: NextQuestion;
}

export interface RecommendedSkill {
  skillId: number;
  skillCode: string;
  skillsName: string;
  tier: string;
  pL: number;
}

export interface SessionSummary {
  pLBefore: number;
  pLAfter: number;
  newlyUnlockedSkills: { skillId: number; skillsName: string }[];
  nextRecommendation: RecommendedSkill | null;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  pL: number;
  nextQuestion: NextQuestion | null;
  sessionEnded: boolean;
  stopReason: "mastered" | "completed" | "exhausted" | null;
  summary?: SessionSummary;
}
