export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string | null;
  createdBy: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = Project & {
  tasks: Task[];
};
