import { AppClient } from "../../../API/appRestApi";
import {
  getUsersResponseAdmin,
  UserResponseAdmin,
  CreateUserByAdminRequest,
  RoleOption,
  GenderOption,
} from "../../../models/userModel";
import { ApiResponse } from "../../../models/apiResponse";

export class UserService {
  getAllUsers = async (): Promise<ApiResponse<UserResponseAdmin[]>> => {
    try {
      const users = await AppClient.get("/userprofile/admin/user_list");
      return users as ApiResponse<UserResponseAdmin[]>;
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message,
      };
    }
  };

  updateUserStatus = async (
    id: number,
    status: string
  ): Promise<ApiResponse<any>> => {
    try {
      const result = await AppClient.put(
        `/userprofile/admin/update_status/${id}`,
        { status }
      );
      return result as ApiResponse<any>;
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to update status",
      };
    }
  };

  getGenders = async (): Promise<ApiResponse<GenderOption[]>> => {
    try {
      const result = await AppClient.get("/gender");
      return {
        isError: false,
        data: result as GenderOption[],
        errorMessage: "",
      };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch genders",
      };
    }
  };

  getRoles = async (): Promise<ApiResponse<RoleOption[]>> => {
    try {
      const result = await AppClient.get("/userprofile/admin/roles");
      return result as ApiResponse<RoleOption[]>;
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch roles",
      };
    }
  };

  createAdminUser = async (
    data: CreateUserByAdminRequest
  ): Promise<ApiResponse<any>> => {
    try {
      const result = await AppClient.post("/userprofile/admin/create_user", data);
      return result as ApiResponse<any>;
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to create user",
      };
    }
  };
}


export const userService = new UserService();