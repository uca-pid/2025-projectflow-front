import type { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  UserPlus,
  Check,
  LoaderCircle,
  Ban,
  MoreHorizontal,
  Trash2,
  Edit,
  Flame,
  Pause,
} from "lucide-react";

type TasksTableProps = {
  tasks: Task[];
  isOwner?: boolean;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onCancelTask?: (taskId: string) => void;
  onStartTask?: (taskId: string) => void;
  onPauseTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onAssignTask?: (taskId: string) => void;
};

function getStatusVariant(
  status: string,
): "secondary" | "outline" | "destructive" | "default" | undefined {
  switch (status) {
    case "DONE":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "TODO":
      return "outline";
    default:
      return undefined;
  }
}

function getStatusTailwind(status: string): string {
  switch (status) {
    case "DONE":
      return "bg-green-100 border border-green-400 text-green-800";
    case "IN_PROGRESS":
      return "bg-blue-100 border border-blue-400 text-blue-800";
    case "CANCELLED":
      return "bg-red-100 border border-red-400 text-red-800";
    case "TODO":
      return "bg-gray-100 border border-gray-400 text-gray-800";
    default:
      return "bg-gray-100 border border-gray-400 text-gray-800";
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
  isOwner = false,
  onCancelTask,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onAssignTask,
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
    <div className="rounded-md border shadow bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TASK
            </TableHead>
            <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              DESCRIPTION
            </TableHead>
            <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              DEADLINE
            </TableHead>
            <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              STATUS
            </TableHead>
            <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <div className="font-medium">{task.title}</div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-muted-foreground max-w-xs truncate">
                  {task.description}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm">
                  {formatDeadline(new Date(task.deadline))}
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  className={getStatusTailwind(task.status)}
                  variant={getStatusVariant(task.status)}
                >
                  {task.status === "TODO" && (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </>
                  )}
                  {task.status === "IN_PROGRESS" && (
                    <>
                      <LoaderCircle className="w-3 h-3 mr-1 animate-spin" />
                      In Progress
                    </>
                  )}
                  {task.status === "DONE" && (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Completed
                    </>
                  )}
                  {task.status === "CANCELLED" && (
                    <>
                      <Ban className="w-4 h-4 mr-1" />
                      Cancelled
                    </>
                  )}
                </Badge>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={
                        (task.status === "DONE" ||
                          task.status === "CANCELLED") &&
                        !isOwner
                      }
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {isOwner && onEditTask && onDeleteTask && (
                      <>
                        <DropdownMenuItem onClick={() => onEditTask(task)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onAssignTask!(task.id)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteTask(task.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    {!isOwner &&
                      onCancelTask &&
                      onStartTask &&
                      onPauseTask &&
                      onCompleteTask && (
                        <>
                          {task.status === "TODO" && (
                            <DropdownMenuItem
                              onClick={() => onStartTask(task.id)}
                            >
                              <Flame className="mr-2 h-4 w-4" />
                              Start Working
                            </DropdownMenuItem>
                          )}
                          {task.status === "IN_PROGRESS" && (
                            <DropdownMenuItem
                              onClick={() => onPauseTask(task.id)}
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Halt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onCompleteTask(task.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onCancelTask(task.id)}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4 text-red-600" />
                            Cancel
                          </DropdownMenuItem>
                        </>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
