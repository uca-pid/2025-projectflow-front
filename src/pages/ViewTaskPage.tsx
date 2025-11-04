import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import LoadingPage from "./LoadingPage";
import { type Task } from "@/types/task";
import { CopyPlus, Check } from "lucide-react";
import { PublicTasksTable } from "@/components/PublicTasksTable";
import { ConfirmCloneTaskModal } from "@/components/ConfirmCloneTaskModal";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { flattenTasks } from "@/lib/task-utils";

export default function ViewTaskPage() {
  const { taskId } = useParams();

  const [task, setTask] = useState<Task>();
  const [isCloneModalOpen, setIsCloneModalOpen] = useState<boolean>(false);
  const [isCloned, setIsCloned] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Fetch and load tasks
  useEffect(() => {
    try {
      fetch(`${import.meta.env.VITE_API_URL}/task/${taskId}`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setTask(data?.data);
        });
    } catch (error) {
      setError(true);
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const handleClone = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/clone/${taskId}`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    const data = await response.json();
    if (data.success) {
      setIsCloned(true);
      toast.success("Task cloned successfully");
    } else {
      toast.error("Error cloning task");
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="text-red-500 flex w-screen h-screen items-center justify-center">
        Error fetching tasks.
      </div>
    );
  }

  return (
    <BasicPageLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {task?.title || "Task not found"}
            </h1>
            <p className="mt-2 text-gray-600">
              {task?.description || "Description not found"}
            </p>
          </div>
          {task?.isPublic && (
            <Button
              onClick={() => setIsCloneModalOpen(true)}
              disabled={isCloned}
            >
              {isCloned ? (
                <Check className="h-4 w-4" />
              ) : (
                <CopyPlus className="h-4 w-4" />
              )}
              {isCloned ? "Cloned" : "Clone"}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {task?.isPublic && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">
              {flattenTasks([task!]).length}
            </div>
            <div className="text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">
              {
                flattenTasks([task!]).filter(
                  (task) => task.status === "IN_PROGRESS",
                ).length
              }
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {
                flattenTasks([task!]).filter((task) => task.status === "DONE")
                  .length
              }
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">
              {
                flattenTasks([task!]).filter(
                  (task) => task.status === "CANCELLED",
                ).length
              }
            </div>
            <div className="text-gray-600">Cancelled</div>
          </div>
        </div>
      )}

      <PublicTasksTable tasks={flattenTasks([task!])} />

      <ConfirmCloneTaskModal
        open={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onCloneTask={handleClone}
        task={task!}
      />
    </BasicPageLayout>
  );
}
