import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyTasksTable } from "@/components/MyTasksTable";
import { AssignedTasksTable } from "@/components/AssignedTasksTable";
import { MyTasksKanban } from "@/components/MyTasksKanban";
import { AssignedTasksKanban } from "@/components/AssignedTasksKanban";
import { PublicTasksKanban } from "@/components/PublicTasksKanban";
import { PublicTasksTable } from "@/components/PublicTasksTable";
import TreeGraph from "@/components/TreeGraph";
import { type Task } from "@/types/task";
import { type ViewType } from "./TasksViewSelector";

export type TaskType = "my" | "assigned" | "tracked";

export interface TasksState {
  my: Task[];
  assigned: Task[];
  tracked: Task[];
}

interface TasksTabsProps {
  selectedType: TaskType;
  selectedView: ViewType;
  tasks: TasksState;
  selectedTask: Task | null;
  onTabChange: (tab: TaskType) => void;
  // Task operations
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onDeleteTaskById: (taskId: string) => void;
  onAssignTask: (taskId: string) => void;
  onAssignTaskByTask: (task: Task) => void;
  onCreateSubTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => Promise<void>;
  onStartTask: (taskId: string) => Promise<void>;
  onPauseTask: (taskId: string) => Promise<void>;
  onCancelTask: (taskId: string) => Promise<void>;
  // Tree graph specific
  setSelectedTask: (task: Task | null) => void;
}

export function TasksTabs({
  selectedType,
  selectedView,
  tasks,
  selectedTask,
  onTabChange,
  onEditTask,
  onDeleteTask,
  onDeleteTaskById,
  onAssignTask,
  onAssignTaskByTask,
  onCreateSubTask,
  onCompleteTask,
  onStartTask,
  onPauseTask,
  onCancelTask,
  setSelectedTask,
}: TasksTabsProps) {
  const handleTabChange = (tab: string) => {
    onTabChange(tab as TaskType);
  };

  return (
    <Tabs value={selectedType} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="my">My Tasks</TabsTrigger>
        <TabsTrigger value="assigned">Assigned Tasks</TabsTrigger>
        <TabsTrigger value="tracked">Tracked Tasks</TabsTrigger>
      </TabsList>
      
      <TabsContent value="my">
        {selectedView === "tree" && (
          <TreeGraph
            tasks={tasks.my}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            openEditModal={onEditTask}
            openAddSubtask={onCreateSubTask}
            openDeleteTask={onDeleteTask}
            openAssignTask={onAssignTask}
          />
        )}
        {selectedView === "kanban" && (
          <MyTasksKanban
            tasks={tasks.my}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTaskById}
            onAssignTask={onAssignTaskByTask}
            onCreateSubTask={onCreateSubTask}
            onComplete={onCompleteTask}
            onStart={onStartTask}
            onPause={onPauseTask}
            onCancel={onCancelTask}
          />
        )}
        {selectedView === "table" && (
          <MyTasksTable
            tasks={tasks.my}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onAssignTask={onAssignTask}
            onCreateSubTask={onCreateSubTask}
          />
        )}
      </TabsContent>
      
      <TabsContent value="assigned">
        {selectedView === "kanban" && (
          <AssignedTasksKanban
            tasks={tasks.assigned}
            onStartTask={onStartTask}
            onPauseTask={onPauseTask}
            onCompleteTask={onCompleteTask}
            onCancelTask={onCancelTask}
            onCreateSubTask={onCreateSubTask}
          />
        )}
        {selectedView === "table" && (
          <AssignedTasksTable
            tasks={tasks.assigned}
            onStartTask={onStartTask}
            onPauseTask={onPauseTask}
            onCompleteTask={onCompleteTask}
            onCancelTask={onCancelTask}
            onCreateSubTask={onCreateSubTask}
          />
        )}
      </TabsContent>
      
      <TabsContent value="tracked">
        {selectedView === "kanban" && (
          <PublicTasksKanban tasks={tasks.tracked} />
        )}
        {selectedView === "table" && (
          <PublicTasksTable tasks={tasks.tracked} />
        )}
      </TabsContent>
    </Tabs>
  );
}