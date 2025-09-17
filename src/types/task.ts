export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
}
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

