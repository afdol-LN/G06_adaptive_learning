import { ApiResponse } from "./apiResponse";

export interface faculty {
    id : string,
    name : string,
    campus : string,
}

export interface major {
    id : string,
    name : string,
    faculty : string,
}

export interface campus {
    id : string,
    name : string,
}

// DTO Models for API communication
export interface CampusDTO {
  id: number;
  campusId: string;
  campus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultyDTO {
  facultyId: number;
  facultyName: string;
  campusid: number;
  id?: number | string;
  faculty?: string;
}

export interface MajorDTO {
  majorId: number;
  majorName: string;
  facultyId: number;
  id?: number | string;
  major?: string;
}

// Response Types using ApiResponse
export type CampusResponse = CampusDTO[] | ApiResponse<CampusDTO[]>;
export type FacultyResponse = ApiResponse<FacultyDTO[]>;
export type MajorResponse = ApiResponse<MajorDTO[]>;