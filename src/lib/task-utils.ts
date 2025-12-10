import type { Task } from "@/types/task";

// Tree traversal utilities
export function findTask(taskList: Partial<Task>[], id: string): Task | null {
  for (const task of taskList) {
    if (task.id === id) return task as Task;
    if (task.subTasks?.length) {
      const found = findTask(task.subTasks, id);
      if (found) return found;
    }
  }
  return null;
}

export function flattenTasks(tasks: Partial<Task>[]): Task[] {
  const map = new Map<string, Task>();

  function traverse(list: Partial<Task>[]) {
    for (const task of list) {
      if (task?.id) map.set(task.id, task as Task);
      if (task?.subTasks?.length) traverse(task?.subTasks);
    }
  }

  traverse(tasks);
  return Array.from(map.values());
}

// Recursive task tree operations
export function updateTaskInTree(
  taskList: Partial<Task>[],
  id: string,
  updatedFields: Partial<Task>,
): Task[] {
  return taskList.map((task) => {
    if (task.id === id) {
      return { ...task, ...updatedFields };
    }
    if (task.subTasks?.length) {
      return {
        ...task,
        subTasks: updateTaskInTree(task.subTasks, id, updatedFields),
      };
    }
    return task;
  }) as Task[];
}

export function addSubTaskToTree(
  taskList: Partial<Task>[],
  parentId: string,
  newTask: Task,
): Task[] {
  return taskList.map((task) => {
    if (task.id === parentId) {
      return {
        ...task,
        subTasks: [...(task.subTasks || []), newTask],
      };
    }
    if (task.subTasks?.length) {
      return {
        ...task,
        subTasks: addSubTaskToTree(task.subTasks, parentId, newTask),
      };
    }
    return task;
  }) as Task[];
}

export function deleteTaskFromTree(
  taskList: Partial<Task>[],
  taskIdToDelete: string,
): Task[] {
  return taskList
    .filter((task) => task.id !== taskIdToDelete)
    .map((task) => {
      if (task.subTasks?.length) {
        return {
          ...task,
          subTasks: deleteTaskFromTree(task.subTasks, taskIdToDelete),
        };
      }
      return task;
    }) as Task[];
}

// Task validation utilities
export function areAllSubtasksTerminal(task: Task): boolean {
  if (!task.subTasks || task.subTasks.length === 0) return true;

  for (const subtask of task.subTasks) {
    const sub = subtask as Task;
    if (
      (sub.status !== "DONE" && sub.status !== "CANCELLED") ||
      !areAllSubtasksTerminal(sub)
    ) {
      return false;
    }
  }

  return true;
}

// Recursive status update for cancellation
export async function cancelSubtasks(
  task: Task,
  updateTask?: (task: Task) => Promise<void>,
  cancel: boolean = true,
): Promise<Task> {
  for (const subtask of task.subTasks || []) {
    subtask.status = cancel ? "CANCELLED" : "TODO";
    await updateTask?.(subtask as Task);
    await cancelSubtasks(subtask as Task, updateTask, cancel);
  }
  return task;
}

// I am not a mere validation checker, I AM THE VALIDATOR, you will become valid BY FORCE
export async function validateTaskUpdate(
  newTask: Task,
  oldTask: Task,
  updateTask: (task: Task) => Promise<void>,
): Promise<{ valid: boolean; message: string }> {
  if (newTask.status === "DONE" && oldTask.status !== "DONE") {
    if (!areAllSubtasksTerminal(newTask)) {
      return {
        valid: false,
        message:
          "All subtasks must be terminal before marking the task as done.",
      };
    }
  }
  if (newTask.status === "CANCELLED" && oldTask.status !== "CANCELLED") {
    if (!areAllSubtasksTerminal(newTask)) {
      await cancelSubtasks(newTask, updateTask);
      return { valid: true, message: "Task update has been validated" };
    }
  }

  if (newTask.status !== "CANCELLED" && oldTask.status === "CANCELLED") {
    await cancelSubtasks(newTask, updateTask, false);
    return { valid: true, message: "Task update has been validated" };
  }

  return { valid: true, message: "Task update is valid" };
}

// SLA Utilities
export function getRemainingSLA(startedAt: string | Date, slaLevel: string) {
  const start = new Date(startedAt);
  const now = new Date();

  let due: Date;

  if (slaLevel === "CRITICAL") {
    due = new Date(start.getTime() + 48 * 60 * 60 * 1000);
  } else if (slaLevel === "NORMAL") {
    due = addBusinessDays(start, 5);
  } else {
    throw new Error("Invalid SLA level. Use CRITICAL or NORMAL.");
  }

  const remainingMs = due.getTime() - now.getTime();

  return {
    dueDate: due,
    remainingMs,
    remainingHours: Math.round(remainingMs / (1000 * 60 * 60)),
    remainingMinutes: Math.round(remainingMs / (1000 * 60)),
    expired: remainingMs <= 0,
  };
}

function addBusinessDays(date: string | Date, days: number) {
  const result = new Date(date);
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }

  return result;
}

export function tasksToCsv(tasks: Task[]) {
  const transformed = tasks.map((t) => ({
    Title: t.title,
    Description: t.description,
    Status: t.status,
    "Created At": t.createdAt,
    Deadline: t.deadline,
    Creator: t.creator?.name ?? "",
    "Completed By": t.completedBy?.name ?? "",
    "parent Task": t.parentTask?.title ?? "",
    "Assigned Users": t.assignedUsers?.length ?? 0,
    "Subscribed Users": t.subscribedUsers?.length ?? 0,
    "Applied Users": t.appliedUsers?.length ?? 0,
  }));

  const header = Object.keys(transformed[0]).join(",");
  const rows = transformed.map((obj) =>
    Object.values(obj)
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );

  const csvContent = [header, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Tasks.csv";
  link.click();
}
