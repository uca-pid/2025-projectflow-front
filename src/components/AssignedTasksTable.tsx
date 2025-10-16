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
  Check,
  LoaderCircle,
  Ban,
  MoreHorizontal,
  Flame,
  Pause,
  GitBranchPlus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

type AssignedTasksTableProps = {
  tasks: Task[];
  onCancelTask?: (taskId: string) => void;
  onStartTask?: (taskId: string) => void;
  onPauseTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onCreateSubTask?: (task: Task) => void;
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

function TaskRow({
  task,
  level = 0,
  expandedTasks,
  toggleTask,
  onCancelTask,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onCreateSubTask,
}: {
  task: Task;
  level?: number;
  expandedTasks: Set<string>;
  toggleTask: (taskId: string) => void;
  onCancelTask?: (taskId: string) => void;
  onStartTask?: (taskId: string) => void;
  onPauseTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onCreateSubTask?: (task: Task) => void;
}) {
  const hasSubtasks = task.subTasks && task.subTasks.length > 0;
  const isExpanded = expandedTasks.has(task.id);

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell>
          <div
            className="flex items-center"
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {hasSubtasks ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2"
                onClick={() => toggleTask(task.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6 mr-2" />
            )}
            <div className="font-medium">{task.title}</div>
          </div>
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
                disabled={task.status === "DONE" || task.status === "CANCELLED"}
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onCreateSubTask!(task)}>
                <GitBranchPlus className="mr-2 h-4 w-4" />
                Add Subtask
              </DropdownMenuItem>
              {task.status === "TODO" && (
                <DropdownMenuItem onClick={() => onStartTask!(task.id)}>
                  <Flame className="mr-2 h-4 w-4" />
                  Start Working
                </DropdownMenuItem>
              )}
              {task.status === "IN_PROGRESS" && (
                <DropdownMenuItem onClick={() => onPauseTask!(task.id)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Halt
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onCompleteTask!(task.id)}>
                <Check className="mr-2 h-4 w-4" />
                Complete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCancelTask!(task.id)}
                className="text-red-600"
              >
                <Ban className="mr-2 h-4 w-4 text-red-600" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {isExpanded &&
        hasSubtasks &&
        task.subTasks!.map((subTask) => (
          <TaskRow
            key={subTask.id}
            task={subTask as Task}
            level={level + 1}
            expandedTasks={expandedTasks}
            toggleTask={toggleTask}
            onCancelTask={onCancelTask}
            onStartTask={onStartTask}
            onPauseTask={onPauseTask}
            onCompleteTask={onCompleteTask}
            onCreateSubTask={onCreateSubTask}
          />
        ))}
    </>
  );
}

export function AssignedTasksTable({
  tasks,
  onCancelTask,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onCreateSubTask,
}: AssignedTasksTableProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No tasks assigned</div>
        <p className="text-gray-400">
          You don&apos;t have any tasks assigned, get invited to one!
        </p>
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
            <TaskRow
              key={task.id}
              task={task}
              expandedTasks={expandedTasks}
              toggleTask={toggleTask}
              onCancelTask={onCancelTask}
              onStartTask={onStartTask}
              onPauseTask={onPauseTask}
              onCompleteTask={onCompleteTask}
              onCreateSubTask={onCreateSubTask}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
