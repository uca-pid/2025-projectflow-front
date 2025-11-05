import type { User } from "./user";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  isPublic: boolean;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: Partial<User> | null;
  completedById: string | null;
  completedBy: Partial<User> | null;
  completedAt: string | null;
  assignedUsers: Partial<User>[];
  appliedUsers: Partial<User>[];
  trackedUsers: Partial<User>[];
  parentTaskId: string | null;
  parentTask: Partial<Task> | null;
  subTasks: Partial<Task>[];
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type TaskType = "my" | "assigned" | "tracked";

export type ViewType = "tree" | "kanban" | "table";

export interface TasksUseState {
  my: Task[];
  assigned: Task[];
  tracked: Task[];
}
