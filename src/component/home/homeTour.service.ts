import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";

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
}

export const homeTourService = new HomeTourService();
