export interface PretestChoice {
  id?: number;
  choiceNo?: number;
  script: string;
  isAnswer?: boolean;
}

export interface PretestQuestion {
  id: number;
  skillId: number;
  skillName?: string;
  level: number;
  description: string;
  text?: string;
  code?: string[] | null;
  type: 'CHOICE' | 'FILL_IN_BLANK';
  fillInBlank?: string | null;
  isCasesensitive?: string;
  choices?: string[];
  exerciseChoices?: PretestChoice[];
  answer?: number | string;
  diff?: number;
  diffLabel?: string;
  diffColor?: string;
}

export type PretestAnswer = number | string | null;

export interface PretestResultItem {
  questionIndex: number;
  questionId: number;
  skillId: number;
  skillName?: string;
  type: 'CHOICE' | 'FILL_IN_BLANK';
  userAnswer: PretestAnswer;
  correctAnswer: number | string | undefined;
  isCorrect: boolean;
  startTime?: string;
  endTime?: string;
  chosenAnswerText?: string | null;
}

export interface PretestScoreSummary {
  correct: number;
  total: number;
  pct: number;
  results: PretestResultItem[];
  isCorrectList: boolean[];
}
