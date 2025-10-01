import type { User } from "./user";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assignedUsers: Partial<User>[];
  appliedUsers: Partial<User>[];
}
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
