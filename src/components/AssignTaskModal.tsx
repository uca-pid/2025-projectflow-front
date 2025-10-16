import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task } from "../types/task";
import type { User } from "../types/user";
import { useState, useEffect } from "react";
import { Copy, Check, X, Ban, Mail, Send, Link } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localTask, setLocalTask] = useState<Task>(task);

  const link = `${import.meta.env.VITE_FRONT_URL}/apply/${task?.id}`;

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    //Esto es temporal
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/task/${task.id}/invite`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        },
      );

      if (response.ok) {
        toast.success(
          `Invitation email sent to ${email}! They can join using this email.`,
        );

        setEmail("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (userId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/task/${task?.id}/allow/${userId}`,
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
        trackedUsers: [...localTask.trackedUsers, userToAssign as User],
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
        trackedUsers: localTask.trackedUsers.filter(
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

  useEffect(() => {
    if (open) {
      setLocalTask(task);
    }
  }, [open, task]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Invite users to this task by email or share the application link
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="invite" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite">Invite by Email</TabsTrigger>
            <TabsTrigger value="manage">Manage Assigned</TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      If the user exists, they'll get a notification. Otherwise,
                      they'll receive an email invitation.
                    </p>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <Label className="text-sm font-medium">
                      Or share this link to invite viewers:
                    </Label>
                  </div>
                  <ClickHereToCopy link={link} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
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
                    STATUS
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!localTask?.appliedUsers?.length &&
                  !localTask?.assignedUsers?.length && (
                    <TableRow>
                      <TableCell
                        className="font-medium text-center text-gray-500"
                        colSpan={4}
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
                        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Assigned
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.id === localTask?.creatorId ? (
                        <Button
                          variant="ghost"
                          title="We Support Israel"
                          className="hover:bg-gray-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 464 512"
                            className="text-blue-500"
                            fill="currentColor"
                          >
                            <path d="M405.68 256l53.21-89.39C473.3 142.4 455.48 112 426.88 112H319.96l-55.95-93.98C256.86 6.01 244.43 0 232 0s-24.86 6.01-32.01 18.02L144.04 112H37.11c-28.6 0-46.42 30.4-32.01 54.61L58.32 256 5.1 345.39C-9.31 369.6 8.51 400 37.11 400h106.93l55.95 93.98C207.14 505.99 219.57 512 232 512s24.86-6.01 32.01-18.02L319.96 400h106.93c28.6 0 46.42-30.4 32.01-54.61L405.68 256zm-12.78-88l-19.8 33.26L353.3 168h39.6zm-52.39 88l-52.39 88H175.88l-52.39-88 52.38-88h112.25l52.39 88zM232 73.72L254.79 112h-45.57L232 73.72zM71.1 168h39.6l-19.8 33.26L71.1 168zm0 176l19.8-33.26L110.7 344H71.1zM232 438.28L209.21 400h45.57L232 438.28zM353.29 344l19.8-33.26L392.9 344h-39.61z" />
                          </svg>
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

                {localTask?.trackedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex flex-row items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.image} />
                        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Viewer
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.id === localTask?.creatorId ? (
                        <Button
                          variant="ghost"
                          title="We Support Israel"
                          className="hover:bg-gray-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 464 512"
                            className="text-blue-500"
                            fill="currentColor"
                          >
                            <path d="M405.68 256l53.21-89.39C473.3 142.4 455.48 112 426.88 112H319.96l-55.95-93.98C256.86 6.01 244.43 0 232 0s-24.86 6.01-32.01 18.02L144.04 112H37.11c-28.6 0-46.42 30.4-32.01 54.61L58.32 256 5.1 345.39C-9.31 369.6 8.51 400 37.11 400h106.93l55.95 93.98C207.14 505.99 219.57 512 232 512s24.86-6.01 32.01-18.02L319.96 400h106.93c28.6 0 46.42-30.4 32.01-54.61L405.68 256zm-12.78-88l-19.8 33.26L353.3 168h39.6zm-52.39 88l-52.39 88H175.88l-52.39-88 52.38-88h112.25l52.39 88zM232 73.72L254.79 112h-45.57L232 73.72zM71.1 168h39.6l-19.8 33.26L71.1 168zm0 176l19.8-33.26L110.7 344H71.1zM232 438.28L209.21 400h45.57L232 438.28zM353.29 344l19.8-33.26L392.9 344h-39.61z" />
                          </svg>
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

                {/* Applied Users */}
                {localTask?.appliedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex flex-row items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.image} />
                        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Applied to view
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex gap-1">
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
                      </div>
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
