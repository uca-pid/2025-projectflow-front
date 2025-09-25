import { useState, useEffect } from "react";
import { TasksTable } from "@/components/TasksTable";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { EditTaskModal } from "@/components/EditTaskModal";
import { DeleteTaskModal } from "@/components/DeleteTaskModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import LoadingPage from "./LoadingPage";
import { type Task } from "@/types/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    try {
      fetch(`${import.meta.env.VITE_API_URL}/task/getTasks`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setTasks(data.data);
        });
    } catch (error) {
      setError(true);
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (taskToDelete) {
      setSelectedTask(taskToDelete);
      setShowDeleteModal(true);
    }
  };

  const handleCreateTask = async (taskData: Task) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/create`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      },
    );

    if (!response.ok) {
      toast.error("Failed to create task");
      throw new Error("Failed to create task");
    }

    toast.success("Task created successfully");

    const data = await response.json();
    taskData = data.data;

    setTasks((prevTasks) => [...prevTasks, taskData]);
    setShowCreateModal(false);
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/${taskId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      },
    );

    if (!response.ok) {
      toast.error("Failed to update task");
      throw new Error("Failed to update task");
    }

    toast.success("Task updated successfully");
    const data = await response.json();
    taskData = data.data;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...taskData } : task,
      ),
    );
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleConfirmDelete = async (taskId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/${taskId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      toast.error("Failed to delete task");
      throw new Error("Failed to delete task");
    }

    toast.success("Deleted task successfully");
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    setShowDeleteModal(false);
    setSelectedTask(null);
  };

  const handleStartTask = async (taskId: string) => {
    await handleUpdateTask(taskId, { status: "IN_PROGRESS" });
  };

  const handlePauseTask = async (taskId: string) => {
    await handleUpdateTask(taskId, { status: "TODO" });
  };

  const handleCompleteTask = async (taskId: string) => {
    await handleUpdateTask(taskId, { status: "DONE" });
  };

  const handleCancelTask = async (taskId: string) => {
    await handleUpdateTask(taskId, { status: "CANCELLED" });
  };

  return (
    <BasicPageLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Task Management
            </h1>
            <p className="mt-2 text-gray-600">
              Organize and manage your tasks with specific deadlines
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
          <div className="text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter((task) => task.status === "IN_PROGRESS").length}
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter((task) => task.status === "DONE").length}
          </div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            {tasks.filter((task) => task.status === "CANCELLED").length}
          </div>
          <div className="text-gray-600">Cancelled</div>
        </div>
      </div>

      <Tabs defaultValue="my-tasks">
        <TabsList>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="assigned-tasks">Assigned Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="my-tasks">
          <TasksTable
            tasks={tasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            isOwner
          />
        </TabsContent>
        <TabsContent value="assigned-tasks">
          <TasksTable
            tasks={tasks}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
            onCancelTask={handleCancelTask}
          />
        </TabsContent>
      </Tabs>
      {/* Tasks Table */}

      {/* Modals */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={handleCreateTask}
      />

      <EditTaskModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        onUpdateTask={handleUpdateTask}
        task={selectedTask}
      />

      <DeleteTaskModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        task={selectedTask}
      />
    </BasicPageLayout>
  );
}
