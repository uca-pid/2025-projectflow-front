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
import { useState } from "react";
import { Copy, Check, X, Ban, Mail, Send, Link, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiCall } from "@/lib/api-client";

interface AssignTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onAllow: (task: Task, userId: string, allow: boolean) => Promise<void>;
  onUnassign: (task: Task, userId: string) => Promise<void>;
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
  onAllow,
  onUnassign,
}: AssignTaskModalProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const link = `${import.meta.env.VITE_FRONT_URL}/${task?.isPublic ? "task" : "apply"}/${task?.id}`;

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (email === user?.email) {
      toast.error("No need to invite yourself silly!");
      return;
    }

    if (task?.assignedUsers?.some((u) => u.email === email)) {
      toast.error("This user is already assigned to this task");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiCall("POST", `/task/${task.id}/invite`, {
        email: email.trim(),
      });

      if (response.success) {
        toast.success(
          `Invitation email sent to ${email}! They can join using this email.`,
        );
        setEmail("");
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

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
                      {task?.isPublic
                        ? "Your task is public, everyone can see it with this link"
                        : "Or share this link to invite viewers"}
                      :
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
                {/* <CHANGE> Now using task prop directly instead of localTask */}
                {user && (
                  <TableRow key={user?.id}>
                    <TableCell className="flex flex-row items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.image || "/placeholder.svg"} />
                        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Owner
                      </span>
                    </TableCell>
                    <TableCell
                      title="The Creator"
                      className="flex font-medium justify-center"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                    </TableCell>
                  </TableRow>
                )}

                {task?.assignedUsers?.map(
                  (user) =>
                    user.id !== task?.creatorId && (
                      <TableRow key={user.id}>
                        <TableCell className="flex flex-row items-center">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={user?.image || "/placeholder.svg"}
                            />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3 font-medium">{user.name}</div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Assigned
                          </span>
                        </TableCell>
                        <TableCell
                          title="Unassign"
                          className="font-medium flex justify-center"
                        >
                          <Ban
                            className="h-4 w-4 mr-2 text-red-600 hover:cursor-pointer"
                            onClick={() => onUnassign(task, user.id!)}
                          />
                        </TableCell>
                      </TableRow>
                    ),
                )}

                {task?.trackedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex flex-row items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.image || "/placeholder.svg"} />
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
                    <TableCell
                      title="Unassign"
                      className="font-medium flex justify-center"
                    >
                      <Ban
                        className="h-4 w-4 mr-2 text-red-600 hover:cursor-pointer"
                        onClick={() => onUnassign(task, user.id!)}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {/* Applied Users */}
                {task?.appliedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex flex-row items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.image || "/placeholder.svg"} />
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
                          onClick={() => onAllow(task, user.id!, true)}
                        >
                          <Check className="text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          title="Decline"
                          // <CHANGE> Now calling onDecline prop
                          onClick={() => onAllow(task, user.id!, false)}
                        >
                          <X className="text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {!task?.appliedUsers?.length &&
                  !task?.assignedUsers?.length &&
                  !task?.trackedUsers?.length && (
                    <TableRow>
                      <TableCell
                        className="font-medium text-center text-gray-500"
                        colSpan={4}
                      >
                        No users are assigned or applied yet
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
