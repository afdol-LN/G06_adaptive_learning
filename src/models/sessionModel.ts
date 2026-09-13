import { SkillProgress } from "./branchSkillModel";

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
  code?: string | null;
  language?: string | null;
  choices?: QuestionChoice[];
}

export interface StartSessionResponse {
  sessionId: number;
  skillId: number;
  pL: number;
  /** Same value the skill-tree node shows */
  progress: SkillProgress;
  /** Most questions this session can have (backend SESSION_QUESTION_LIMIT) */
  questionLimit: number;
  /** true when this continues the skill's draft (adt-learning/docs/adr/0003) */
  resumed: boolean;
  /** already answered in this session — the counter continues from here */
  answeredCount: number;
  /** of those, correct — the summary counts the whole session */
  correctCount: number;
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
  /** Progress after this answer — equals what the skill-tree node now shows */
  progress: SkillProgress;
  nextQuestion: NextQuestion | null;
  sessionEnded: boolean;
  stopReason: "mastered" | "completed" | "exhausted" | null;
  summary?: SessionSummary;
}
