import { useState, useEffect } from "react";
import { MyTasksTable } from "@/components/MyTasksTable";
import { AssignedTasksTable } from "@/components/AssignedTasksTable";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { CreateSubTaskModal } from "@/components/CreateSubTaskModal";
import { EditTaskModal } from "@/components/EditTaskModal";
import { DeleteTaskModal } from "@/components/DeleteTaskModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import { AssignTaskModal } from "@/components/AssignTaskModal";
import LoadingPage from "./LoadingPage";
import { type Task } from "@/types/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";

function flattenTasks(tasks: Partial<Task>[]): Task[] {
  const map = new Map<string, Task>();

  function traverse(list: Partial<Task>[]) {
    for (const task of list) {
      if (task.id) {
        // if not already stored, add it
        if (!map.has(task.id)) {
          map.set(task.id, task as Task);
        }
      }

      if (task.subTasks && task.subTasks.length > 0) {
        traverse(task.subTasks);
      }
    }
  }

  traverse(tasks);
  return Array.from(map.values());
}

export default function TasksPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateSubModal, setShowCreateSubModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch and load tasks
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

  // Filter tasks
  useEffect(() => {
    const myTasks = tasks.filter((task) => task.creatorId === user?.id);
    const assignedTasks = tasks.filter(
      (task) =>
        task.assignedUsers?.some((user) => user.id === user?.id) &&
        task.creatorId !== user?.id,
    );
    setMyTasks(myTasks);
    setAssignedTasks(assignedTasks);
  }, [tasks, user]);

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

  const handleCreateSubTask = async (taskData: Task) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/${taskData?.parentTaskId}/create`,
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

    const serverTask = await response.json();

    function addSubTask(
      tasks: Partial<Task>[],
      parentId: string,
      newTask: Task,
    ): Task[] {
      return tasks.map((task) => {
        if (task.id === parentId) {
          return {
            ...task,
            subTasks: [...(task.subTasks || []), newTask],
          };
        }

        if (task.subTasks && task.subTasks.length > 0) {
          return {
            ...task,
            subTasks: addSubTask(task.subTasks, parentId, newTask),
          };
        }

        return task;
      }) as Task[];
    }

    setTasks((prevTasks) =>
      addSubTask(prevTasks, serverTask.data.parentTaskId, serverTask.data),
    );

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

    function patchSubTask(
      tasks: Partial<Task>[],
      taskId: string,
      updatedFields: Partial<Task>,
    ): Task[] {
      return tasks.map((task) => {
        if (task.id === taskId) {
          // Patch the task
          return {
            ...task,
            ...updatedFields,
          };
        }

        if (task.subTasks && task.subTasks.length > 0) {
          return {
            ...task,
            subTasks: patchSubTask(task.subTasks, taskId, updatedFields),
          };
        }

        return task;
      }) as Task[];
    }

    setTasks((prevTasks) => patchSubTask(prevTasks, taskData.id!, taskData));

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

  const handleAssignTask = (taskId: string) => {
    setShowAssignModal(true);
    function findTask(tasks: Partial<Task>[], taskId: string): Task | null {
      for (const task of tasks) {
        if (task.id === taskId) {
          return task as Task;
        }

        if (task.subTasks && task.subTasks.length > 0) {
          const found = findTask(task.subTasks, taskId);
          if (found) return found;
        }
      }

      return null;
    }
    setSelectedTask(findTask(tasks, taskId)!);
  };

  const handleOpenSubTask = (task: Task) => {
    setShowCreateSubModal(true);
    setSelectedTask(task);
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

      <Tabs defaultValue="my-tasks">
        <TabsList>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="assigned-tasks">Assigned Tasks</TabsTrigger>
        </TabsList>
        {/* Tasks Table */}
        <TabsContent value="my-tasks">
          <MyTasksTable
            tasks={myTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAssignTask={handleAssignTask}
            onCreateSubTask={handleOpenSubTask}
          />
        </TabsContent>
        <TabsContent value="assigned-tasks">
          <AssignedTasksTable
            tasks={assignedTasks}
            onStartTask={handleStartTask}
            onPauseTask={handlePauseTask}
            onCompleteTask={handleCompleteTask}
            onCancelTask={handleCancelTask}
            onCreateSubTask={handleOpenSubTask}
          />
        </TabsContent>
      </Tabs>
      <pre>{JSON.stringify(tasks, null, 2)}</pre>

      {/* Modals */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={handleCreateTask}
      />
      <CreateSubTaskModal
        open={showCreateSubModal}
        onClose={() => {
          setShowCreateSubModal(false);
          setSelectedTask(null);
        }}
        onCreateTask={handleCreateSubTask}
        creator={user || null}
        parentTask={selectedTask}
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
      <AssignTaskModal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask!}
      />
    </BasicPageLayout>
  );
}
