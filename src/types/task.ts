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

export interface Objective {
  objectiveId: string;
  taskId: string;
  objective: string;
  taskGoal: number;
  period: "DAY" | "WEEK" | "MONTH" | "YEAR";
}

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
  subscribedUsers: Partial<User>[];
  parentTaskId: string | null;
  parentTask: Partial<Task> | null;
  recurrenceType: RecurrenceType | null;
  recurrenceExpiresAt: string | null;
  recurrences: number | null;
  subTasks: Partial<Task>[];
  notes?: Note[];
  objectives?: Objective[];
}

export type RecurrenceType = "DAILY" | "WEEKLY" | "MONTHLY" | "PARENT";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type TaskType = "my" | "assigned" | "subscribed";

export type ViewType = "tree" | "kanban" | "table";

export interface TasksUseState {
  my: Task[];
  assigned: Task[];
  subscribed: Task[];
}
