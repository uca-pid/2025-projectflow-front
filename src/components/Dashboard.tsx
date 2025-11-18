import { type Task, type ViewType } from "@/types/task";
import { type User } from "@/types/user";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TasksViewSelector } from "@/components/TasksViewSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PieChart } from "@/components/PieChart";
import { BarChart } from "@/components/BarChart";
import { RankChart } from "@/components/RankChart";
import { apiCall } from "@/lib/api-client";

import { flattenTasks, tasksToCsv } from "@/lib/task-utils";

import { Plus, Funnel, FileSpreadsheet } from "lucide-react";
import { useState, useEffect } from "react";

interface DashboardProps {
  tasks: Task[];
  showTitle?: boolean;
  showGraphs?: boolean;
  selectedView?: ViewType;
  setSelectedView?: (view: ViewType) => void;
  openCreateModal?: (open: boolean) => void;
}

const Dashboard = ({
  tasks,
  showTitle = false,
  showGraphs = false,
  selectedView,
  setSelectedView,
  openCreateModal,
}: DashboardProps) => {
  const [advanced, setAdvanced] = useState<string>("");
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    const viewType = localStorage.getItem("advancedDashboard") || "";
    setAdvanced(viewType as ViewType);
  }, []);

  function filterTasks(tasks: Task[], filter: string): Task[] {
    switch (filter) {
      case "This Month":
        return tasks.filter(
          (task) =>
            new Date(task.createdAt).getMonth() === new Date().getMonth(),
        );
      case "Last Month":
        return tasks.filter(
          (task) =>
            new Date(task.createdAt).getMonth() === new Date().getMonth() - 1,
        );
      default:
        return tasks;
    }
  }

  async function enrichTasks(tasks: Task[]): Promise<Task[]> {
    for (const task of tasks) {
      const assignedUsersRes = await apiCall(
        "GET",
        `/task/${task.id}/assigned`,
      );
      const subscribedUsersRes = await apiCall(
        "GET",
        `/task/${task.id}/subscribed`,
      );
      const appliedUsersRes = await apiCall("GET", `/task/${task.id}/applied`);
      task.assignedUsers = (assignedUsersRes?.data as User[]) || [];
      task.subscribedUsers = (subscribedUsersRes?.data as User[]) || [];
      task.appliedUsers = (appliedUsersRes?.data as User[]) || [];
    }

    return tasks;
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {showTitle && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Task Management
              </h1>
              <p className="mt-2 text-gray-600">
                Organize and manage your tasks with specific deadlines
              </p>
            </div>
          )}
          <div className="flex gap-2">
            {selectedView && setSelectedView && (
              <TasksViewSelector
                selectedView={selectedView}
                onViewChange={(view: ViewType) => {
                  setSelectedView(view);
                  localStorage.setItem("viewType", view);
                }}
              />
            )}
            {openCreateModal && (
              <Button onClick={() => openCreateModal?.(true)}>
                <Plus className="h-4 w-4" />
                Task
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">
            {flattenTasks(tasks).length}
          </div>
          <div className="text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {
              flattenTasks(tasks).filter(
                (task) => task.status === "IN_PROGRESS",
              ).length
            }
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {
              flattenTasks(tasks).filter((task) => task.status === "DONE")
                .length
            }
          </div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            {
              flattenTasks(tasks).filter((task) => task.status === "CANCELLED")
                .length
            }
          </div>
          <div className="text-gray-600">Cancelled</div>
        </div>
      </div>
      {showGraphs ? (
        <Accordion
          type="single"
          collapsible
          value={advanced}
          onValueChange={(value) => {
            localStorage.setItem("advancedDashboard", value);
            setAdvanced(value);
          }}
        >
          <AccordionItem value="tron" className="relative">
            <AccordionTrigger className="w-full flex justify-center">
              <h1 className=" text-l font-bold text-muted-foreground text-center">
                {advanced === "tron" ? "Show Less" : "Show More"}
              </h1>
            </AccordionTrigger>
            <AccordionContent className="flex flex-row justify-center gap-3">
              <PieChart
                tasks={flattenTasks(filterTasks(tasks, filter))}
                period={filter}
              />
              <RankChart
                tasks={flattenTasks(filterTasks(tasks, filter))}
                period={filter}
              />
              <BarChart
                tasks={flattenTasks(filterTasks(tasks, filter))}
                period={filter}
              />
            </AccordionContent>
            <div
              className="absolute -bottom-8 right-12 translate-x-1/2"
              hidden={advanced !== "tron"}
            >
              <Button
                onClick={async () => {
                  tasksToCsv(
                    await enrichTasks(flattenTasks(filterTasks(tasks, filter))),
                  );
                }}
                title="Exportar"
                className="mr-2"
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button title="Filter">
                    <Funnel className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setFilter("All");
                    }}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setFilter("This Month");
                    }}
                  >
                    This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setFilter("Last Month");
                    }}
                  >
                    Last Month
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="h-8 bg-transparent" />
      )}
    </>
  );
};

export default Dashboard;
