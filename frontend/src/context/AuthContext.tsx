import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/models";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (payload: { token: string; user: User }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    login: ({ token: newToken, user: nextUser }) => {
      setToken(newToken);
      setUser(nextUser);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    },
    logout: () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
