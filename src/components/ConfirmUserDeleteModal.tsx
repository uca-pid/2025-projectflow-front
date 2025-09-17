import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

// Define the User type
interface User {
  id: string;
  name: string | null;
  email: string;
}

interface DeleteUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteUserModal({
  user,
  open,
  onOpenChange,
}: DeleteUserModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!user) return;

    startTransition(async () => {
      try {
        // Replace with your actual API call
        // const result = await deleteUser(user.id);
        console.log("Deleting user:", user.id);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/user/delete/${user.id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        console.log(response);
        const data = await response.json();
        console.log(data);

        console.log("User deleted successfully");
        onOpenChange(false);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user
            and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <Trash2 className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-medium text-red-800">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {user.name || "this user"}
                  </span>
                  ?
                </p>
                <p className="text-sm text-red-600 mt-1">Email: {user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
