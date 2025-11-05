import { type Task, type ViewType } from "@/types/task";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TasksViewSelector } from "@/components/TasksViewSelector";
import { Button } from "@/components/ui/button";
import { PieChart } from "@/components/PieChart";
import { BarChart } from "@/components/BarChart";
import { RankChart } from "@/components/RankChart";

import { flattenTasks } from "@/lib/task-utils";

import { Plus } from "lucide-react";
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

  useEffect(() => {
    const viewType = localStorage.getItem("advancedDashboard") || "";
    setAdvanced(viewType as ViewType);
  }, []);

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
          <AccordionItem value="tron">
            <AccordionTrigger className="w-full flex justify-center">
              <h1 className=" text-l font-bold text-muted-foreground text-center">
                More
              </h1>
            </AccordionTrigger>
            <AccordionContent className="flex flex-row justify-center gap-3">
              <PieChart tasks={flattenTasks(tasks)} />
              <RankChart tasks={flattenTasks(tasks)} />
              <BarChart tasks={flattenTasks(tasks)} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="h-8 bg-transparent" />
      )}
    </>
  );
};

export default Dashboard;
