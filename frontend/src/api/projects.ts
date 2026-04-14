import { api } from "./client";
import type { Project, ProjectDetail, Task } from "../types/models";

export const getProjects = async () => {
  const { data } = await api.get<{ projects: Project[] }>("/projects");
  return data.projects;
};

export const createProject = async (payload: { name: string; description?: string }) => {
  const { data } = await api.post<Project>("/projects", payload);
  return data;
};

export const getProjectById = async (id: string) => {
  const { data } = await api.get<ProjectDetail>(`/projects/${id}`);
  return data;
};

export const getTasks = async (projectId: string, status?: string, assignee?: string) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (assignee) params.set("assignee", assignee);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const { data } = await api.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks${suffix}`);
  return data.tasks;
};

export const createTask = async (projectId: string, payload: Record<string, unknown>) => {
  const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, payload);
  return data;
};

export const updateTask = async (taskId: string, payload: Record<string, unknown>) => {
  const { data } = await api.patch<Task>(`/tasks/${taskId}`, payload);
  return data;
};

export const deleteTask = async (taskId: string) => {
  await api.delete(`/tasks/${taskId}`);
};
