import type { Task } from "@/types/task";

export interface SLAStatus {
  isExpired: boolean;
  remainingTime: number;
  remainingHours: number;
  dueDate: Date;
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
    const status = getRemainingSLA(task.slaStartedAt!, task.sla!);
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

export function getRemainingSLA(
  startedAt: string | Date,
  slaLevel: string,
): SLAStatus | null {
  if (!startedAt || !slaLevel) {
    return null;
  }
  try {
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
      remainingTime: remainingMs,
      remainingHours: Math.round(remainingMs / (1000 * 60 * 60)),
      isExpired: remainingMs <= 0,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
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
