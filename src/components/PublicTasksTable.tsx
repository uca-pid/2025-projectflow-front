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
import { ChevronRight, ChevronDown } from "lucide-react";
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
};

function TaskRow({
  task,
  level = 0,
  expandedTasks,
  toggleTask,
}: {
  task: Task;
  level?: number;
  expandedTasks: Set<string>;
  toggleTask: (taskId: string) => void;
}) {
  const hasSubtasks = task.subTasks && task.subTasks.length > 0;
  const isExpanded = expandedTasks.has(task?.id);

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
                onClick={() => toggleTask(task?.id)}
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
            {(() => {
              const StatusIcon = getStatusIcon(task.status);
              return (
                <>
                  <StatusIcon
                    className={`w-3 h-3 mr-1 ${task.status === "IN_PROGRESS" ? "animate-spin" : ""}`}
                  />
                  {getStatusLabel(task.status)}
                </>
              );
            })()}
          </Badge>
        </TableCell>
      </TableRow>

      {isExpanded &&
        hasSubtasks &&
        task.subTasks!.map((subTask) => (
          <TaskRow
            key={subTask?.id}
            task={subTask as Task}
            level={level + 1}
            expandedTasks={expandedTasks}
            toggleTask={toggleTask}
          />
        ))}
    </>
  );
}

export function PublicTasksTable({ tasks }: AssignedTasksTableProps) {
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

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Could not access tasks</div>
        <p className="text-gray-400">
          Make sure they exist, you are accepted as a viewer, or are public
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRow
              key={task?.id}
              task={task}
              expandedTasks={expandedTasks}
              toggleTask={toggleTask}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
