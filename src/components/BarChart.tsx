import { Bar, BarChart as BarRechart, XAxis } from "recharts";
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
import { type Task } from "@/types/task";

const chartConfig = {
  overdue: {
    label: "Overdue",
    color: "#dc2626",
  },
  submittedLate: {
    label: "Submitted Late",
    color: "#f59e0b",
  },
  inTime: {
    label: "In Time",
    color: "#16a34a",
  },
  ongoing: {
    label: "Ongoing",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export function BarChart({ tasks, period }: { tasks: Task[]; period: string }) {
  const now = new Date();

  // Categorize tasks by deadline status
  const categories = tasks?.reduce(
    (acc, task) => {
      if (!task.deadline) return acc;

      const deadline = new Date(task.deadline);
      const isCompleted = task.status === "DONE";
      const completedDate = task.completedAt
        ? new Date(task.completedAt)
        : null;

      if (isCompleted && completedDate) {
        // Task is completed - check if it was on time or late
        if (completedDate <= deadline) {
          acc.inTime++;
        } else {
          acc.submittedLate++;
        }
      } else {
        // Task is not completed - check if it's overdue or ongoing
        if (now > deadline) {
          acc.overdue++;
        } else {
          acc.ongoing++;
        }
      }

      return acc;
    },
    {
      overdue: 0,
      submittedLate: 0,
      inTime: 0,
      ongoing: 0,
    },
  );

  const chartData = [
    {
      category: "Overdue",
      count: categories.overdue,
      fill: "var(--color-overdue)",
    },
    {
      category: "Submitted Late",
      count: categories.submittedLate,
      fill: "var(--color-submittedLate)",
    },
    {
      category: "In Time",
      count: categories.inTime,
      fill: "var(--color-inTime)",
    },
    {
      category: "Ongoing",
      count: categories.ongoing,
      fill: "var(--color-ongoing)",
    },
  ];

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Task Deadlines</CardTitle>
        <CardDescription>{period}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {tasks.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-gray-600 text-l">No tasks found</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarRechart accessibilityLayer data={chartData}>
              <XAxis
                dataKey="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={4} />
            </BarRechart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
