import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "@/api";
import type { LoginPayload, RegisterPayload } from "@/api/auth";
import { tokenStore, userStore, extractErrorMessage } from "@/lib/api";
import type { AuthResponse, AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistAuthResponse(res: AuthResponse) {
  const access = res.accessToken || res.token;
  if (access) tokenStore.set(access, res.refreshToken ?? undefined);
  if (res.user) userStore.set(res.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    const stored = userStore.get<AuthUser>();
    if (stored) setUser(stored);
    // Verify token by fetching fresh profile in background
    if (tokenStore.access) {
      authApi
        .getProfile()
        .then((profile) => {
          setUser(profile);
          userStore.set(profile);
        })
        .catch(() => {
          // 401 handled by axios interceptor
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const res = await authApi.login(payload);
      persistAuthResponse(res);
      setUser(res.user);
      return res.user;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Login failed"));
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const res = await authApi.register(payload);
      persistAuthResponse(res);
      setUser(res.user);
      return res.user;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Registration failed"));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore network errors on logout */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      userStore.set(profile);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user && !!tokenStore.access,
      isReady,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isReady, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
