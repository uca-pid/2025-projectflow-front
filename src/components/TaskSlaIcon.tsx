import type { Task } from "@/types/task";
import { CircleAlert, TriangleAlert } from "lucide-react";

export function getTaskSlaIcon(task: Task) {
  if (task.sla == "CRITICAL") {
    return <CircleAlert className="w-4 h-4 mr-2 bg-red-200 rounded-full" />;
  } else if (task.sla == "NORMAL") {
    return <TriangleAlert className="w-4 h-4 mr-2 fill-yellow-200" />;
  }
}
