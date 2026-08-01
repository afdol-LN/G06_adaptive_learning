import { ApiResponse } from "./apiResponse";

export interface HistoryEntry {
  id: number;
  user: string;
  skill: string;
  date: string;
  score: number;
  correct: number;
  total: number;
  grade: string;
}

export type GetHistoryResponse = ApiResponse<HistoryEntry[]>;
