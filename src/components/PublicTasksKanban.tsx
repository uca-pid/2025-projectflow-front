import type { Task } from "@/types/task";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock, Check, LoaderCircle, Ban } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getStatusTailwind,
  formatDeadline,
} from "@/lib/task-status-utils";

type MyTasksKanbanProps = {
  tasks: Task[];
};

function TaskCard({ task }: { task: Task }) {
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;

  return (
    <Card className={`mb-3 hover:shadow-md  ${getStatusTailwind(task.status)}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex gap-x-2 items-center">
            {task.status === "TODO" && <Clock className="w-4 h-4" />}
            {task.status === "IN_PROGRESS" && (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            )}
            {task.status === "DONE" && <Check className="w-4 h-4" />}
            {task.status === "CANCELLED" && <Ban className="w-4 h-4" />}
            {task.title}
          </CardTitle>
        </div>
        <CardDescription>
          <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {formatDeadline(new Date(task.deadline))}
          </div>

          <div className="flex items-center justify-between">
            {task.parentTaskId && (
              <span className="text-xs text-muted-foreground">
                Subtask of {task.parentTask?.title}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between">
            {hasSubTasks && (
              <span className="text-xs text-muted-foreground">
                {task.subTasks!.length} subtask
                {task.subTasks!.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function KanbanColumn({
  title,
  tasks,
}: {
  title: string;
  status: string;
  tasks: Task[];
  onDeleteTask?: (taskId: string) => void;
  onAssignTask?: (task: Task) => void;
  activeTaskId?: string | null;
}) {
  return (
    <div className="flex-1 min-h-0 bg-gray-50 rounded-lg p-4 m-3 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm text-gray-700 uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export function PublicTasksKanban({ tasks = [] }: MyTasksKanbanProps) {
  // Group tasks by status
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [cancelledTasks, setCancelledTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTodoTasks(tasks.filter((task) => task.status === "TODO"));
    setInProgressTasks(tasks.filter((task) => task.status === "IN_PROGRESS"));
    setDoneTasks(tasks.filter((task) => task.status === "DONE"));
    setCancelledTasks(tasks.filter((task) => task.status === "CANCELLED"));
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No tasks created yet</div>
        <p className="text-gray-400">
          Create your first task to get started with project management
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      <KanbanColumn title="To Do" status="TODO" tasks={todoTasks} />
      <KanbanColumn
        title="In Progress"
        status="IN_PROGRESS"
        tasks={inProgressTasks}
      />
      <KanbanColumn title="Completed" status="DONE" tasks={doneTasks} />
      <KanbanColumn
        title="Cancelled"
        status="CANCELLED"
        tasks={cancelledTasks}
      />
    </div>
  );
}

