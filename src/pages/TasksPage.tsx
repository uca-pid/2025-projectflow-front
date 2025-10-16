import { useState, useEffect, useCallback } from "react";
import { MyTasksTable } from "@/components/MyTasksTable";
import { AssignedTasksTable } from "@/components/AssignedTasksTable";
import { MyTasksKanban } from "@/components/MyTasksKanban";
import { AssignedTasksKanban } from "@/components/AssignedTasksKanban";
import { PublicTasksKanban } from "@/components/PublicTasksKanban";
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
import { PublicTasksTable } from "@/components/PublicTasksTable";
import TreeGraph from "@/components/TreeGraph";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";

type TaskType = "my" | "assigned" | "tracked";

type TasksState = {
  my: Task[];
  assigned: Task[];
  tracked: Task[];
};

function flattenTasks(tasks: Partial<Task>[]): Task[] {
  const map = new Map<string, Task>();

  function traverse(list: Partial<Task>[]) {
    for (const task of list) {
      if (task.id) {
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

  const [tasks, setTasks] = useState<TasksState>({
    my: [],
    assigned: [],
    tracked: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [selectedView, setSelectedView] = useState<"tree" | "kanban" | "table">(
    "table",
  );
  const [selectedType, setSelectedType] = useState<TaskType>("my");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateSubModal, setShowCreateSubModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Get current tasks based on selected type
  const currentTasks = tasks[selectedType];

  // Helper to update a specific task type
  const updateTaskType = useCallback(
    (type: TaskType, updater: (prev: Task[]) => Task[]) => {
      setTasks((prev) => ({
        ...prev,
        [type]: updater(prev[type]),
      }));
    },
    [],
  );

  const updateCurrentTasks = useCallback(
    (updater: (prev: Task[]) => Task[]) => {
      updateTaskType(selectedType, updater);
    },
    [selectedType, updateTaskType],
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const [myResponse, assignedResponse, trackedResponse] =
          await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/task/getTasks`, {
              method: "GET",
              credentials: "include",
            }),
            fetch(`${import.meta.env.VITE_API_URL}/task/getAssignedTasks`, {
              method: "GET",
              credentials: "include",
            }),
            fetch(`${import.meta.env.VITE_API_URL}/task/getTrackedTasks`, {
              method: "GET",
              credentials: "include",
            }),
          ]);

        const [myData, assignedData, trackedData] = await Promise.all([
          myResponse.json(),
          assignedResponse.json(),
          trackedResponse.json(),
        ]);

        setTasks({
          my: myData.data || [],
          assigned: assignedData.data || [],
          tracked: trackedData.data || [],
        });
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError(true);
        setTasks({
          my: [],
          assigned: [],
          tracked: [],
        });
      } finally {
        setLoading(false);
      }
    };
    setSelectedView(
      (localStorage.getItem("selectedView") as "tree" | "kanban") || "table",
    );
    fetchTasks();
  }, []);

  const findTaskAcross = (taskId: string) => {
    return (
      tasks.my.find((task) => task.id === taskId) ||
      tasks.assigned.find((task) => task.id === taskId) ||
      tasks.tracked.find((task) => task.id === taskId)
    );
  };

  const handleTabChange = (tab: string) => {
    setSelectedType(tab as TaskType);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
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
    updateCurrentTasks((prev) => [...prev, data.data]);
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
      taskList: Partial<Task>[],
      parentId: string,
      newTask: Task,
    ): Task[] {
      return taskList.map((task) => {
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

    updateCurrentTasks((prev) =>
      addSubTask(prev, serverTask.data.parentTaskId, serverTask.data),
    );

    setShowCreateSubModal(false);
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

    function patchSubTask(
      taskList: Partial<Task>[],
      id: string,
      updatedFields: Partial<Task>,
    ): Task[] {
      return taskList.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            ...updatedFields,
          };
        }

        if (task.subTasks && task.subTasks.length > 0) {
          return {
            ...task,
            subTasks: patchSubTask(task.subTasks, id, updatedFields),
          };
        }

        return task;
      }) as Task[];
    }

    updateCurrentTasks((prev) => patchSubTask(prev, data.data.id, data.data));

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

    function deleteTaskRecursively(
      taskList: Partial<Task>[],
      taskIdToDelete: string,
    ): Task[] {
      return taskList
        .filter((task) => task.id !== taskIdToDelete)
        .map((task) => {
          if (task.subTasks && task.subTasks.length > 0) {
            return {
              ...task,
              subTasks: deleteTaskRecursively(task.subTasks, taskIdToDelete),
            };
          }
          return task;
        }) as Task[];
    }

    // Delete from current view
    updateCurrentTasks((prev) => deleteTaskRecursively(prev, taskId));

    // Also delete from "my" if it's not already the current view
    if (selectedType !== "my") {
      updateTaskType("my", (prev) => deleteTaskRecursively(prev, taskId));
    }

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
    // Check if all subtasks are complete recursively
    const currentTask = findTaskAcross(taskId);
    function isSubTaskComplete(task: Task): boolean {
      if (task.subTasks && task.subTasks?.length > 0) {
        for (const subTask of task.subTasks) {
          if (!isSubTaskComplete(subTask as Task)) {
            return false;
          }
        }
      }
      return task.status === "DONE" || task.status === "CANCELLED";
    }
    const canComplete = isSubTaskComplete(currentTask!);
    if (!canComplete) {
      toast.error("Cannot complete task with incomplete subtasks");
      return;
    }
    await handleUpdateTask(taskId, { status: "DONE" });
  };

  const handleCancelTask = async (taskId: string) => {
    await handleUpdateTask(taskId, { status: "CANCELLED" });
  };

  const handleAssignTask = (taskId: string) => {
    setShowAssignModal(true);
    function findTask(taskList: Partial<Task>[], id: string): Task | null {
      for (const task of taskList) {
        if (task.id === id) {
          return task as Task;
        }

        if (task.subTasks && task.subTasks.length > 0) {
          const found = findTask(task.subTasks, id);
          if (found) return found;
        }
      }

      return null;
    }
    setSelectedTask(findTask(currentTasks, taskId)!);
  };

  const handleOpenSubTask = (task: Task) => {
    setShowCreateSubModal(true);
    setSelectedTask(task);
  };

  const handleViewChange = (value: string) => {
    setSelectedView(value as "tree" | "kanban" | "table");
    localStorage.setItem("selectedView", value);
  };

  // Wrapper functions for Kanban components
  const handleDeleteTaskById = (taskId: string) => {
    const task = findTaskAcross(taskId);
    if (task) {
      handleDeleteTask(task);
    }
  };

  const handleAssignTaskByTask = (task: Task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <BasicPageLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-red-500 text-xl font-semibold mb-4">
            Database Connection Error
          </div>
          <div className="text-gray-600 mb-4">
            Unable to connect to the database.
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
          <div className="flex gap-2">
            <Select value={selectedView} onValueChange={handleViewChange}>
              <SelectTrigger className="w-[140px] bg-white shadow">
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectLabel>Views</SelectLabel>
                  <SelectItem value="table">Table View</SelectItem>
                  <SelectItem value="kanban">Kanban View</SelectItem>
                  <SelectItem value="tree">Tree View</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Task
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">
            {flattenTasks(currentTasks).length}
          </div>
          <div className="text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {
              flattenTasks(currentTasks).filter(
                (task) => task.status === "IN_PROGRESS",
              ).length
            }
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {
              flattenTasks(currentTasks).filter(
                (task) => task.status === "DONE",
              ).length
            }
          </div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            {
              flattenTasks(currentTasks).filter(
                (task) => task.status === "CANCELLED",
              ).length
            }
          </div>
          <div className="text-gray-600">Cancelled</div>
        </div>
      </div>

      <Tabs defaultValue="my" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="my">My Tasks</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Tasks</TabsTrigger>
          <TabsTrigger value="tracked">Tracked Tasks</TabsTrigger>
        </TabsList>
        {/* Tasks Table */}
        <TabsContent value="my">
          {selectedView === "tree" && (
            <TreeGraph
              tasks={tasks.my}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              openEditModal={handleEditTask}
              openAddSubtask={handleOpenSubTask}
              openDeleteTask={handleDeleteTask}
              openAssignTask={handleAssignTask}
            />
          )}
          {selectedView === "kanban" && (
            <MyTasksKanban
              tasks={flattenTasks(tasks.my)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTaskById}
              onAssignTask={handleAssignTaskByTask}
              onCreateSubTask={handleOpenSubTask}
              onPause={handlePauseTask}
              onStart={handleStartTask}
              onComplete={handleCompleteTask}
              onCancel={handleCancelTask}
            />
          )}
          {selectedView === "table" && (
            <MyTasksTable
              tasks={tasks.my}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAssignTask={handleAssignTask}
              onCreateSubTask={handleOpenSubTask}
            />
          )}
        </TabsContent>
        <TabsContent value="assigned">
          {selectedView === "kanban" && (
            <AssignedTasksKanban
              tasks={flattenTasks(tasks.assigned)}
              onPause={handlePauseTask}
              onStart={handleStartTask}
              onComplete={handleCompleteTask}
              onCancel={handleCancelTask}
            />
          )}
          {selectedView === "table" && (
            <AssignedTasksTable
              tasks={tasks.assigned}
              onStartTask={handleStartTask}
              onPauseTask={handlePauseTask}
              onCompleteTask={handleCompleteTask}
              onCancelTask={handleCancelTask}
              onCreateSubTask={handleOpenSubTask}
            />
          )}
        </TabsContent>
        <TabsContent value="tracked">
          {selectedView === "kanban" && (
            <PublicTasksKanban tasks={flattenTasks(tasks.tracked)} />
          )}
          {selectedView === "table" && (
            <PublicTasksTable tasks={tasks.tracked} />
          )}
        </TabsContent>
      </Tabs>

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
