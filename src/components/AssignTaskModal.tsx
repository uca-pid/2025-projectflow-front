import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task } from "../types/task";
import { useState, useEffect } from "react";
import { Copy, Check, X, Ban, Shield } from "lucide-react";
import { toast } from "sonner";

interface AssignTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

const ClickHereToCopy = ({ link }: { link: string }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  if (copied)
    return (
      <div className="flex flex-row items-center gap-2 justify-center">
        <Input
          className="max-w-[250px] text-green-800 font-semibold"
          value={"Copied!"}
          disabled
          readOnly
        />
        <Check className="text-green-600" />
      </div>
    );
  else
    return (
      <div className="flex flex-row items-center gap-2 justify-center">
        <Input
          className="max-w-[250px]"
          value={link.slice(0, 35) + "..."}
          disabled
          readOnly
        />
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          title="Copy"
        >
          <Copy className="cursor-pointer" />
        </Button>
      </div>
    );
};

export const AssignTaskModal = ({
  open,
  onClose,
  task,
}: AssignTaskModalProps) => {
  const link = `${window.location.origin}/apply/${task?.id}`;

  const [localTask, setLocalTask] = useState<Task>(task);
  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const handleAccept = async (userId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/${task?.id}/assign/${userId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      toast.error("Failed to assign task");
      throw new Error("Failed to assign task");
    } else {
      const userToAssign = localTask.appliedUsers.find(
        (user) => user.id === userId,
      );
      setLocalTask({
        ...localTask,
        assignedUsers: [...localTask.assignedUsers, userToAssign],
        appliedUsers: localTask.appliedUsers.filter(
          (user) => user.id !== userId,
        ),
      });
      toast.success("Task assigned successfully");
    }
  };

  const handleUnassign = async (userId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/${task?.id}/unassign/${userId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      toast.error("Failed to unassign task");
      throw new Error("Failed to unassign task");
    } else {
      setLocalTask({
        ...localTask,
        assignedUsers: localTask.assignedUsers.filter(
          (user) => user.id !== userId,
        ),
      });
      toast.success("Task unassigned successfully");
    }
  };

  const handleDecline = async (userId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/${task?.id}/reject/${userId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      toast.error("Failed to decline task");
      throw new Error("Failed to decline task");
    } else {
      setLocalTask({
        ...localTask,
        appliedUsers: localTask.appliedUsers.filter(
          (user) => user.id !== userId,
        ),
      });
      toast.success("Task declined successfully");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Let's assign this task to someone
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="my-tasks">
          <TabsList className="w-full justify-center">
            <TabsTrigger value="assign">Assign</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>
          <TabsContent value="assign" className="flex flex-col gap-4">
            <p className="text-gray-600 text-sm">
              Share this QR code with the person you want to assign this task
              to:
            </p>
            <div className="flex justify-center">
              <QRCodeSVG value={link} size={256} />
            </div>
            <p className="text-gray-600 text-sm">Or send this link:</p>
            <ClickHereToCopy link={link} />
          </TabsContent>
          <TabsContent value="manage">
            {/* All Users that applied to the task */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAME
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMAIL
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!localTask?.appliedUsers && !localTask?.assignedUsers && (
                  <TableRow>
                    <TableCell
                      className="font-medium text-center text-gray-500"
                      colSpan={3}
                    >
                      No users are assigned or applied yet
                    </TableCell>
                  </TableRow>
                )}
                {localTask?.assignedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex flex-row items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.image} />
                        <AvatarFallback>{user?.name![0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell className="font-medium">
                      {user.id === localTask?.creatorId ? (
                        <Button variant="ghost" title="Unassign" disabled>
                          <Shield className="text-blue-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          title="Unassign"
                          onClick={() => handleUnassign(user.id!)}
                        >
                          <Ban className="text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {localTask?.appliedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex flex-row items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.image} />
                        <AvatarFallback>{user?.name![0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell className="font-medium">
                      <Button
                        variant="ghost"
                        title="Accept"
                        onClick={() => handleAccept(user.id!)}
                      >
                        <Check className="text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        title="Decline"
                        onClick={() => handleDecline(user.id!)}
                      >
                        <X className="text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
