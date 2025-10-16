import type { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Check,
  LoaderCircle,
  Ban,
} from "lucide-react";

type PublicTasksKanbanProps = {
  tasks: Task[];
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

function TaskCard({ task }: { task: Task }) {
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {task.description}
        </div>
        
        <div className="text-xs text-muted-foreground mb-2">
          {formatDeadline(new Date(task.deadline))}
        </div>

        <div className="flex items-center justify-between">
          <Badge
            className={`${getStatusTailwind(task.status)} text-xs`}
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
          
          {hasSubTasks && (
            <span className="text-xs text-muted-foreground">
              {task.subTasks!.length} subtask{task.subTasks!.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ 
  title, 
  tasks 
}: { 
  title: string; 
  tasks: Task[];
}) {
  return (
    <div className="flex-1 min-h-0 bg-gray-50 rounded-lg p-4">
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
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

export function PublicTasksKanban({ tasks }: PublicTasksKanbanProps) {
  // Group tasks by status
  const todoTasks = tasks.filter(task => task.status === "TODO");
  const inProgressTasks = tasks.filter(task => task.status === "IN_PROGRESS");
  const doneTasks = tasks.filter(task => task.status === "DONE");
  const cancelledTasks = tasks.filter(task => task.status === "CANCELLED");

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
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      <KanbanColumn
        title="To Do"
        tasks={todoTasks}
      />
      <KanbanColumn
        title="In Progress"
        tasks={inProgressTasks}
      />
      <KanbanColumn
        title="Completed"
        tasks={doneTasks}
      />
      <KanbanColumn
        title="Cancelled"
        tasks={cancelledTasks}
      />
    </div>
  );
}