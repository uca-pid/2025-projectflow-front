import type { Task } from "@/types/task";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ConfirmCloneTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCloneTask: (taskId: string) => Promise<void>;
  task: Task | null;
}

export function ConfirmCloneTaskModal({
  open,
  onClose,
  onCloneTask,
  task,
}: ConfirmCloneTaskModalProps) {
  const [isCloning, setIsCloning] = useState<boolean>(false);

  const handleClone = async () => {
    if (task) {
      setIsCloning(true);
      await onCloneTask(task.id);
      setIsCloning(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Clone Task</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to clone this task?
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

          <p className="text-sm mt-4 font-medium">
            Cloning this task creates a copy of it and its subtasks on your
            profile.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={isCloning}
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isCloning} onClick={handleClone}>
            {isCloning ? "Cloning..." : "Clone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
