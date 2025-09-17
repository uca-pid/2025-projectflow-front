export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface CreateTaskData {
  title: string;
  description: string;
  deadline: Date;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus;
}