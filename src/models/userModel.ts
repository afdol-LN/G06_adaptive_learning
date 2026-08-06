import { campus, faculty, major } from "./universityModel";
import { ApiResponse } from "./apiResponse";
export interface userprofile{
    id : string,
    fullname : string,
    dateOfBirth : string,
    //campus model
    campus : campus,
    //faculty model
    faculty : faculty,
    //major model
    major : major,
    status : string
}

export interface UserAccountCreate {
    username : string,
    firstName : string,
    lastName : string,
    dateOfBirth : string,
    gender : number,
    password : string,
}

export interface AuthenData {
    userName?: string;
    authenToken: string;
}

export type AuthenResponse = ApiResponse<AuthenData>;

export interface AccessData {
    userId: number;
    userName: string;
    fullName: string;
    userRole: string;
    accessToken: string;
    branchId: number[] | null;
}

export type AccessResponse = ApiResponse<AccessData>;

// regitser
export interface RegisterCredentials {
  fullName : string,
  birthDate: string,
  genderId: number,
  username: string,
  password: string,
}

export interface UserResponseAdmin {
    id?: number;
    fullName: string;
    status: string;
    campusName: string;
    facultyName: string;
    majorName: string;
    goals: string | string[];
    sessionCount?: number;
    dayStreak?: number;
    correctPercent?: number;
}

export type getUsersResponseAdmin = ApiResponse<UserResponseAdmin[]>

export interface CreateUserByAdminRequest {
  fullName: string;
  birthDate: string;
  genderId: number;
  username: string;
  password: string;
  role: string;
}

export interface RoleOption {
  id: string;
  label: string;
}

export interface GenderOption {
  id: number;
  gender: string;
}