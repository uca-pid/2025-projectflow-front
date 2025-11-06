import type { Task } from "@/types/task";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock, Check, LoaderCircle, Ban } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { getStatusTailwind, formatDeadline } from "@/lib/task-status-utils";

type AssignedTasksKanbanProps = {
  tasks: Task[];
  setSelectedTask: (task: Task | null) => void;
  openDeleteModal?: (open: boolean) => void;
  openAssignModal?: (open: boolean) => void;
  updateTask?: (task: Task) => Promise<void>;
};

function isBlockedTask(task: Task): boolean {
  return task.status === "DONE" || task.status === "CANCELLED";
}

function TaskCard({
  task,
  isDragging = false,
}: {
  task: Task;
  onDeleteTask?: (task: Task) => void;
  onAssignTask?: (task: Task) => void;
  isDragging?: boolean;
}) {
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;

  const isBlocked = isBlockedTask(task);

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: task.id,
    data: {
      task,
    },
    disabled: isBlocked, // Disable dragging for blocked tasks
  });

  const style = {
    opacity: isDragging ? 0 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(!isBlocked ? listeners : {})} // Only apply listeners if not blocked
      {...(!isBlocked ? attributes : {})} // Only apply attributes if not blocked
      className={`mb-3 hover:shadow-md transition-shadow ${
        isBlocked
          ? "cursor-not-allowed opacity-75"
          : "cursor-grab active:cursor-grabbing"
      } ${getStatusTailwind(task.status)}`}
    >
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
  status,
  tasks,
  onDeleteTask,
  onAssignTask,
  activeTaskId,
}: {
  title: string;
  status: string;
  tasks: Task[];
  onDeleteTask?: (task: Task) => void;
  onAssignTask?: (task: Task) => void;
  activeTaskId?: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-0 bg-gray-50 rounded-lg p-4 m-3 transition-colors ${
        isOver ? "bg-gray-200 ring-2 ring-blue-400" : ""
      }`}
    >
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
          <TaskCard
            key={task.id}
            task={task}
            onDeleteTask={onDeleteTask}
            onAssignTask={onAssignTask}
            isDragging={task.id === activeTaskId}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            {isOver ? "Drop here" : "No tasks"}
          </div>
        )}
      </div>
    </div>
  );
}

export function AssignedTasksKanban({
  tasks = [],
  setSelectedTask,
  openDeleteModal,
  openAssignModal,
  updateTask,
}: AssignedTasksKanbanProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

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

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = active.data.current?.task as Task;
    setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const task = active.data.current?.task as Task;
    const newStatus = over.id as string;

    // If dropped in the same column, do nothing
    if (task.status === newStatus) return;

    // Call the appropriate callback based on the new status
    updateTask?.({ ...task, status: newStatus });
  }

  function onDeleteTask(task: Task) {
    setSelectedTask(task);
    openDeleteModal?.(true);
  }

  function onAssignTask(task: Task) {
    setSelectedTask(task);
    openAssignModal?.(true);
  }

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        <KanbanColumn
          title="To Do"
          status="TODO"
          tasks={todoTasks}
          onDeleteTask={onDeleteTask}
          onAssignTask={onAssignTask}
          activeTaskId={activeTask?.id}
        />
        <KanbanColumn
          title="In Progress"
          status="IN_PROGRESS"
          tasks={inProgressTasks}
          onDeleteTask={onDeleteTask}
          onAssignTask={onAssignTask}
          activeTaskId={activeTask?.id}
        />
        <KanbanColumn
          title="Completed"
          status="DONE"
          tasks={doneTasks}
          onDeleteTask={onDeleteTask}
          onAssignTask={onAssignTask}
          activeTaskId={activeTask?.id}
        />
        <KanbanColumn
          title="Cancelled"
          status="CANCELLED"
          tasks={cancelledTasks}
          onDeleteTask={onDeleteTask}
          onAssignTask={onAssignTask}
          activeTaskId={activeTask?.id}
        />
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onDeleteTask={onDeleteTask}
            onAssignTask={onAssignTask}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
