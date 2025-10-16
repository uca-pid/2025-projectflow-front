import type { User } from "./user";
import type { Task } from "./task";

export type Invitation = {
  invitationId: string;
  inviterId: string;
  invitedId: string;
  taskId: string;

  inviter: User;
  task: Task;
};
