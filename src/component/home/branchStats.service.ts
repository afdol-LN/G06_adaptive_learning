import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { BranchBaseState, BranchStats } from "../../models/branchStatsModel";

export class BranchStatsService {
  getBranchStats = async (branchId: number): Promise<ApiResponse<BranchStats>> => {
    try {
      const result = await AppClient.get(`/branch/${branchId}/stats`);
      let data: BranchStats | null = null;
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        data = rawRes.data as BranchStats;
        errorMessage = rawRes.errorMassege || "";
      } else {
        data = result as BranchStats;
      }

      return { isError, data, errorMessage };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch branch stats",
      };
    }
  };

  // ที่มาของคะแนนเริ่มต้นจาก pretest — หนึ่งแถวต่อ skill ของ goal (ว่างถ้ายังไม่ทำ pretest)
  // ทุกค่าเป็น % Progress ที่ backend คำนวณแล้ว แสดงตามนั้น ห้ามคำนวณใหม่ฝั่งนี้ (ADR 0001/0004)
  getBranchBaseState = async (branchId: number): Promise<ApiResponse<BranchBaseState[]>> => {
    try {
      const result = await AppClient.get(`/branch/${branchId}/baseState`);
      let data: BranchBaseState[] | null = null;
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        data = (rawRes.data as BranchBaseState[]) ?? [];
        errorMessage = rawRes.errorMassege || "";
      } else {
        data = Array.isArray(result) ? (result as BranchBaseState[]) : [];
      }

      return { isError, data, errorMessage };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch pretest breakdown",
      };
    }
  };
}

export const branchStatsService = new BranchStatsService();
