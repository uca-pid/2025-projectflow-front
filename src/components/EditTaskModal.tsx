import { useState, useEffect } from "react";
import type { Task, TaskStatus } from "@/types/task";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, taskData: Task) => void;
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      const deadlineString = new Date(task.deadline).toISOString().slice(0, 16);
      setFormData({
        title: task.title,
        description: task.description,
        deadline: deadlineString,
        status: task.status as TaskStatus,
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!formData.deadline) {
      newErrors.deadline = "La fecha límite es requerida";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate <= now && formData.status !== "DONE") {
        newErrors.deadline =
          "La fecha límite debe ser futura para tareas no completadas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm() && task) {
      const taskData: Partial<Task> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline,
        status: formData.status,
      };

      onUpdateTask(task.id, taskData as Task);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      deadline: "",
      status: "TODO",
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getMinDateTime = () => {
    if (formData.status === "DONE") {
      return ""; // No minimum for completed tasks
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Tarea</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Título *
            </label>
            <Input
              id="edit-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Título de la tarea"
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
              Descripción *
            </label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción detallada de la tarea"
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
              Estado
            </label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODO">Pendiente</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="DONE">Completada</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-deadline"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha y Hora Límite *
            </label>
            <Input
              id="edit-deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
              min={getMinDateTime()}
              className={errors.deadline ? "border-red-500" : ""}
            />
            {errors.deadline && (
              <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar Tarea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
