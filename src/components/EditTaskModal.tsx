import type React from "react";

import { useState, useEffect } from "react";
import type { Task, TaskStatus, RecurrenceType } from "@/types/task";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  task: Task | null;
}

export function EditTaskModal({
  open,
  onClose,
  onUpdateTask,
  task,
}: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    status: "TODO" as TaskStatus,
    isPublic: false,
    recurrenceType: null as string | null,
    recurrenceExpiresAt: null as string | null,
    recurrences: null as number | null,
  });
  const [recurrenceEndType, setRecurrenceEndType] = useState<
    "date" | "count" | "never"
  >("never");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      const deadlineString = new Date(task.deadline).toISOString().slice(0, 16);
      const recurrenceExpiresAtString = task.recurrenceExpiresAt
        ? new Date(task.recurrenceExpiresAt).toISOString().slice(0, 16)
        : null;

      setFormData({
        title: task.title,
        description: task.description,
        deadline: deadlineString,
        status: task.status as TaskStatus,
        isPublic: task.isPublic,
        recurrenceType: task.recurrenceType || null,
        recurrenceExpiresAt: recurrenceExpiresAtString,
        recurrences: task.recurrences || null,
      });

      if (task.recurrenceExpiresAt) {
        setRecurrenceEndType("date");
      } else if (task.recurrences) {
        setRecurrenceEndType("count");
      } else {
        setRecurrenceEndType("never");
      }
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (
        deadlineDate <= now &&
        formData.status !== "DONE" &&
        formData.status !== "CANCELLED"
      ) {
        newErrors.deadline =
          "Deadline must be in the future for uncompleted tasks";
      }
    }

    if (formData.recurrenceType) {
      if (recurrenceEndType === "date" && !formData.recurrenceExpiresAt) {
        newErrors.recurrenceExpiresAt = "Expiry date is required";
      }
      if (
        recurrenceEndType === "count" &&
        (!formData.recurrences || formData.recurrences < 1)
      ) {
        newErrors.recurrences = "Number of repetitions must be at least 1";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm() && task) {
      const taskData: Partial<Task> = {
        id: task.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline,
        status: formData.status,
        isPublic: formData.isPublic,
        subTasks: task.subTasks,
        recurrenceType: formData.recurrenceType as RecurrenceType,
        recurrenceExpiresAt:
          recurrenceEndType === "date" ? formData.recurrenceExpiresAt : null,
        recurrences:
          recurrenceEndType === "count" ? formData.recurrences : null,
      };

      onUpdateTask(taskData as Task);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      deadline: "",
      status: "TODO",
      isPublic: false,
      recurrenceType: null,
      recurrenceExpiresAt: null,
      recurrences: null,
    });
    setRecurrenceEndType("never");
    setErrors({});
    onClose();
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <Input
              id="edit-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Task title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Detailed task description"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODO">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="DONE">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-deadline"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Deadline Date and Time *
            </label>
            <Input
              id="edit-deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
              className={errors.deadline ? "border-red-500" : ""}
            />
            {errors.deadline && (
              <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-recurrence-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Recurrence
            </label>
            <div className="flex gap-2">
              <select
                id="edit-recurrence-type"
                value={formData.recurrenceType || ""}
                onChange={(e) => {
                  const value = e.target.value || null;
                  handleInputChange("recurrenceType", value);
                  // Reset recurrence end fields when type changes
                  if (!value) {
                    setRecurrenceEndType("never");
                    handleInputChange("recurrenceExpiresAt", null);
                    handleInputChange("recurrences", null);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                <option value="PARENT">Copy Parent</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>

              {formData.recurrenceType &&
                formData.recurrenceType !== "PARENT" && (
                  <select
                    id="edit-recurrence-end-type"
                    value={recurrenceEndType}
                    onChange={(e) => {
                      const value = e.target.value as
                        | "date"
                        | "count"
                        | "never";
                      setRecurrenceEndType(value);
                      // Clear the opposite field
                      if (value === "date") {
                        handleInputChange("recurrences", null);
                      } else if (value === "count") {
                        handleInputChange("recurrenceExpiresAt", null);
                      } else {
                        handleInputChange("recurrenceExpiresAt", null);
                        handleInputChange("recurrences", null);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="never">Never ends</option>
                    <option value="date">End by date</option>
                    <option value="count">After X times</option>
                  </select>
                )}
            </div>
          </div>

          {formData.recurrenceType && recurrenceEndType === "date" && (
            <div>
              <label
                htmlFor="edit-recurrence-expires-at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recurrence End Date *
              </label>
              <Input
                id="edit-recurrence-expires-at"
                type="datetime-local"
                value={formData.recurrenceExpiresAt || ""}
                onChange={(e) =>
                  handleInputChange("recurrenceExpiresAt", e.target.value)
                }
                className={errors.recurrenceExpiresAt ? "border-red-500" : ""}
              />
              {errors.recurrenceExpiresAt && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.recurrenceExpiresAt}
                </p>
              )}
            </div>
          )}

          {formData.recurrenceType && recurrenceEndType === "count" && (
            <div>
              <label
                htmlFor="edit-recurrences"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Repetitions *
              </label>
              <Input
                id="edit-recurrences"
                type="number"
                min="1"
                value={formData.recurrences || ""}
                onChange={(e) =>
                  handleInputChange(
                    "recurrences",
                    e.target.value ? Number.parseInt(e.target.value) : null,
                  )
                }
                placeholder="e.g., 5"
                className={errors.recurrences ? "border-red-500" : ""}
              />
              {errors.recurrences && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.recurrences}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="edit-deadline"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Visibility
            </label>
            <div className="flex flex-row items-center gap-1">
              <Checkbox
                id="edit-public"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublic", checked)
                }
              />
              <p className="text-sm">Make this task public</p>
            </div>
            {errors.deadline && (
              <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Update Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
