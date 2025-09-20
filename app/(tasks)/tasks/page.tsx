"use client";

import { useState, useEffect } from "react";
import { TasksTable } from "./components/TasksTable";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { EditTaskModal } from "./components/EditTaskModal";
import { DeleteTaskModal } from "./components/DeleteTaskModal";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/LoadingScreen";
import { type Task } from "@/lib/generated/prisma";
import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getTasks } from "@/server/tasks";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (!session.data) {
        router.replace("/authenticate");
      } else {
        getTasks().then((tasks) => {
          setTasks(tasks);
          setLoading(false);
        });
      }
    });
  });

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="text-red-500 flex w-screen h-screen items-center justify-center">
        Error fetching tasks.
      </div>
    );
  }

  const handleEditTask = (task: Task) => {};

  const handleDeleteTask = (taskId: string) => {};

  const handleCreateTask = async (taskData: Task) => {};

  const handleUpdateTask = async (taskId: string, taskData: Task) => {};

  const handleConfirmDelete = async (taskId: string) => {};

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

      {/* Tasks Table */}
      <TasksTable
        tasks={tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

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
