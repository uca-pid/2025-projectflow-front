export type User = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
};

export type TaskInvitation = {
  id: string;
  taskId: string;
  taskTitle: string;
  inviterEmail: string;
  inviterName: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
};
