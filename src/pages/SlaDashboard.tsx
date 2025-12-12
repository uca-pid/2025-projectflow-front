import { useMemo, useEffect, useState } from "react";
import type { Task } from "@/types/task";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getRemainingSLA,
  calculateSLACompliance,
  formatTimeRemaining,
} from "@/lib/sla-utils";
import {
  AlertCircle,
  Clock,
  TrendingUp,
  Octagon,
  TriangleAlert,
  ArrowLeft,
} from "lucide-react";
import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import LoadingPage from "./LoadingPage";
import { apiCall } from "@/lib/api-client";

interface ParentTaskSLAMetrics {
  taskId: string;
  taskTitle: string;
  totalSubtasks: number;
  subtasksWithSLA: number;
  withinSLA: number;
  expiredSLA: number;
  percentage: number;
  expiredTasks: Task[];
}

export function SLADashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const myRes = await apiCall("GET", "/task/getOwned");

        if (!myRes.success) {
          throw new Error("Failed to fetch tasks");
        }

        setTasks(myRes.data as Task[]);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const parentTaskMetrics = useMemo(() => {
    const parentTasks = tasks.filter((task) => !task.parentTaskId);

    const metrics: ParentTaskSLAMetrics[] = parentTasks.map((parentTask) => {
      const subtasks = tasks.filter(
        (task) => task.parentTaskId === parentTask.id,
      );

      // Include parent task in calculations if it has an SLA
      const allTasksInProject = [parentTask, ...subtasks];

      const compliance = calculateSLACompliance(allTasksInProject);
      const expiredTasks = allTasksInProject.filter((task) => {
        const status = getRemainingSLA(task.slaStartedAt!, task.sla!);
        return status?.isExpired;
      });

      return {
        taskId: parentTask.id,
        taskTitle: parentTask.title,
        totalSubtasks: allTasksInProject.length,
        subtasksWithSLA: compliance.totalWithSLA,
        withinSLA: compliance.withinSLA,
        expiredSLA: compliance.expiredSLA,
        percentage: compliance.percentage,
        expiredTasks,
      };
    });

    // Sort by best compliance (highest percentage)
    return metrics.sort((a, b) => b.percentage - a.percentage);
  }, [tasks]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <BasicPageLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-red-500 text-xl font-semibold mb-4">
            Connection Error
          </div>
          <div className="text-gray-600 mb-4">
            Unable to load tasks. Please try again.
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Retry
          </Button>
        </div>
      </BasicPageLayout>
    );
  }

  return (
    <BasicPageLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              SLA Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Monitor service level agreement compliance across all projects
          </p>
        </div>

        {/* Ranking Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Project Ranking by SLA Compliance
            </CardTitle>
            <CardDescription>
              Projects ordered by best SLA compliance performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parentTaskMetrics.map((metric, index) => (
                <div key={metric.taskId} className="flex items-center gap-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{metric.taskTitle}</span>
                      <span className="text-sm text-muted-foreground">
                        {metric.withinSLA}/{metric.subtasksWithSLA} tasks
                      </span>
                    </div>
                    {metric.subtasksWithSLA != 0 ? (
                      <div className="flex items-center gap-2">
                        <Progress
                          value={metric.percentage}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium min-w-[3rem] text-right">
                          {metric.percentage.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm font-medium min-w-[3rem] text-right">
                        No SLA Tasks
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Project Section */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Details by Project</CardTitle>
            <CardDescription>
              View percentage of tasks within SLA and expired tasks for each
              project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={parentTaskMetrics[0]?.taskId}
              className="w-full"
            >
              <TabsList className="w-full justify-start overflow-x-auto">
                {parentTaskMetrics.map((metric) => (
                  <TabsTrigger key={metric.taskId} value={metric.taskId}>
                    {metric.taskTitle}
                  </TabsTrigger>
                ))}
              </TabsList>

              {parentTaskMetrics.map((metric) => (
                <TabsContent
                  key={metric.taskId}
                  value={metric.taskId}
                  className="space-y-4"
                >
                  {/* SLA Percentage Card */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          Tasks Within SLA
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {metric.withinSLA != 0 &&
                        metric.subtasksWithSLA != 0 ? (
                          <>
                            <div className="text-2xl font-bold text-green-600">
                              {metric.percentage.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {metric.withinSLA} of {metric.subtasksWithSLA}{" "}
                              tasks
                            </p>
                            <Progress
                              value={metric.percentage}
                              className="mt-3"
                            />
                          </>
                        ) : (
                          <p className="text-muted-foreground mt-1 text-center">
                            No tasks within SLA
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          Expired SLA
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {metric.expiredSLA != 0 ? (
                          <>
                            <div className="text-2xl font-bold text-red-600">
                              {metric.expiredSLA}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tasks past deadline
                            </p>
                            <Progress
                              value={
                                (metric.expiredSLA / metric.subtasksWithSLA) *
                                100
                              }
                              className="mt-3"
                            />
                          </>
                        ) : (
                          <p className="text-muted-foreground mt-1 text-center">
                            No expired SLA tasks
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          Total Tasks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {metric.totalSubtasks}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {metric.subtasksWithSLA} with SLA assigned
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Expired Tasks Table */}
                  {metric.expiredTasks.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-5 w-5" />
                          Tasks with Expired SLA
                        </CardTitle>
                        <CardDescription>
                          These tasks have exceeded their service level
                          agreement
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task</TableHead>
                              <TableHead>SLA Level</TableHead>
                              <TableHead>Started</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Time Overdue</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {metric.expiredTasks.map((task) => {
                              const slaStatus = getRemainingSLA(
                                task.slaStartedAt!,
                                task.sla!,
                              );
                              const overdueMs = slaStatus
                                ? Math.abs(slaStatus.remainingTime)
                                : 0;

                              return (
                                <TableRow key={task.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {task.title}
                                      </div>
                                      <div className="text-xs text-muted-foreground line-clamp-1">
                                        {task.description}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {task.sla === "CRITICAL" ? (
                                      <Badge
                                        variant="destructive"
                                        className="gap-1"
                                      >
                                        <Octagon className="h-3 w-3" />
                                        Critical
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="secondary"
                                        className="gap-1 bg-yellow-100 text-yellow-800"
                                      >
                                        <TriangleAlert className="h-3 w-3" />
                                        Normal
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {task.slaStartedAt
                                      ? new Date(
                                          task.slaStartedAt,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        task.status === "DONE"
                                          ? "default"
                                          : task.status === "IN_PROGRESS"
                                            ? "secondary"
                                            : "outline"
                                      }
                                    >
                                      {task.status.replace("_", " ")}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-red-600 font-medium">
                                      <Clock className="h-3 w-3" />
                                      {formatTimeRemaining(overdueMs)} overdue
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-8">
                        <div className="text-center text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="font-medium">No expired SLA tasks</p>
                          <p className="text-sm">
                            All tasks are within their service level agreement
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </BasicPageLayout>
  );
}
