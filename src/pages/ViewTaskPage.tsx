import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import LoadingPage from "./LoadingPage";
import { type Task, type ViewType } from "@/types/task";
import { CopyPlus, Check } from "lucide-react";
import { PublicTasksTable } from "@/components/PublicTasksTable";
import { ConfirmCloneTaskModal } from "@/components/ConfirmCloneTaskModal";
import Dashboard from "@/components/Dashboard";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { flattenTasks } from "@/lib/task-utils";
import { apiCall } from "@/lib/api-client";

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
      apiCall("GET", `/task/${taskId}`).then((response) => {
        setTask(response?.data as Task);
      });
    } catch (error) {
      setError(true);
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const handleClone = async () => {
    const response = await apiCall("POST", `/task/${taskId}/clone`);
    if (response.success) {
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

  if (!task?.status) {
    return (
      <BasicPageLayout>
        <div className="w-full flex flex-col pt-12 items-center justify-center">
          <p className="text-2xl font-bold text-gray-900">Task not found</p>
          <p className="text-xl text-muted-foreground">
            Sorry, this task either does not exist or is not public
          </p>
        </div>
      </BasicPageLayout>
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
      {task?.isPublic && <Dashboard tasks={[task]} />}

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
