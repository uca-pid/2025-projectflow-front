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
import type { Task } from "@/types/task";
import type { User } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicTasksTable } from "@/components/PublicTasksTable";
import TreeGraph from "@/components/TreeGraph";
import AssignedTreeGraph from "@/components/AssignedTreeGraph";
import TrackedTreeGraph from "@/components/TrackedTreeGraph";
import {
  apiCall,
  findTask,
  flattenTasks,
  updateTaskInTree,
  addSubTaskToTree,
  deleteTaskFromTree,
  areAllSubtasksComplete,
  cancelTaskAndSubtasks,
  addUserToTaskField,
  removeUserFromTaskField,
} from "@/lib/task-utils";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react"; // Import Plus
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

type TaskType = "my" | "assigned" | "tracked";

type TasksState = {
  my: Task[];
  assigned: Task[];
  tracked: Task[];
};

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

  const currentTasks = tasks[selectedType];

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
        const [myData, assignedData, trackedData] = await Promise.all([
          apiCall<{ data: Task[] }>("/task/getTasks"),
          apiCall<{ data: Task[] }>("/task/getAssignedTasks"),
          apiCall<{ data: Task[] }>("/task/getTrackedTasks"),
        ]);

        setTasks({
          my: myData.data || [],
          assigned: assignedData.data || [],
          tracked: trackedData.data || [],
        });
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError(true);
        setTasks({ my: [], assigned: [], tracked: [] });
      } finally {
        setLoading(false);
      }
    };

    setSelectedView(
      (localStorage.getItem("selectedView") as "tree" | "kanban") || "table",
    );
    setSelectedType(
      (localStorage.getItem("selectedType") as "my" | "assigned" | "tracked") ||
        "my",
    );
    fetchTasks();
  }, []);

  const handleTabChange = (tab: string) => {
    localStorage.setItem("selectedType", tab);
    setSelectedType(tab as TaskType);
  };

  const handleViewChange = (view: string) => {
    localStorage.setItem("selectedView", view);
    setSelectedView(view as "tree" | "kanban" | "table");
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const openDeleteTaskModal = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const openCreateSubTaskModal = (task: Task) => {
    setSelectedTask(task);
    setShowCreateSubModal(true);
  };

  const openAssignTaskModalByTask = (task: Task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  const handleCreateTask = async (taskData: Task) => {
    try {
      const data = await apiCall<{ data: Task }>("/task/create", {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      toast.success("Task created successfully");
      updateCurrentTasks((prev) => [...prev, data.data]);
      setShowCreateModal(false);
    } catch (error) {
      toast.error("Failed to create task");
      throw error;
    }
  };

  const handleCreateSubTask = async (taskData: Task) => {
    try {
      const serverTask = await apiCall<{ data: Task }>(
        `/task/${taskData?.parentTaskId}/create`,
        {
          method: "POST",
          body: JSON.stringify(taskData),
        },
      );

      toast.success("Task created successfully");
      updateCurrentTasks((prev) =>
        addSubTaskToTree(prev, serverTask.data.parentTaskId!, serverTask.data),
      );
      setShowCreateSubModal(false);
    } catch (error) {
      toast.error("Failed to create task");
      throw error;
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const data = await apiCall<{ data: Task }>(`/task/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(taskData),
      });

      toast.success("Task updated successfully");
      updateCurrentTasks((prev) =>
        updateTaskInTree(prev, data.data.id, data.data),
      );
      setShowEditModal(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error("Failed to update task");
      throw error;
    }
  };

  const handleConfirmDelete = async (taskId: string) => {
    try {
      await apiCall(`/task/${taskId}`, { method: "DELETE" });
      toast.success("Deleted task successfully");

      updateCurrentTasks((prev) => deleteTaskFromTree(prev, taskId));

      if (selectedType !== "my") {
        updateTaskType("my", (prev) => deleteTaskFromTree(prev, taskId));
      }

      setShowDeleteModal(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error("Failed to delete task");
      throw error;
    }
  };

  const handleStartTask = async (taskId: string) => {
    await handleUpdateTask(taskId, { status: "IN_PROGRESS" });
  };

  const handlePauseTask = async (taskId: string) => {
    await handleUpdateTask(taskId, { status: "TODO" });
  };

  const handleCompleteTask = async (taskId: string) => {
    const currentTask = findTask(currentTasks, taskId);
    if (!currentTask) {
      console.error(`Task with ID ${taskId} not found`);
      return;
    }

    if (!areAllSubtasksComplete(currentTask)) {
      toast.error("All subtasks must be completed first.");
      return;
    }

    await handleUpdateTask(taskId, { status: "DONE" });
  };

  const handleCancelTask = async (taskId: string) => {
    const currentTask = findTask(currentTasks, taskId);
    if (!currentTask) {
      console.error(`Task with ID ${taskId} not found`);
      return;
    }

    await cancelTaskAndSubtasks(currentTask, handleUpdateTask);
    await handleUpdateTask(taskId, { status: "CANCELLED" });
  };

  const handleAcceptViewer = async (task: Task, userId: string) => {
    try {
      await apiCall(`/task/${task?.id}/allow/${userId}`, { method: "POST" });

      const real_user = task.appliedUsers.find((user) => user.id === userId);

      if (!real_user) {
        toast.error("User not found");
        return;
      }

      updateCurrentTasks((prev) => {
        const updatedTasks = removeUserFromTaskField(
          addUserToTaskField(
            prev,
            task.id,
            userId,
            "trackedUsers",
            real_user as User,
          ),
          task.id,
          userId,
          "appliedUsers",
        );

        return updatedTasks;
      });

      setSelectedTask((prev) => {
        if (!prev) {
          return null;
        }
        return {
          ...prev,
          appliedUsers: prev.appliedUsers.filter((user) => user.id !== userId),
          trackedUsers: [...prev.trackedUsers, real_user],
        };
      });

      toast.success("Task assigned successfully");
    } catch (error) {
      toast.error("Failed to assign task");
      throw error;
    }
  };

  const handleUnassign = async (task: Task, userId: string) => {
    try {
      await apiCall(`/task/${task?.id}/unassign/${userId}`, { method: "POST" });

      updateCurrentTasks((prev) => {
        return removeUserFromTaskField(
          removeUserFromTaskField(prev, task.id, userId, "assignedUsers"),
          task.id,
          userId,
          "trackedUsers",
        );
      });

      setSelectedTask((prev) => {
        if (!prev) {
          return null;
        }
        return {
          ...prev,
          trackedUsers: prev.trackedUsers.filter((user) => user.id !== userId),
          assignedUsers: prev.assignedUsers.filter(
            (user) => user.id !== userId,
          ),
        };
      });

      toast.success("Task unassigned successfully");
    } catch (error) {
      toast.error("Failed to unassign task");
      throw error;
    }
  };

  const handleDecline = async (task: Task, userId: string) => {
    try {
      await apiCall(`/task/${task?.id}/reject/${userId}`, { method: "POST" });

      updateCurrentTasks((prev) => {
        return removeUserFromTaskField(prev, task.id, userId, "appliedUsers");
      });

      setSelectedTask((prev) => {
        if (!prev) {
          return null;
        }
        return {
          ...prev,
          appliedUsers: prev.appliedUsers.filter((user) => user.id !== userId),
        };
      });

      toast.success("Application declined successfully");
    } catch (error) {
      toast.error("Failed to decline task");
      throw error;
    }
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

      <Tabs value={selectedType} onValueChange={handleTabChange}>
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
              openEditModal={openEditTaskModal}
              openAddSubtask={openCreateSubTaskModal}
              openDeleteTask={openDeleteTaskModal}
              openAssignTask={openAssignTaskModalByTask}
            />
          )}
          {selectedView === "kanban" && (
            <MyTasksKanban
              tasks={flattenTasks(tasks.my)}
              onEditTask={openEditTaskModal}
              onDeleteTask={openDeleteTaskModal}
              onAssignTask={openAssignTaskModalByTask}
              onCreateSubTask={openCreateSubTaskModal}
              onPause={handlePauseTask}
              onStart={handleStartTask}
              onComplete={handleCompleteTask}
              onCancel={handleCancelTask}
            />
          )}
          {selectedView === "table" && (
            <MyTasksTable
              tasks={tasks.my}
              onEditTask={openEditTaskModal}
              onDeleteTask={openDeleteTaskModal}
              onAssignTask={openAssignTaskModalByTask}
              onCreateSubTask={openCreateSubTaskModal}
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
          {selectedView === "tree" && (
            <AssignedTreeGraph
              tasks={tasks.assigned}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              openAddSubtask={openCreateSubTaskModal}
              onCompleteTask={handleCompleteTask}
              onCancelTask={handleCancelTask}
              onStartTask={handleStartTask}
              onPauseTask={handlePauseTask}
            />
          )}
          {selectedView === "table" && (
            <AssignedTasksTable
              tasks={tasks.assigned}
              onStartTask={handleStartTask}
              onPauseTask={handlePauseTask}
              onCompleteTask={handleCompleteTask}
              onCancelTask={handleCancelTask}
              onCreateSubTask={openCreateSubTaskModal}
            />
          )}
        </TabsContent>
        <TabsContent value="tracked">
          {selectedView === "kanban" && (
            <PublicTasksKanban tasks={flattenTasks(tasks.tracked)} />
          )}
          {selectedView === "tree" && (
            <TrackedTreeGraph tasks={tasks.tracked} />
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
        onAccept={handleAcceptViewer}
        onDecline={handleDecline}
        onUnassign={handleUnassign}
      />
    </BasicPageLayout>
  );
}
