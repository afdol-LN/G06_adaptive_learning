import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * HTTP client แยกสำหรับงานที่ต้องรอ LLM โดยเฉพาะ
 *
 * ไม่ใช้ AppClient เพราะตัวนั้นมีข้อจำกัด 2 ข้อที่ชนกับงานนี้ตรง ๆ:
 *   1. timeout 5 วินาที — LLM ตอบไม่ทันแน่นอน
 *   2. ทุก request จุด GlobalLoader ที่บังทั้งหน้าจอ — admin จะคลิกอะไรไม่ได้เลยระหว่างรอ
 *
 * ที่เหลือ (แนบ Bearer token, unwrap response.data, จัดการ 401) ทำเหมือน AppClient
 * เพื่อให้ service layer เขียนแบบเดียวกัน
 */
const baseURL = import.meta.env.VITE_API_BASE_URL + "/";

const instance: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 180000,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }
    return Promise.reject(error.response?.data ?? error.message);
  },
);

export class AiClient {
  static get<T = any>(
    endpoint: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    return instance.get(endpoint, { params });
  }
  static post<T = any>(
    endpoint: string,
    data: Record<string, any> = {},
  ): Promise<T> {
    return instance.post(endpoint, data);
  }
  static put<T = any>(
    endpoint: string,
    data: Record<string, any> = {},
  ): Promise<T> {
    return instance.put(endpoint, data);
  }
}
