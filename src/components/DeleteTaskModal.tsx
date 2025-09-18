import type { Task } from "@/types/task";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteTaskModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmDelete: (taskId: string) => void;
  task: Task | null;
}

export function DeleteTaskModal({
  open,
  onClose,
  onConfirmDelete,
  task,
}: DeleteTaskModalProps) {
  const handleDelete = () => {
    if (task) {
      onConfirmDelete(task.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this task?
          </p>

          {task && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
              <p className="text-gray-600 text-sm mb-2">{task.description}</p>
              <p className="text-gray-500 text-xs">
                Deadline:{" "}
                {new Date(task.deadline).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          <p className="text-red-600 text-sm mt-4 font-medium">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

