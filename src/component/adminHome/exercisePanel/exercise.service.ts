import { AppClient } from "../../../API/appRestApi";
import { ApiResponse } from "../../../models/apiResponse";
import {
  Exercise,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from "../../../models/exerciseModel";

export class ExerciseService {
  getAllExercises = async (): Promise<ApiResponse<Exercise[]>> => {
    try {
      const result = await AppClient.get("/exercise");
      return { isError: false, data: result as Exercise[], errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch exercises",
      };
    }
  };

  getExercise = async (exerciseId: number): Promise<ApiResponse<Exercise>> => {
    try {
      const result = await AppClient.get(`/exercise/${exerciseId}`);
      return { isError: false, data: result as Exercise, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch exercise",
      };
    }
  };

  createExercise = async (
    data: CreateExerciseRequest,
  ): Promise<ApiResponse<Exercise>> => {
    try {
      const result = await AppClient.post("/exercise", data);
      return { isError: false, data: result as Exercise, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to create exercise",
      };
    }
  };

  updateExercise = async (
    exerciseId: number,
    data: UpdateExerciseRequest,
  ): Promise<ApiResponse<Exercise>> => {
    try {
      const result = await AppClient.put(`/exercise/${exerciseId}`, data);
      return { isError: false, data: result as Exercise, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to update exercise",
      };
    }
  };

  deleteExercise = async (exerciseId: number): Promise<ApiResponse<null>> => {
    try {
      await AppClient.delete(`/exercise/${exerciseId}`);
      return { isError: false, data: null, errorMessage: "" };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to delete exercise",
      };
    }
  };
}

export const exerciseService = new ExerciseService();
