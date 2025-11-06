import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TaskNotes } from "@/components/TaskNotes";
import { Calendar, User, Users, Clock, Target } from "lucide-react";
import { type Task, type Note } from "@/types/task";
import { getStatusVariant } from "@/lib/task-status-utils";
import { apiCall } from "@/lib/api-client";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskDetailModal({ open, onClose, task }: TaskDetailModalProps) {
  const [taskWithNotes, setTaskWithNotes] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTaskNotes = async () => {
      if (!task || !open) {
        setTaskWithNotes(null);
        return;
      }

      setLoading(true);
      try {
        const notesResponse = await apiCall("GET", `/task/${task.id}/notes`);
        setTaskWithNotes({
          ...task,
          notes: (notesResponse?.data as Note[]) || [],
        });
      } catch (error) {
        console.warn("Could not fetch notes:", error);
        setTaskWithNotes({
          ...task,
          notes: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaskNotes();
  }, [task, open]);

  if (!taskWithNotes) {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span className="text-xl font-bold">{taskWithNotes.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                  {taskWithNotes.description || "No description provided"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Status
                </h3>
                <Badge variant={getStatusVariant(taskWithNotes.status)}>
                  {taskWithNotes.status}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Creator
                </h3>
                <p className="text-gray-800">
                  {taskWithNotes.creator?.name || "Unknown"}
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
                  {formatDate(taskWithNotes.deadline)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  Created
                </h3>
                <p className="text-gray-600 text-sm">
                  {formatDate(taskWithNotes.createdAt)}
                </p>
              </div>

              {taskWithNotes.assignedUsers && taskWithNotes.assignedUsers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assigned Users
                  </h3>
                  <div className="space-y-1">
                    {taskWithNotes.assignedUsers.map((user, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {user.name || "Unknown User"}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {taskWithNotes.isPublic && (
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Public Task
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {taskWithNotes.subTasks && taskWithNotes.subTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                Subtasks ({taskWithNotes.subTasks.length})
              </h3>
              <div className="space-y-2">
                {taskWithNotes.subTasks.map((subTask, index) => (
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
            <div className="text-center py-4">Loading notes...</div>
          ) : (
            <TaskNotes
              task={taskWithNotes}
              onNotesUpdate={(notes) => {
                setTaskWithNotes(prev => prev ? { ...prev, notes } : prev);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}