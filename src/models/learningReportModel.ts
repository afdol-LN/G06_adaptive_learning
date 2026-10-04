// Profile → Export PDF — mirrors adt-learning `dto/learningReport.dto.ts`.
// Progress numbers come from the backend (never computed from P(L) here — docs/adr/0001).

export interface ReportLearner {
  fullName: string;
  username: string;
  campus: string | null;
  faculty: string | null;
  major: string | null;
  year: number | null;
}

export type ReportSkillStatus = "mastered" | "in_progress" | "not_started";

export interface ReportSkill {
  skillId: number;
  name: string;
  tier: string | null;
  required: boolean;
  progressPercent: number;
  status: ReportSkillStatus;
  startProgressPercent: number | null;
  masteredAt: string | null;
  masteredVia: "practice" | "pretest" | null;
  practiceSessions: number;
  practiceQuestions: number;
  practiceCorrect: number;
}

export interface ReportEffort {
  practiceSessions: number;
  pretest: { correct: number; total: number; takenAt: string } | null;
  questions: number;
  correct: number;
  accuracyPercent: number;
  studySeconds: number;
  firstActivityAt: string | null;
  lastActivityAt: string | null;
  activeDays: number;
}

export interface ReportSession {
  sessionId: number;
  startTime: string;
  endTime: string;
  isPretest: boolean;
  skillNames: string[];
  correct: number;
  total: number;
  stopReason: string | null;
  inProgress: boolean;
}

export interface ReportGoal {
  branchId: number;
  name: string;
  description: string | null;
  startedAt: string;
  completedAt: string | null;
  isComplete: boolean;
  progressPercent: number;
  masteredCount: number;
  requiredCount: number;
}

export interface BranchReport {
  documentNo: string;
  issuedAt: string;
  learner: ReportLearner;
  goal: ReportGoal;
  skills: ReportSkill[];
  effort: ReportEffort;
  sessions: ReportSession[];
}

export interface SummaryReport {
  documentNo: string;
  issuedAt: string;
  learner: ReportLearner;
  goals: (ReportGoal & { effort: ReportEffort })[];
  totals: ReportEffort & { goals: number; completedGoals: number };
}

/** which report the export modal asked for — one or more goals in one document, or the transcript */
export type ReportScope =
  | { kind: "branches"; branchIds: number[]; withSessions: boolean }
  | { kind: "all" };
