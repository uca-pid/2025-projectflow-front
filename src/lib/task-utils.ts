import type { Task } from "@/types/task";
import type { User } from "@/types/user";

// API utility
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${endpoint}`);
  }

  return response.json();
}

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
      if (task.id) map.set(task.id, task as Task);
      if (task.subTasks?.length) traverse(task.subTasks);
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
export function areAllSubtasksComplete(task: Task): boolean {
  if (!task.subTasks || task.subTasks.length === 0) return true;

  for (const subtask of task.subTasks) {
    const sub = subtask as Task;
    if (
      (sub.status !== "DONE" && sub.status !== "CANCELLED") ||
      !areAllSubtasksComplete(sub)
    ) {
      return false;
    }
  }

  return true;
}

// Recursive status update for cancellation
export async function cancelTaskAndSubtasks(
  task: Task,
  updateFn: (id: string, data: Partial<Task>) => Promise<void>,
): Promise<void> {
  for (const subtask of task.subTasks) {
    const sub = subtask as Task;
    if (sub.status !== "CANCELLED") {
      await cancelTaskAndSubtasks(sub, updateFn);
      await updateFn(sub.id, { status: "CANCELLED" });
    }
  }
}

// Reactive utility functions for user management
export function addUserToTaskField(
  taskList: Partial<Task>[],
  taskId: string,
  userId: string,
  field: "trackedUsers" | "assignedUsers",
  user: User,
): Task[] {
  return taskList.map((task) => {
    if (task.id === taskId) {
      const currentUsers = (task[field] || []) as User[];
      return {
        ...task,
        [field]: [...currentUsers, user],
      };
    }
    if (task.subTasks?.length) {
      return {
        ...task,
        subTasks: addUserToTaskField(
          task.subTasks,
          taskId,
          userId,
          field,
          user,
        ),
      };
    }
    return task;
  }) as Task[];
}

export function removeUserFromTaskField(
  taskList: Partial<Task>[],
  taskId: string,
  userId: string,
  field: "trackedUsers" | "assignedUsers" | "appliedUsers",
): Task[] {
  return taskList.map((task) => {
    if (task.id === taskId) {
      const currentUsers = (task[field] || []) as User[];
      return {
        ...task,
        [field]: currentUsers.filter((user: User) => user.id !== userId),
      };
    }
    if (task.subTasks?.length) {
      return {
        ...task,
        subTasks: removeUserFromTaskField(task.subTasks, taskId, userId, field),
      };
    }
    return task;
  }) as Task[];
}
