import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import {
  Clock,
  Check,
  LoaderCircle,
  Ban,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  GitBranchPlus,
} from "lucide-react";
import { useState, useEffect } from "react";

import { getStatusTailwind, formatDeadline } from "@/lib/task-status-utils";
import type { Task } from "@/types/task";

type MyTasksKanbanProps = {
  tasks: Task[];
  setSelectedTask: (task: Task | null) => void;
  openEditModal?: (open: boolean) => void;
  openDeleteModal?: (open: boolean) => void;
  openAssignModal?: (open: boolean) => void;
  openSubtaskModal?: (open: boolean) => void;
  updateTask?: (task: Task) => void;
};

function TaskCard({
  task,
  onEditTask,
  onDeleteTask,
  onAssignTask,
  onCreateSubTask,
  isDragging = false,
}: {
  task: Task;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onAssignTask?: (task: Task) => void;
  onCreateSubTask?: (task: Task) => void;
  isDragging?: boolean;
}) {
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: task.id,
    data: {
      task,
    },
  });

  const style = {
    opacity: isDragging ? 0 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${getStatusTailwind(task.status)}`}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEditTask && (
                <DropdownMenuItem onClick={() => onEditTask(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onAssignTask && (
                <DropdownMenuItem onClick={() => onAssignTask(task)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </DropdownMenuItem>
              )}
              {onCreateSubTask && (
                <DropdownMenuItem onClick={() => onCreateSubTask(task)}>
                  <GitBranchPlus className="mr-2 h-4 w-4" />
                  Create Subtask
                </DropdownMenuItem>
              )}
              {onDeleteTask && (
                <DropdownMenuItem onClick={() => onDeleteTask(task)}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                  <p className="text-red-600">Delete</p>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
  onEditTask,
  onDeleteTask,
  onAssignTask,
  onCreateSubTask,
  activeTaskId,
}: {
  title: string;
  status: string;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: Task) => void;
  onAssignTask?: (task: Task) => void;
  onCreateSubTask?: (task: Task) => void;
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
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onAssignTask={onAssignTask}
            onCreateSubTask={onCreateSubTask}
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

export function MyTasksKanban({
  tasks = [],
  setSelectedTask,
  openEditModal,
  openDeleteModal,
  openAssignModal,
  openSubtaskModal,
  updateTask,
}: MyTasksKanbanProps) {
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

    updateTask?.({ ...task, status: newStatus });
  }

  function handleOpenEdit(task: Task) {
    openEditModal?.(true);
    setSelectedTask?.(task);
  }

  function handleOpenDelete(task: Task) {
    openDeleteModal?.(true);
    setSelectedTask?.(task);
  }

  function handleOpenAssign(task: Task) {
    openAssignModal?.(true);
    setSelectedTask?.(task);
  }

  function handleOpenSubtask(task: Task) {
    openSubtaskModal?.(true);
    setSelectedTask?.(task);
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
          onEditTask={handleOpenEdit}
          onDeleteTask={handleOpenDelete}
          onAssignTask={handleOpenAssign}
          onCreateSubTask={handleOpenSubtask}
          activeTaskId={activeTask?.id}
        />
        <KanbanColumn
          title="In Progress"
          status="IN_PROGRESS"
          tasks={inProgressTasks}
          onEditTask={handleOpenEdit}
          onDeleteTask={handleOpenDelete}
          onAssignTask={handleOpenAssign}
          onCreateSubTask={handleOpenSubtask}
          activeTaskId={activeTask?.id}
        />
        <KanbanColumn
          title="Completed"
          status="DONE"
          tasks={doneTasks}
          onEditTask={handleOpenEdit}
          onDeleteTask={handleOpenDelete}
          onAssignTask={handleOpenAssign}
          onCreateSubTask={handleOpenSubtask}
          activeTaskId={activeTask?.id}
        />
        <KanbanColumn
          title="Cancelled"
          status="CANCELLED"
          tasks={cancelledTasks}
          onEditTask={handleOpenEdit}
          onDeleteTask={handleOpenDelete}
          onAssignTask={handleOpenAssign}
          onCreateSubTask={handleOpenSubtask}
          activeTaskId={activeTask?.id}
        />
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleOpenDelete}
            onAssignTask={handleOpenAssign}
            onCreateSubTask={handleOpenSubtask}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
