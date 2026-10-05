// Admin "ประวัติการทำโจทย์" — mirrors adt-learning/server/app/src/dto/exerciseStats.dto.ts
// Students are counted by FIRST attempt per (user, exercise); attemptsAll counts every attempt.

export interface ExerciseStatSummary {
  exerciseId: number;
  description: string;
  skillId: number;
  skillName: string;
  level: number;
  type: string;
  totalStudents: number;
  correctStudents: number;
  wrongStudents: number;
  /** 0-100, null when nobody has answered yet */
  correctRate: number | null;
}

export interface ExerciseStatChoice {
  choiceId: number | null;
  text: string;
  isCorrect: boolean;
  pickedCount: number;
}

export interface ExerciseStatStudent {
  userId: number;
  name: string;
  isCorrect: boolean;
  attempts: number;
  firstAnswer: string | null;
  timeSpentSec: number | null;
  /** skill progress % (0-100) after the student's latest practice answer on this question */
  latestProgress: number | null;
  lastAnsweredAt: string;
}

export interface ExerciseStatDetail extends ExerciseStatSummary {
  fullDescription: string;
  code: string | null;
  language: string | null;
  attemptsAll: number;
  choices: ExerciseStatChoice[];
  students: ExerciseStatStudent[];
}
