import type { User } from "./user";

export interface Note {
  id: string;
  text: string;
  isPositive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: Partial<User>;
  taskId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  isPublic: boolean;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: Partial<User> | null;
  assignedUsers: Partial<User>[];
  appliedUsers: Partial<User>[];
  trackedUsers: Partial<User>[];
  parentTaskId: string | null;
  parentTask: Partial<Task> | null;
  subTasks: Partial<Task>[];
  notes?: Note[];
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type TaskType = "my" | "assigned" | "tracked";

export interface TasksUseState {
  my: Task[];
  assigned: Task[];
  tracked: Task[];
}
