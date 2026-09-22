import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { UserProfileDetail } from "../../models/userModel";

// GET /userprofile/:id คืน entity ดิบ (มีแค่ campusId/facultyId/majorId/genderId)
// จึงต้องดึงชื่อจาก /campus, /faculty, /major, /gender ตาม id อีกรอบ
const fetchName = async (endpoint: string, id: unknown, field: string): Promise<string | null> => {
  if (id === null || id === undefined || id === "") return null;
  try {
    const res: any = await AppClient.get(`/${endpoint}/${id}`);
    const entity = res && typeof res === "object" && "isError" in res ? res.data : res;
    return entity?.[field] ?? null;
  } catch {
    return null;
  }
};

export class UserProfileService {
  getProfile = async (userId: string | number): Promise<ApiResponse<UserProfileDetail>> => {
    try {
      const raw: any = await AppClient.get(`/userprofile/${userId}`);
      const user = raw && typeof raw === "object" && "isError" in raw ? raw.data : raw;
      if (!user) {
        return { isError: true, data: null, errorMessage: "User not found" };
      }

      const [campusName, facultyName, majorName, genderName] = await Promise.all([
        fetchName("campus", user.campusId, "campus"),
        fetchName("faculty", user.facultyId, "faculty"),
        fetchName("major", user.majorId, "major"),
        fetchName("gender", user.genderId, "gender"),
      ]);

      return {
        isError: false,
        errorMessage: "",
        data: {
          id: user.id,
          fullName: user.fullName ?? "",
          username: user.username ?? "",
          birthDate: user.birthDate ?? null,
          genderName,
          campusName,
          facultyName,
          majorName,
          year: user.year ?? null,
          role: user.role ?? "",
          status: user.status ?? "",
          createdAt: user.createdAt ?? null,
        },
      };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error?.message || "Failed to fetch user profile",
      };
    }
  };
}

export const userProfileService = new UserProfileService();
