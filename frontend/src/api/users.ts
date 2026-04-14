import { api } from "./client";
import type { User } from "../types/models";

export const getUsers = async () => {
  const { data } = await api.get<{ users: User[] }>("/users");
  return data.users;
};
