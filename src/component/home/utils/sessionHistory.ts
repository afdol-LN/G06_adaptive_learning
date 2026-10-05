import { SessionHistoryItem, SessionQuestionHistory } from "../../../models/sessionHistoryModel";

export type SessionGrade = "great" | "good" | "poor";
export type SessionTopic = "pretest" | "practice";
export type DayGroup = "today" | "yesterday" | "week" | "earlier";

// % of this session's answers that were right — the one implementation the card and the filters share
export function sessionScore(s: SessionHistoryItem): number {
  const total = s.questions.length;
  if (total === 0) return 0;
  return Math.round((s.questions.filter((q) => q.isCorrect).length / total) * 100);
}

export function sessionGrade(s: SessionHistoryItem): SessionGrade {
  const score = sessionScore(s);
  if (score >= 80) return "great";
  if (score >= 55) return "good";
  return "poor";
}

export const sessionTopic = (s: SessionHistoryItem): SessionTopic => (s.isPretest ? "pretest" : "practice");

export type SessionEnd = "mastered" | "completed" | "exhausted" | "review" | "abandoned";

// How a finished practice session ended, for its chip. A round that started at 100% is a review
// (P(L) frozen, adt-learning/docs/adr/0007) whichever way it ended. Null for pretests and drafts.
export function sessionEnd(s: SessionHistoryItem): SessionEnd | null {
  if (s.isPretest || s.inProgress || !s.stopReason) return null;
  if (s.stopReason === "mastered" || s.stopReason === "abandoned") return s.stopReason;
  return s.progressBefore === 100 ? "review" : s.stopReason;
}

// ms since epoch; a session without a start time sorts last
export const sessionTime = (s: SessionHistoryItem): number =>
  s.startTime ? new Date(s.startTime).getTime() : 0;

// seconds spent on one answer; null when the times are missing or out of order
export function answerSeconds(q: SessionQuestionHistory): number | null {
  if (!q.startTime || !q.endTime) return null;
  const sec = Math.round((new Date(q.endTime).getTime() - new Date(q.startTime).getTime()) / 1000);
  return sec >= 0 ? sec : null;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// by calendar day in the student's own timezone, not by 24-hour blocks
export function dayGroup(s: SessionHistoryItem, now: Date = new Date()): DayGroup {
  const days = Math.round((startOfDay(now) - startOfDay(new Date(sessionTime(s)))) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return "week";
  return "earlier";
}

export interface HistoryStats {
  sessions: number;
  questions: number;
  /** % right over every answer shown, not an average of session scores (a 2-question session weighs less) */
  accuracy: number;
  /** average seconds per answer, over answers with usable times; null if none */
  avgSeconds: number | null;
}

export function historyStats(sessions: SessionHistoryItem[]): HistoryStats {
  const questions = sessions.flatMap((s) => s.questions);
  const correct = questions.filter((q) => q.isCorrect).length;
  const times = questions.map(answerSeconds).filter((x): x is number => x !== null);
  return {
    sessions: sessions.length,
    questions: questions.length,
    accuracy: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    avgSeconds: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null,
  };
}
