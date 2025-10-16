import type { User } from "./user";

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
  assignedUsers: Partial<User>[];
  appliedUsers: Partial<User>[];
  parentTaskId: string | null;
  parentTask: Partial<Task> | null;
  subTasks: Partial<Task>[];
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
