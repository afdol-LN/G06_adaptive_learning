import { ApiResponse } from "./apiResponse";

// null = ยังไม่มีข้อมูลจาก backend (หน้าแสดง "—" แทน 0 ที่ดูเหมือนค่าจริง)
export interface AdminSummary {
  totalUsers: number | null;
  activeToday: number | null;
  totalSessions: number | null;
  avgScore: number | null;
  totalSkills: number | null;
  topSkill: string | null;
  /** จันทร์ → อาทิตย์ */
  weekSessions: number[] | null;
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
  lastActive: string | null;
  status: string;
}

export interface AdminSummaryData {
  summary: AdminSummary;
  skillProgress: SummarySkillProgress[];
  userActivity: SummaryUserActivity[];
}

export type GetAdminSummaryResponse = ApiResponse<AdminSummaryData>;
