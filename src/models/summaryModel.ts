import { ApiResponse } from "./apiResponse";

export interface AdminSummary {
  totalUsers: number;
  activeToday: number;
  totalSessions: number;
  avgScore: number;
  topSkill: string;
  weekSessions: number[];
}

export interface SummarySkillProgress {
  id: number;
  name: string;
  icon: string;
  tier: string;
  avgProgress: number;
}

export interface SummaryUserActivity {
  id: number;
  name: string;
  email: string;
  faculty: string;
  sessions: number;
  avgScore: number;
  streak: number;
  lastActive: string;
  status: string;
}

export interface AdminSummaryData {
  summary: AdminSummary;
  skillProgress: SummarySkillProgress[];
  userActivity: SummaryUserActivity[];
}

export type GetAdminSummaryResponse = ApiResponse<AdminSummaryData>;
