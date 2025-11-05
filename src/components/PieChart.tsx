import { Pie, PieChart as PieRechart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { type Task, type TaskStatus } from "@/types/task";

export const description = "A pie chart with no separator";

const chartConfig = {
  CANCELLED: {
    label: "Cancelled",
    color: "#dc2626",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#2563eb",
  },
  DONE: {
    label: "Completed",
    color: "#16a34a",
  },
  TODO: {
    label: "Backlog",
    color: "#9ca3af",
  },
} satisfies ChartConfig;

export function PieChart({ tasks }: { tasks: Task[] }) {
  const chartData = Object.entries(
    tasks?.reduce<Record<TaskStatus, number>>(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {
        CANCELLED: 0,
        IN_PROGRESS: 0,
        DONE: 0,
        TODO: 0,
      },
    ) || {},
  ).map(([status, count]) => ({
    browser: status,
    visitors: count,
    fill: `var(--color-${status})`,
  }));

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Task Status </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {tasks.length === 0 && (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-gray-600 text-l">No tasks found</p>
          </div>
        )}
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <PieRechart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="visitors" nameKey="browser" />
          </PieRechart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
