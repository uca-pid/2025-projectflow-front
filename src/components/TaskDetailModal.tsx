import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TaskNotes } from "@/components/TaskNotes";
import { TaskObjectives } from "@/components/TaskObjectives";
import { Calendar, User, Users, Clock, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Task, type Note, type Objective } from "@/types/task";
import { getStatusVariant } from "@/lib/task-status-utils";
import { apiCall } from "@/lib/api-client";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskDetailModal({ open, onClose, task }: TaskDetailModalProps) {
  const [enrichedTask, setEnrichedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTaskNotes = async () => {
      if (!task || !open) {
        setEnrichedTask(null);
        return;
      }

      setLoading(true);
      try {
        const notesResponse = await apiCall("GET", `/task/${task.id}/notes`);
        const objectivesResponse = await apiCall(
          "GET",
          `/task/${task.id}/objectives`,
        );
        setEnrichedTask({
          ...task,
          notes: (notesResponse?.data as Note[]) || [],
          objectives: (objectivesResponse?.data as Objective[]) || [],
        });
      } catch (error) {
        console.warn("Could not fetch notes:", error);
        setEnrichedTask({
          ...task,
          notes: [],
          objectives: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaskNotes();
  }, [task, open]);

  if (!enrichedTask) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className=" min-w-1/3 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span className="text-xl font-bold">{enrichedTask.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid flex-row w-full justify-between grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                  {enrichedTask.description || "No description provided"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Status
                </h3>
                <Badge variant={getStatusVariant(enrichedTask.status)}>
                  {enrichedTask.status}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Creator
                </h3>
                <p className="text-gray-800">
                  {enrichedTask.creator?.name || "Unknown"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Deadline
                </h3>
                <p className="text-gray-800">
                  {formatDate(enrichedTask.deadline)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  Created
                </h3>
                <p className="text-gray-600 text-sm">
                  {formatDate(enrichedTask.createdAt)}
                </p>
              </div>

              {enrichedTask.assignedUsers &&
                enrichedTask.assignedUsers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Assigned Users
                    </h3>
                    <div className="space-y-1 max-h-[60px] overflow-y-auto">
                      {enrichedTask.assignedUsers.map((user, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {user.name || "Unknown User"}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              {enrichedTask.isPublic && (
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Public Task
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {enrichedTask.subTasks && enrichedTask.subTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Subtasks ({enrichedTask.subTasks.length})
              </h3>
              <div className="space-y-2">
                {enrichedTask.subTasks.map((subTask, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{subTask.title}</span>
                    <Badge variant={getStatusVariant(subTask.status || "TODO")}>
                      {subTask.status || "TODO"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">Loading more details...</div>
          ) : (
            <Tabs defaultValue="notes">
              <TabsList>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="objectives">Objectives</TabsTrigger>
              </TabsList>
              <TabsContent value="notes">
                <TaskNotes
                  task={enrichedTask}
                  onNotesUpdate={(notes) => {
                    setEnrichedTask((prev) =>
                      prev ? { ...prev, notes } : prev,
                    );
                  }}
                />
              </TabsContent>
              <TabsContent value="objectives">
                <TaskObjectives task={enrichedTask} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

