import { Clock, Check, LoaderCircle, Ban, type LucideIcon } from "lucide-react";

export function getStatusVariant(
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

export function getStatusTailwind(status: string): string {
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

export function getStatusIcon(status: string): LucideIcon {
  switch (status) {
    case "TODO":
      return Clock;
    case "IN_PROGRESS":
      return LoaderCircle;
    case "DONE":
      return Check;
    case "CANCELLED":
      return Ban;
    default:
      return Clock;
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "TODO":
      return "Pending";
    case "IN_PROGRESS":
      return "In Progress";
    case "DONE":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Unknown";
  }
}

export function formatDeadline(date: Date): string {
  const now = new Date();
  const deadline = new Date(date);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = deadline.toLocaleDateString("en-US", {
    timeZone: "UTC",
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
