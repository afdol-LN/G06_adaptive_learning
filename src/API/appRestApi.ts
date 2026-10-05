import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";


// Opt-out of the full-screen GlobalLoader for a request that shows its own loading state
// (e.g. submitting an answer — the button shows "checking…" and the rest of the page stays usable)
declare module "axios" {
  interface AxiosRequestConfig {
    skipGlobalLoader?: boolean;
  }
}

export interface AppRequestOptions {
  skipGlobalLoader?: boolean;
  /** override the 60s default for one request (ms) */
  timeout?: number;
}

const baseURL = import.meta.env.VITE_API_BASE_URL+"/"                                   ;

const instance: AxiosInstance = axios.create({
  baseURL: baseURL,
  // 60s, not 5s: a free-tier host (Render) sleeps when idle and the first request wakes it (~30–60s)
  timeout: 60000,
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

// only requests that raised the count may lower it — a skipped request never touches it
const requestDone = (config?: { skipGlobalLoader?: boolean }) => {
  if (config?.skipGlobalLoader) return;
  if (activeRequestsCount > 0) activeRequestsCount--;
  updateLoaderState();
};

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.skipGlobalLoader) {
      activeRequestsCount++;
      updateLoaderState();
    }
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    requestDone(error.config);
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    requestDone(response.config);
    return response.data;
  },
  (error: AxiosError) => {
    requestDone(error.config);
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

  static post<T = any>(endpoint: string, data: Record<string, any> = {}, options: AppRequestOptions = {}): Promise<T> {
    return instance.post(endpoint, data, options);
  }

  static put<T = any>(endpoint: string, data: Record<string, any> = {}): Promise<T> {
    return instance.put(endpoint, data);
  }

  static patch<T = any>(endpoint: string, data: Record<string, any> = {}): Promise<T> {
    return instance.patch(endpoint, data);
  }

  static delete<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    return instance.delete(endpoint, { params });
  }
}
