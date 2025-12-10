import { useState, useEffect, useCallback } from "react";
import LoadingPage from "./LoadingPage";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { CreateSubTaskModal } from "@/components/CreateSubTaskModal";
import { EditTaskModal } from "@/components/EditTaskModal";
import { DeleteTaskModal } from "@/components/DeleteTaskModal";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { Button } from "@/components/ui/button";
import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import { AssignTaskModal } from "@/components/AssignTaskModal";
import { SetSlaModal } from "@/components/SetSlaModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyTasksTable } from "@/components/MyTasksTable";
import { MyTasksKanban } from "@/components/MyTasksKanban";
import { AssignedTasksTable } from "@/components/AssignedTasksTable";
import { AssignedTasksKanban } from "@/components/AssignedTasksKanban";
import AssignedTreeGraph from "@/components/AssignedTreeGraph";
import { PublicTasksKanban } from "@/components/PublicTasksKanban";
import { PublicTasksTable } from "@/components/PublicTasksTable";
import SubscribedTreeGraph from "@/components/SubscribedTreeGraph";
import TreeGraph from "@/components/TreeGraph";
import Dashboard from "@/components/Dashboard";

import {
  type Task,
  type TasksUseState,
  type TaskType,
  type ViewType,
} from "@/types/task";
import {
  flattenTasks,
  updateTaskInTree,
  addSubTaskToTree,
  deleteTaskFromTree,
  validateTaskUpdate,
  findTask,
} from "@/lib/task-utils";
import { useAuth } from "@/hooks/useAuth";
import { apiCall } from "@/lib/api-client";
import {
  useTaskRefetchListener,
  useTaskRefetchTrigger,
} from "@/hooks/useTaskRefetch";

import { toast } from "sonner";

export default function TasksPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<TasksUseState>({
    my: [],
    assigned: [],
    subscribed: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [selectedView, setSelectedView] = useState<ViewType>("table");
  const [selectedType, setSelectedType] = useState<TaskType>("my");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateSubModal, setShowCreateSubModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSlaModal, setShowSlaModal] = useState(false);

  const refetchTasks = useTaskRefetchTrigger();
  const fetchTasks = useCallback(async () => {
    try {
      const [myRes, assignedRes, subscribedRes] = await Promise.all([
        apiCall("GET", "/task/getOwned"),
        apiCall("GET", "/task/getAssigned"),
        apiCall("GET", "/task/getSubscribed"),
      ]);

      if (!myRes.success || !assignedRes.success || !subscribedRes.success) {
        throw new Error("Failed to fetch tasks");
      }

      setTasks({
        my: myRes.data as Task[],
        assigned: assignedRes.data as Task[],
        subscribed: subscribedRes.data as Task[],
      });

      setError(false);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for refetch events
  useTaskRefetchListener(fetchTasks);

  useEffect(() => {
    const initializeTasks = async () => {
      await fetchTasks();

      const [view, type] = await Promise.all([
        localStorage.getItem("viewType") || "table",
        localStorage.getItem("taskType") || "my",
      ]);

      setSelectedView(view as ViewType);
      setSelectedType(type as TaskType);
    };

    initializeTasks();
  }, [fetchTasks]);

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

  async function updateTask(task: Task) {
    const oldTask = findTask(tasks[selectedType], task.id);
    const selectedTasks = tasks[selectedType];
    const updateValidation = await validateTaskUpdate(
      task,
      oldTask!,
      updateTask,
    );
    if (!updateValidation.valid) {
      toast.error(updateValidation.message);
      return;
    }
    const response = await apiCall("PUT", `/task/${task.id}`, task);
    if (response.success) {
      toast.success("Task updated successfully");
      const updatedTask = response.data as Task;
      const updatedTasks = updateTaskInTree(
        selectedTasks,
        task.id,
        updatedTask,
      );
      setTasks({ ...tasks, [selectedType]: updatedTasks });
      setSelectedTask(updatedTask);
    }
    refetchTasks();
  }

  async function createTask(task: Task) {
    const response = await apiCall("POST", "/task/create", task);
    if (response.success) {
      toast.success("Task created successfully");
      const newTask = response.data as Task;
      const updatedTasks = [...tasks[selectedType], newTask];
      setTasks({ ...tasks, [selectedType]: updatedTasks });
      setSelectedTask(newTask);
    }
  }

  async function createSubtask(task: Task) {
    if (!task.parentTaskId) return;
    const response = await apiCall(
      "POST",
      `/task/${task.parentTaskId}/create`,
      task,
    );
    if (response.success) {
      toast.success("Task created successfully");
      const newTask = response.data as Task;
      const updatedTasks = addSubTaskToTree(
        tasks[selectedType],
        task.parentTaskId,
        newTask,
      );
      setTasks({ ...tasks, [selectedType]: updatedTasks });
      setSelectedTask(newTask);
    }
  }

  async function deleteTask(taskId: string) {
    const response = await apiCall("DELETE", `/task/${taskId}`);
    if (response.success) {
      toast.success("Task deleted successfully");
      const updatedTasks = deleteTaskFromTree(tasks[selectedType], taskId);
      setTasks({ ...tasks, [selectedType]: updatedTasks });
      setSelectedTask(null);
    }
  }

  async function allowViewer(task: Task, userId: string, allow: boolean) {
    const response = allow
      ? await apiCall("POST", `/task/${task.id}/acceptApplication/${userId}`)
      : await apiCall("POST", `/task/${task.id}/rejectApplication/${userId}`);
    if (response.success) {
      toast.success(`${allow ? "Allowed" : "Denied"} user successfully`);
      return true;
    }
    return false;
  }

  async function unassignUser(task: Task, userId: string) {
    const response = await apiCall(
      "POST",
      `/task/${task.id}/unassign/${userId}`,
    );
    if (response.success) {
      toast.success(`Unassigned user successfully`);
      return true;
    }
    return false;
  }

  return (
    <BasicPageLayout>
      {/* Header */}
      <Dashboard
        tasks={tasks[selectedType]}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        openCreateModal={setShowCreateModal}
        showGraphs
        showTitle
      />

      <Tabs
        value={selectedType}
        onValueChange={(value) => {
          setSelectedType(value as TaskType);
          localStorage.setItem("taskType", value);
        }}
      >
        <TabsList>
          <TabsTrigger value="my">My Tasks</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Tasks</TabsTrigger>
          <TabsTrigger value="subscribed">Subscribed Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          {selectedView === "table" && (
            <MyTasksTable
              tasks={tasks.my}
              setSelectedTask={setSelectedTask}
              openEditModal={setShowEditModal}
              openDeleteModal={setShowDeleteModal}
              openAssignModal={setShowAssignModal}
              openSubtaskModal={setShowCreateSubModal}
              openDetailsModal={setShowDetailsModal}
              openSlaModal={setShowSlaModal}
            />
          )}

          {selectedView === "kanban" && (
            <MyTasksKanban
              tasks={flattenTasks(tasks.my)}
              setSelectedTask={setSelectedTask}
              openEditModal={setShowEditModal}
              openDeleteModal={setShowDeleteModal}
              openAssignModal={setShowAssignModal}
              openSubtaskModal={setShowCreateSubModal}
              openDetailsModal={setShowDetailsModal}
              updateTask={updateTask}
            />
          )}
          {selectedView === "tree" && (
            <TreeGraph
              tasks={tasks.my}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              openEditModal={() => setShowEditModal(true)}
              openAddSubtask={() => setShowCreateSubModal(true)}
              openDeleteTask={() => setShowDeleteModal(true)}
              openAssignTask={() => setShowAssignModal(true)}
              openDetailsModal={() => setShowDetailsModal(true)}
              openSlaModal={() => setShowSlaModal(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="assigned">
          {selectedView === "table" && (
            <AssignedTasksTable
              tasks={tasks.assigned}
              setSelectedTask={setSelectedTask}
              openCreateSubTask={setShowCreateSubModal}
              openDetailsModal={setShowDetailsModal}
              updateTask={updateTask}
            />
          )}
          {selectedView === "kanban" && (
            <AssignedTasksKanban
              tasks={flattenTasks(tasks.assigned)}
              setSelectedTask={setSelectedTask}
              openAssignModal={setShowAssignModal}
              openDeleteModal={setShowDeleteModal}
              updateTask={updateTask}
            />
          )}
          {selectedView === "tree" && (
            <AssignedTreeGraph
              tasks={tasks.assigned}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              openAddSubtask={() => setShowCreateSubModal(true)}
              openDetailsModal={() => setShowDetailsModal(true)}
              updateTask={updateTask}
            />
          )}
        </TabsContent>

        <TabsContent value="subscribed">
          {selectedView === "table" && (
            <PublicTasksTable tasks={tasks.subscribed} />
          )}
          {selectedView === "kanban" && (
            <PublicTasksKanban tasks={tasks.subscribed} />
          )}
          {selectedView === "tree" && (
            <SubscribedTreeGraph tasks={tasks.subscribed} />
          )}
        </TabsContent>
      </Tabs>

      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={createTask}
      />
      <CreateSubTaskModal
        open={showCreateSubModal}
        onClose={() => {
          setShowCreateSubModal(false);
          setSelectedTask(null);
        }}
        onCreateTask={createSubtask}
        creator={user || null}
        parentTask={selectedTask}
      />
      <EditTaskModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        onUpdateTask={updateTask}
        task={selectedTask}
      />
      <DeleteTaskModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        onConfirmDelete={deleteTask}
        task={selectedTask}
      />
      {selectedType === "my" && (
        <>
          <AssignTaskModal
            open={showAssignModal}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedTask(null);
            }}
            task={selectedTask!}
            onAllow={allowViewer}
            onUnassign={unassignUser}
          />
          <SetSlaModal
            task={selectedTask!}
            open={showSlaModal}
            onClose={() => {
              setShowSlaModal(false);
              setSelectedTask(null);
            }}
            onUpdateTask={updateTask}
          />
        </>
      )}
      <TaskDetailModal
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </BasicPageLayout>
  );
}
