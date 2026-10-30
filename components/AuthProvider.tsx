"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, User } from "@/lib/api";

type AuthValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, nickname: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider 안에서만 쓸 수 있어요.");
  return value;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 처음 열 때 저장된 토큰으로 "지금 누구인지" 서버에 물어본다
  useEffect(() => {
    const request = getToken() ? api<User>("/auth/me") : Promise.resolve(null);
    request
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ token: string; user: User }>("/auth/login", { method: "POST", body: { email, password } });
    setToken(r.token);
    setUser(r.user);
  }, []);

  const signup = useCallback(async (email: string, nickname: string, password: string) => {
    const r = await api<{ token: string; user: User }>("/auth/signup", { method: "POST", body: { email, nickname, password } });
    setToken(r.token);
    setUser(r.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}
