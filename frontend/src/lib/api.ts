import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Backend base URL. The Node/Express backend mounts routes under `/api/v1`,
// so this URL MUST include that prefix. Override with VITE_API_URL in .env.
//   Local:  http://localhost:5000/api/v1
//   Deploy: https://your-backend.onrender.com/api/v1
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000/api/v1";

const ACCESS_TOKEN_KEY = "cc_access_token";
const REFRESH_TOKEN_KEY = "cc_refresh_token";
const USER_KEY = "cc_user";

export const tokenStore = {
  get access() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(access: string | null, refresh?: string | null) {
    if (typeof window === "undefined") return;
    if (access) window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
    else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (refresh !== undefined) {
      if (refresh) window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};

export const userStore = {
  get<T = unknown>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set(user: unknown | null) {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  },
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.access;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken: refresh,
    });
    const newAccess: string | undefined =
      res.data?.data?.accessToken ?? res.data?.accessToken ?? res.data?.token;
    if (!newAccess) return null;
    tokenStore.set(newAccess, refresh);
    return newAccess;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshing = refreshing ?? refreshAccessToken();
    const newToken = await refreshing;
    refreshing = null;
    if (!newToken) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }
    if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
    return api.request(original);
  },
);

// Envelope: backend returns { success, message, data } — unwrap `.data`
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get(url, { params });
  return (res.data?.data ?? res.data) as T;
}
export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post(url, body);
  return (res.data?.data ?? res.data) as T;
}
export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.put(url, body);
  return (res.data?.data ?? res.data) as T;
}
export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch(url, body);
  return (res.data?.data ?? res.data) as T;
}
export async function apiDelete<T>(url: string): Promise<T> {
  const res = await api.delete(url);
  return (res.data?.data ?? res.data) as T;
}

export function extractErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Array<{ msg?: string }> } | undefined;
    if (data?.message) return data.message;
    if (data?.errors?.length && data.errors[0]?.msg) return data.errors[0].msg;
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
