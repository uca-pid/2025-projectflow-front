import { useState, useEffect } from "react";
import { Bell, Check, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { Invitation } from "@/types/invitation";
import { apiCall } from "@/lib/api-client";
import { toast } from "sonner";

export const NotificationBell = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    apiCall("GET", "/user/invites").then((response) => {
      if (response.data) {
        setInvitations(response.data as Invitation[]);
      }
      setIsLoading(false);
    });
  }, []);

  const acceptInvitation = async (invitation: Invitation) => {
    setIsProcessing(true);
    const response = await apiCall("POST", `/task/${invitation.taskId}/accept`);

    setIsProcessing(false);

    if (!response.success) {
      toast.error("Failed to accept invitation");
      throw new Error("Failed to accept invitation");
    }

    toast.success("Invitation accepted successfully");
    setInvitations((prevInvitations) =>
      prevInvitations.filter(
        (invite) => invite.invitationId !== invitation.invitationId,
      ),
    );
    document.location.reload();
  };

  const declineInvitation = async (invitation: Invitation) => {
    setIsProcessing(true);
    const response = await apiCall("POST", `/task/${invitation.taskId}/reject`);

    setIsProcessing(false);

    if (!response.success) {
      toast.error("Failed to decline invitation");
      throw new Error("Failed to decline invitation");
    }

    toast.success("Invitation declined");
    setInvitations((prevInvitations) =>
      prevInvitations.filter(
        (invite) => invite.invitationId !== invitation.invitationId,
      ),
    );
  };

  if (isLoading) {
    return;
  }
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {invitations?.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {invitations?.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : invitations?.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No pending invitations
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {invitations?.map((invitation) => (
              <div
                key={invitation.invitationId}
                className="border-b last:border-b-0 p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Task Invitation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You've been invited to:{" "}
                      <strong className="text-foreground">
                        {invitation.task.title}
                      </strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      From: {invitation.inviter.name} (
                      {invitation.inviter.email})
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        disabled={isProcessing}
                        size="sm"
                        variant="outline"
                        className="h-7 px-3"
                        onClick={() => acceptInvitation(invitation)}
                      >
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3"
                        disabled={isProcessing}
                        onClick={() => declineInvitation(invitation)}
                      >
                        <X className="h-3 w-3 mr-1 text-red-500" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
