import { AiClient } from "../../../API/aiRestApi";
import { ApiResponse } from "../../../models/apiResponse";
import {
  AiDraft,
  AiDraftEntityType,
  AiDraftPayload,
  AiDraftStatus,
  GenerateDraftRequest,
  GenerateDraftResult,
} from "../../../models/aiDraftModel";

/**
 * ยิงผ่าน AiClient (ไม่ใช่ AppClient) เพราะงานสร้างร่างต้องรอ LLM นาน
 * และไม่ควรบังหน้าจอด้วย GlobalLoader — ดูเหตุผลเต็มใน src/API/aiRestApi.ts
 */
export class AiService {
  generate = async (
    data: GenerateDraftRequest,
  ): Promise<ApiResponse<GenerateDraftResult>> => {
    try {
      const result = await AiClient.post("/ai-draft/generate", data);
      return {
        isError: false,
        data: result as GenerateDraftResult,
        errorMessage: "",
      };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "สร้างร่างไม่สำเร็จ",
      };
    }
  };

  getDrafts = async (filter: {
    status?: AiDraftStatus;
    entityType?: AiDraftEntityType;
    batchId?: string;
  }): Promise<ApiResponse<AiDraft[]>> => {
    try {
      const params: Record<string, string> = {};
      if (filter.status) params.status = filter.status;
      if (filter.entityType) params.entityType = filter.entityType;
      if (filter.batchId) params.batchId = filter.batchId;

      const result = await AiClient.get("/ai-draft", params);
      return { isError: false, data: result as AiDraft[], errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "โหลดรายการร่างไม่สำเร็จ",
      };
    }
  };

  regenerate = async (
    id: number,
    instruction?: string,
  ): Promise<ApiResponse<AiDraft>> => {
    try {
      const result = await AiClient.post(`/ai-draft/${id}/regenerate`, {
        instruction,
      });
      return { isError: false, data: result as AiDraft, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "สร้างใหม่ไม่สำเร็จ",
      };
    }
  };

  updatePayload = async (
    id: number,
    payload: AiDraftPayload,
  ): Promise<ApiResponse<AiDraft>> => {
    try {
      const result = await AiClient.put(`/ai-draft/${id}`, { payload });
      return { isError: false, data: result as AiDraft, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "บันทึกการแก้ไขไม่สำเร็จ",
      };
    }
  };

  approve = async (
    id: number,
    status: "active" | "inactive",
  ): Promise<ApiResponse<AiDraft>> => {
    try {
      const result = await AiClient.post(`/ai-draft/${id}/approve`, { status });
      return { isError: false, data: result as AiDraft, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "อนุมัติไม่สำเร็จ",
      };
    }
  };

  reject = async (id: number, note?: string): Promise<ApiResponse<AiDraft>> => {
    try {
      const result = await AiClient.post(`/ai-draft/${id}/reject`, { note });
      return { isError: false, data: result as AiDraft, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "ปฏิเสธไม่สำเร็จ",
      };
    }
  };
}

export const aiService = new AiService();
