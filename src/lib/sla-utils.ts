import type { Task } from "@/types/task";
import { CircleAlert, TriangleAlert } from "lucide-react";
import { getRemainingSLA } from "./task-utils";

export interface SLAStatus {
  isExpired: boolean;
  remainingTime: number;
  remainingHours: number;
  dueDate: Date;
}

export function calculateSLAStatus(task: Task): SLAStatus | null {
  if (!task.sla || !task.slaStartedAt) {
    return null;
  }

  try {
    const result = getRemainingSLA(task.slaStartedAt, task.sla);
    return {
      isExpired: result.expired,
      remainingTime: result.remainingMs,
      remainingHours: result.remainingHours,
      dueDate: result.dueDate,
    };
  } catch {
    return null;
  }
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expired";

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return `${days}d ${remainingHours}h`;
  }
  return `${hours}h`;
}

export function calculateSLACompliance(tasks: Task[]): {
  totalWithSLA: number;
  withinSLA: number;
  expiredSLA: number;
  percentage: number;
} {
  const tasksWithSLA = tasks.filter((task) => task.sla && task.slaStartedAt);
  const totalWithSLA = tasksWithSLA.length;

  if (totalWithSLA === 0) {
    return {
      totalWithSLA: 0,
      withinSLA: 0,
      expiredSLA: 0,
      percentage: 100,
    };
  }

  const expiredTasks = tasksWithSLA.filter((task) => {
    const status = calculateSLAStatus(task);
    return status?.isExpired;
  });

  const expiredSLA = expiredTasks.length;
  const withinSLA = totalWithSLA - expiredSLA;
  const percentage = (withinSLA / totalWithSLA) * 100;

  return {
    totalWithSLA,
    withinSLA,
    expiredSLA,
    percentage,
  };
}
