import type { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TasksTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

function getStatusColor(
  status: string,
): "secondary" | "outline" | "destructive" | "default" | undefined {
  switch (status) {
    case "DONE":
      return "secondary";
    case "IN_PROGRESS":
      return "outline";
    case "CANCELLED":
      return "destructive";
    case "TODO":
      return "default";
    default:
      return "default";
  }
}

function formatDeadline(date: Date): string {
  const now = new Date();
  const deadline = new Date(date);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = deadline.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays < 0) {
    return `${formattedDate} (Overdue)`;
  } else if (diffDays === 0) {
    return `${formattedDate} (Today)`;
  } else if (diffDays === 1) {
    return `${formattedDate} (Tomorrow)`;
  } else {
    return `${formattedDate} (${diffDays} days)`;
  }
}

export function TasksTable({
  tasks,
  onEditTask,
  onDeleteTask,
}: TasksTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No tasks created</div>
        <p className="text-gray-400">Create your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deadline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {task.title}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 max-w-xs truncate">
                  {task.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDeadline(new Date(task.deadline))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getStatusColor(task.status)}>
                  {task.status === "TODO" && "Pending"}
                  {task.status === "IN_PROGRESS" && "In Progress"}
                  {task.status === "DONE" && "Completed"}
                  {task.status === "CANCELLED" && "Cancelled"}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditTask(task)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
