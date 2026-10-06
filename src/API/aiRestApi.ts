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
  // ต้องนานกว่าผลรวม <NAME>_TIMEOUT_MS ของทุกตัวใน LLM_CHAIN ไม่งั้นหน้าจอเลิกรอทั้งที่ backend ยังสร้างร่างอยู่
  timeout: 300000,
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
    // ส่งเป็น object เสมอ — ถ้าส่งสตริงตอน timeout/เน็ตหลุด service ที่อ่าน error.message จะได้ undefined
    return Promise.reject(
      error.response?.data ?? { message: error.message, code: error.code },
    );
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
  // ใช้กับการลบแบบ cascade ของ admin ด้วย — goal/user ที่มีข้อมูลนักศึกษาเยอะอาจเกิน 5 วินาทีของ AppClient
  static delete<T = any>(endpoint: string): Promise<T> {
    return instance.delete(endpoint);
  }
}
