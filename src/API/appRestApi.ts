import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";


const baseURL = import.meta.env.VITE_API_BASE_URL+"/"                                   ;

const instance: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

let activeRequestsCount = 0;
let globalLoaderCallback: ((loading: boolean) => void) | null = null;

const updateLoaderState = () => {
  if (globalLoaderCallback) {
    globalLoaderCallback(activeRequestsCount > 0);
  }
};

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    activeRequestsCount++;
    updateLoaderState();
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    if (activeRequestsCount > 0) activeRequestsCount--;
    updateLoaderState();
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (activeRequestsCount > 0) activeRequestsCount--;
    updateLoaderState();
    return response.data;
  },
  (error: AxiosError) => {
    if (activeRequestsCount > 0) activeRequestsCount--;
    updateLoaderState();
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error.response?.data ?? error.message);
  },
);

export class AppClient {
  static setGlobalLoaderCallback(callback: (loading: boolean) => void) {
    globalLoaderCallback = callback;
  }

  static get<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    return instance.get(endpoint, { params });
  }

  static post<T = any>(endpoint: string, data: Record<string, any> = {}): Promise<T> {
    return instance.post(endpoint, data);
  }

  static put<T = any>(endpoint: string, data: Record<string, any> = {}): Promise<T> {
    return instance.put(endpoint, data);
  }

  static delete<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    return instance.delete(endpoint, { params });
  }
}
