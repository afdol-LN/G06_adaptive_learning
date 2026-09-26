import { ApiResponse } from "./apiResponse";

// Admin History timeline — mirrors ActivityEvent / ActivityPage in adt-learning `libs/activity/activity.ts`.
export type ActivityType = "goal" | "skill" | "exercise" | "login";
export const ACTIVITY_TYPES: ActivityType[] = ["goal", "skill", "exercise", "login"];

/** A History tab: every type together, or one type on its own. */
export type ActivityTab = "all" | ActivityType;
export const ACTIVITY_TABS: ActivityTab[] = ["all", ...ACTIVITY_TYPES];

export type ActivityAction =
  | "goal_started"
  | "goal_completed"
  | "session_started"
  | "session_ended"
  | "exercise_session"
  | "login";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  action: ActivityAction;
  at: string; // ISO time
  user: { id: number; name: string };
  goalName?: string | null;
  skillName?: string | null;
  isPretest?: boolean | null;
  stopReason?: string | null;
  /** exercise rows are one per session — open it with historyService.getSessionDetail */
  sessionId?: number | null;
  questionCount?: number | null;
  correctCount?: number | null;
  inProgress?: boolean | null;
}

export interface ActivityPage {
  events: ActivityEvent[];
  total: number;
  page: number; // starts at 1
  pageSize: number;
  totalPages: number;
}

// ── filters ──

/** shared time menu: a preset, or a from–to picked on the calendar */
export type TimePreset = "all" | "today" | "7d" | "30d" | "custom";
export interface TimeFilter {
  preset: TimePreset;
  /** ISO yyyy-mm-dd, inclusive — only used when preset is "custom" */
  from: string;
  to: string;
}

export type StopReason = "mastered" | "completed" | "exhausted" | "abandoned";
export const STOP_REASONS: StopReason[] = ["mastered", "completed", "exhausted", "abandoned"];
export type SessionGradeFilter = "great" | "good" | "poor";
export const SESSION_GRADES: SessionGradeFilter[] = ["great", "good", "poor"];

/** per-tab options; each tab only sends the ones it shows. "" = not filtered */
export interface TabFilter {
  goalId: number | null;
  skillId: number | null;
  event: "" | "started" | "completed" | "ended";
  result: "" | StopReason | "in_progress";
  sessionType: "" | "practice" | "pretest";
  grade: "" | SessionGradeFilter;
  status: "" | "finished" | "in_progress";
  hasWrong: boolean;
}

export const emptyTabFilter = (): TabFilter => ({
  goalId: null,
  skillId: null,
  event: "",
  result: "",
  sessionType: "",
  grade: "",
  status: "",
  hasWrong: false,
});

export interface ActivityQuery {
  tab: ActivityTab;
  userId: number | null;
  /** instants; `to` is exclusive */
  from: string | null;
  to: string | null;
  filter: TabFilter;
  page: number;
  pageSize: number;
}

export type GetActivityResponse = ApiResponse<ActivityPage>;
