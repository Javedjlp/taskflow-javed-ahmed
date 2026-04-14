import { api } from "./client";
import type { AuthResponse } from "../types/models";

export const register = async (payload: { name: string; email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};
