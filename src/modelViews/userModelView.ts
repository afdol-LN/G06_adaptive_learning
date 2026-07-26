import { AppClient } from "../API/appRestApi";
import {
  AccessResponse,
  AuthenResponse,
  getUsersResponseAdmin,
  RegisterCredentials,
} from "../models/userModel";
import { formatDateTime } from "../utils/date";
import { sha256Hash } from "../utils/hash";

export class userViewModel {
  login = async (username: string, password: string) => {
    var response;
    try {
      const authenRes = await this.authenRequest(username);
      if (authenRes.isError || !authenRes.data) {
        response = {
          isError: true,
          data: null,
          errorMessage: authenRes.errorMessage,
        };
        return response;
      }

      const hashedPassword = await sha256Hash(password);
      const accessRes = await this.accessRequest(
        authenRes.data.authenToken,
        username,
        hashedPassword,
      );

      if (accessRes.isError || !accessRes.data) {
        response = {
          isError: true,
          data: null,
          errorMessage: accessRes.errorMessage,
        };
        return response;
      }

      const accessData = accessRes.data;
      localStorage.setItem(
        "user_id",
        accessData.userId ? accessData.userId.toString() : "",
      );
      localStorage.setItem("fullname", accessData.fullName || "");
      localStorage.setItem("userRole", accessData.userRole || "");
      localStorage.setItem("user_role", accessData.userRole || "");
      localStorage.setItem(
        "branch_id",
        accessData.branchId ? JSON.stringify(accessData.branchId) : "null",
      );
      localStorage.setItem(
        "branchId",
        accessData.branchId ? JSON.stringify(accessData.branchId) : "null",
      );
      localStorage.setItem("accessToken", accessData.accessToken || "");
      localStorage.setItem("access_token", accessData.accessToken || "");

      console.log("user_id", localStorage.getItem("user_id"));
      console.log("fullname", localStorage.getItem("fullname"));
      console.log("branch_id", localStorage.getItem("branch_id"));
      console.log("accessToken", localStorage.getItem("accessToken"));
      response = {
        isError: false,
        data: accessData,
        errorMessage: "Login successful",
      };
    } catch (error: any) {
      console.log("login failed: ", error);
      console.error("Login failed:", error);
      response = {
        isError: true,
        data: null,
        errorMessage:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "An unexpected error occurred during login.",
      };
    } finally {
      return response;
    }
  };

  register = async (request: RegisterCredentials) => {
    var response;
    try {
      const result = await AppClient.post("/userprofile/register", request);
      if (result.isError || !result.data) {
        response = {
          isError: true,
          data: null,
          errorMessage: result.errorMessage,
        };
        return response;
      } else {
        const authenRes = await this.authenRequest(request.username);
        if (authenRes.isError || !authenRes.data) {
          response = {
            isError: true,
            data: null,
            errorMessage: authenRes.errorMessage,
          };
          return response;
        }
        const hashedPassword = await sha256Hash(request.password);
        const accessData = await this.accessRequest(
          authenRes.data.authenToken,
          request.username,
          hashedPassword,
        );
        if (accessData.isError || !accessData.data) {
          response = {
            isError: true,
            data: null,
            errorMessage: accessData.errorMessage,
          };
          return response;
        } else {
          const accessInfo = accessData.data;
          localStorage.setItem(
            "user_id",
            accessInfo.userId ? accessInfo.userId.toString() : "",
          );
          localStorage.setItem("fullname", accessInfo.fullName || "");
          localStorage.setItem("userRole", accessInfo.userRole || "");
          localStorage.setItem("user_role", accessInfo.userRole || "");
          localStorage.setItem(
            "branch_id",
            accessInfo.branchId ? JSON.stringify(accessInfo.branchId) : "null",
          );
          localStorage.setItem(
            "branchId",
            accessInfo.branchId ? JSON.stringify(accessInfo.branchId) : "null",
          );
          localStorage.setItem("accessToken", accessInfo.accessToken || "");
          localStorage.setItem("access_token", accessInfo.accessToken || "");

          response = {
            isError: false,
            data: accessInfo,
            errorMessage: "Register successful",
          };
          return response;
        }
      }
    } catch (error: any) {
      console.log("register failed: ", error);
      console.error("Register failed:", error);
      response = {
        isError: true,
        data: null,
        errorMessage:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "An unexpected error occurred during register.",
      };
    } finally {
      return response;
    }
  };

  //fetch users info
  getUsers = async (): Promise<getUsersResponseAdmin> => {
    const result = await AppClient.get<getUsersResponseAdmin>(
      "/userprofile/admin/user_list",
    );
    return result;
  };

  //authen request
  private authenRequest = async (username: string): Promise<AuthenResponse> => {
    const data = username + "&" + formatDateTime();
    console.log("this is data before hashe", data);
    const authenRequest = await sha256Hash(data);
    console.log('authen request : ', authenRequest)

    const result = await AppClient.post<AuthenResponse>("/authen/authen_request", {
      authenRequest: authenRequest,
    });
    return result;
  };

  //access
  private accessRequest = async (
    authenToken: string,
    username: string,
    password: string,
  ): Promise<AccessResponse> => {
    const authenSignature = await this.generateAuthenSignature(
      username,
      password,
      authenToken,
    );
    console.log("this is authenToken", authenToken);
    console.log("this is authenSignature", authenSignature);
    const result = await AppClient.post<AccessResponse>(
      "/authen/access_request",
      {
        authenToken: authenToken,
        authenSignature: authenSignature,
      },
    );

    return result;
  };

  private generateAuthenSignature = async (
    username: string,
    password: string,
    authenToken: string,
  ) => {
    return await sha256Hash(username + password + authenToken);
  };
}
