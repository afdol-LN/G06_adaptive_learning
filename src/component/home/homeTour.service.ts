import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";

// tour ของหน้า Home ใช้ userprofile.isEverTour ใน backend
// หน้าอื่น (Skill Tree / History / Profile) ยังไม่มีคอลัมน์ใน DB — จำไว้ใน localStorage แยกตาม user
const seenPagesKey = (userId: string | number) => `tourSeenPages:${userId}`;

export class HomeTourService {
  getTourStatus = async (userId: string | number): Promise<ApiResponse<boolean>> => {
    try {
      const result = await AppClient.get(`/userprofile/${userId}`);
      const isEverTour = (result as any)?.isEverTour ?? false;
      return { isError: false, data: Boolean(isEverTour), errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch tour status",
      };
    }
  };

  markTourSeen = async (userId: string | number): Promise<ApiResponse<boolean>> => {
    try {
      const result = await AppClient.put(`/userprofile/update_tour/${userId}`);
      let data: boolean | null = null;
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        data = Boolean(rawRes.data);
        errorMessage = rawRes.errorMessage || "";
      } else {
        data = Boolean(result);
      }

      return { isError, data, errorMessage };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to update tour status",
      };
    }
  };

  // storage อาจอ่านไม่ได้ (private mode / ถูกบล็อก) หรือค่าเสีย — ถือว่ายังไม่เคยดูสักหน้า
  getSeenPages = (userId: string | number): string[] => {
    try {
      const parsed = JSON.parse(localStorage.getItem(seenPagesKey(userId)) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === "string") : [];
    } catch {
      return [];
    }
  };

  markPageSeen = (userId: string | number, page: string): void => {
    try {
      const pages = new Set(this.getSeenPages(userId));
      pages.add(page);
      localStorage.setItem(seenPagesKey(userId), JSON.stringify([...pages]));
    } catch {
      // จำไม่ได้ก็แค่ auto-start ซ้ำในครั้งหน้า ไม่กระทบการใช้งาน
    }
  };
}

export const homeTourService = new HomeTourService();
