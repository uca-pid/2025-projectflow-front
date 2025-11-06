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
  MoreHorizontal,
  Flame,
  Pause,
  GitBranchPlus,
  ChevronRight,
  ChevronDown,
  Check,
  Ban,
  Eye,
} from "lucide-react";
import { useState } from "react";
import {
  getStatusVariant,
  getStatusTailwind,
  getStatusIcon,
  getStatusLabel,
  formatDeadline,
} from "@/lib/task-status-utils";

type AssignedTasksTableProps = {
  tasks: Task[];
  setSelectedTask: (task: Task | null) => void;
  updateTask: (task: Task) => Promise<void>;
  openCreateSubTask?: (open: boolean) => void;
  openDetailsModal?: (open: boolean) => void;
};

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
  onDetailsModal,
}: {
  task: Task;
  level?: number;
  expandedTasks: Set<string>;
  toggleTask: (taskId: string) => void;
  onCancelTask?: (task: Task) => void;
  onStartTask?: (task: Task) => void;
  onPauseTask?: (task: Task) => void;
  onCompleteTask?: (task: Task) => void;
  onCreateSubTask?: (task: Task) => void;
  onDetailsModal?: (task: Task) => void;
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
            <>
              {(() => {
                const StatusIcon = getStatusIcon(task.status);
                return (
                  <StatusIcon
                    className={`w-3 h-3 mr-1 ${task.status === "IN_PROGRESS" && "animate-spin"}`}
                  />
                );
              })()}
              {getStatusLabel(task.status)}
            </>
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
              <DropdownMenuItem onClick={() => onDetailsModal!(task)}>
                <Eye className="mr-2 h-4 w-4" />
                Details
              </DropdownMenuItem>
              {task.status === "TODO" && (
                <DropdownMenuItem onClick={() => onStartTask!(task)}>
                  <Flame className="mr-2 h-4 w-4" />
                  Start Working
                </DropdownMenuItem>
              )}
              {task.status === "IN_PROGRESS" && (
                <DropdownMenuItem onClick={() => onPauseTask!(task)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Halt
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onCompleteTask!(task)}>
                <Check className="mr-2 h-4 w-4" />
                Complete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCancelTask!(task)}
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
  setSelectedTask,
  updateTask,
  openCreateSubTask,
  openDetailsModal,
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

  function onCreateSubTask(task: Task) {
    setSelectedTask(task);
    openCreateSubTask?.(true);
  }

  async function onCancelTask(task: Task) {
    const updatedTask = { ...task, status: "CANCELLED" };
    if (!updateTask) console.log("updateTask is undefined");
    await updateTask(updatedTask);
  }

  async function onStartTask(task: Task) {
    const updatedTask = { ...task, status: "IN_PROGRESS" };
    await updateTask(updatedTask);
  }

  async function onPauseTask(task: Task) {
    const updatedTask = { ...task, status: "TODO" };
    await updateTask(updatedTask);
  }

  async function onCompleteTask(task: Task) {
    const updatedTask = { ...task, status: "DONE" };
    await updateTask(updatedTask);
  }

  function onDetailsModal(task: Task) {
    setSelectedTask(task);
    openDetailsModal?.(true);
  }

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
              onDetailsModal={onDetailsModal}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
