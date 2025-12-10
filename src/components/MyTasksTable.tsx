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
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  MoreHorizontal,
  Trash2,
  Edit,
  GitBranchPlus,
  ChevronRight,
  ChevronDown,
  Eye,
  Repeat,
  TriangleAlert,
} from "lucide-react";
import { getTaskSlaIcon } from "./TaskSlaIcon";
import { useState } from "react";
import {
  getStatusVariant,
  getStatusTailwind,
  getStatusIcon,
  getStatusLabel,
  formatDeadline,
} from "@/lib/task-status-utils";
import { getRemainingSLA } from "@/lib/task-utils";
import { type Task } from "@/types/task";

type MyTasksTableProps = {
  tasks: Task[];
  setSelectedTask: (task: Task) => void;
  openEditModal?: (open: boolean) => void;
  openDeleteModal?: (open: boolean) => void;
  openAssignModal?: (open: boolean) => void;
  openSubtaskModal?: (open: boolean) => void;
  openDetailsModal?: (open: boolean) => void;
  openSlaModal?: (open: boolean) => void;
};

function TaskRow({
  task,
  level = 0,
  expandedTasks,
  toggleTask,
  onEditTask,
  onDeleteTask,
  onAssignTask,
  onCreateSubTask,
  onViewDetails,
  onSlaModal,
}: {
  task: Task;
  level?: number;
  expandedTasks: Set<string>;
  toggleTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onAssignTask?: (task: Task) => void;
  onCreateSubTask?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  onSlaModal?: (task: Task) => void;
}) {
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;
  const isExpanded = expandedTasks.has(task.id);

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell>
          <div
            className="flex items-center"
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {hasSubTasks ? (
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
            {getTaskSlaIcon(task)}
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
            {task.sla && task.status !== "DONE" && (
              <span
                className={
                  "ml-2 text-xs" +
                  (task.sla === "NORMAL" ? " text-yellow-600" : " text-red-600")
                }
              >
                SLA:&nbsp;
                {getRemainingSLA(task.slaStartedAt!, task.sla).expired
                  ? "Expired"
                  : getRemainingSLA(task.slaStartedAt!, task.sla)
                      .remainingHours + " hours"}
              </span>
            )}
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
          {task.recurrenceType !== null && (
            <Badge variant="outline" className="ml-2">
              <Repeat className="w-3 h-4" />
            </Badge>
          )}
        </TableCell>

        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onViewDetails!(task)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateSubTask!(task)}>
                <GitBranchPlus className="mr-2 h-4 w-4" />
                Add Subtask
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditTask!(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignTask!(task)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSlaModal!(task)}
                className="text-yellow-700"
              >
                <TriangleAlert className="mr-2 h-4 w-4 text-yellow-700" />
                Set SLA
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteTask!(task)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {isExpanded &&
        hasSubTasks &&
        task.subTasks!.map((subTask) => (
          <TaskRow
            key={subTask.id}
            task={subTask as Task}
            level={level + 1}
            expandedTasks={expandedTasks}
            toggleTask={toggleTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onAssignTask={onAssignTask}
            onCreateSubTask={onCreateSubTask}
            onViewDetails={onViewDetails}
            onSlaModal={onSlaModal}
          />
        ))}
    </>
  );
}

export function MyTasksTable({
  tasks,
  setSelectedTask,
  openEditModal,
  openAssignModal,
  openSubtaskModal,
  openDeleteModal,
  openDetailsModal,
  openSlaModal,
}: MyTasksTableProps) {
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
        <div className="text-gray-500 text-lg mb-2">No tasks created</div>
        <p className="text-gray-400">Create your first task to get started</p>
      </div>
    );
  }

  function onEditTask(task: Task) {
    setSelectedTask(task);
    openEditModal?.(true);
  }

  function onDeleteTask(task: Task) {
    setSelectedTask(task);
    openDeleteModal?.(true);
  }

  function onAssignTask(task: Task) {
    setSelectedTask(task);
    openAssignModal?.(true);
  }

  function onCreateSubTask(task: Task) {
    setSelectedTask(task);
    openSubtaskModal?.(true);
  }

  function onViewDetails(task: Task) {
    setSelectedTask(task);
    openDetailsModal?.(true);
  }

  function onSlaModal(task: Task) {
    setSelectedTask(task);
    openSlaModal?.(true);
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
          {tasks
            .filter((task) => !task.parentTaskId)
            .map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                expandedTasks={expandedTasks}
                toggleTask={toggleTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onAssignTask={onAssignTask}
                onCreateSubTask={onCreateSubTask}
                onViewDetails={onViewDetails}
                onSlaModal={onSlaModal}
              />
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
