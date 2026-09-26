import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { BranchReport, SummaryReport } from "../../models/learningReportModel";

// the branch controller answers with RestAPIResponse, whose message field is spelled `errorMassege`
type BackendResponse<T> = { isError: boolean; data: T | null; errorMassege?: string | null };

const unwrap = <T,>(res: BackendResponse<T>): ApiResponse<T> => ({
  isError: res.isError || !res.data,
  data: res.data,
  errorMessage: res.errorMassege ?? "",
});

export class LearningReportService {
  getBranchReport = async (branchId: number): Promise<ApiResponse<BranchReport>> => {
    try {
      return unwrap(await AppClient.get<BackendResponse<BranchReport>>(`/branch/${branchId}/report`));
    } catch (error: any) {
      return { isError: true, data: null, errorMessage: error?.message ?? String(error) };
    }
  };

  getSummaryReport = async (): Promise<ApiResponse<SummaryReport>> => {
    try {
      return unwrap(await AppClient.get<BackendResponse<SummaryReport>>("/branch/mine/report"));
    } catch (error: any) {
      return { isError: true, data: null, errorMessage: error?.message ?? String(error) };
    }
  };
}

export const learningReportService = new LearningReportService();
