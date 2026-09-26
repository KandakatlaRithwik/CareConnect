import { apiPost, apiPatch, apiGet } from "@/lib/api";
import type { AuthResponse, AuthUser, UserRole } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) => apiPost<AuthResponse>("/auth/register", payload),
  login: (payload: LoginPayload) => apiPost<AuthResponse>("/auth/login", payload),
  logout: () => apiPost<{ message: string }>("/auth/logout", {}),
  forgotPassword: (email: string) => apiPost<{ message: string }>("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    apiPost<{ message: string }>("/auth/reset-password", { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiPatch<{ message: string }>("/auth/change-password", { currentPassword, newPassword }),
  getProfile: () => apiGet<AuthUser>("/users/profile"),
};
