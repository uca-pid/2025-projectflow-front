export type Achievement = {
  code: string;
  name: string;
  avatar: string;
  type: "TASK_COMPLETION" | "TASK_REVIEW" | "TASK_ACCEPT";
  required: number;
};
