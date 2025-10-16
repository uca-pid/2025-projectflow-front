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
import { useState, useEffect } from "react";
import { Copy, Check, X, Ban, Shield, Mail, Send, Link } from "lucide-react";
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
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        if (result.userExists) {
          toast.success(
            `Invitation sent to ${email}! They will receive a notification.`
          );
        } else {
          toast.success(
            `Invitation email sent to ${email}! They can join using this email.`
          );
        }
        
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
                      If the user exists, they'll get a notification. Otherwise, they'll receive an email invitation.
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
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
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <Label className="text-sm font-medium">Or share this link:</Label>
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
                {!localTask?.appliedUsers?.length && !localTask?.assignedUsers?.length && (
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Assigned
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.id === localTask?.creatorId ? (
                        <Button variant="ghost" title="Owner" disabled>
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
                        Applied
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
