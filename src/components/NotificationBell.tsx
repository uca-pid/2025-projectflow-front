import { useState, useEffect } from "react";
import { Bell, Check, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { TaskInvitation } from "@/types/user";

export const NotificationBell = () => {
  const [invitations, setInvitations] = useState<TaskInvitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchInvitations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/invitations`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      } else {
        console.error("Failed to fetch invitations");
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitationResponse = async (
    invitationId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/invitations/${invitationId}/${action}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success(
          action === "accept" ? "Invitation accepted!" : "Invitation rejected"
        );
        fetchInvitations();
      } else {
        throw new Error(`Failed to ${action} invitation`);
      }
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      toast.error(`Failed to ${action} invitation`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();
      const interval = setInterval(fetchInvitations, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending"
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingInvitations.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {pendingInvitations.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : pendingInvitations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No pending invitations
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {pendingInvitations.map((invitation) => (
              <DropdownMenuItem key={invitation.id} className="p-0">
                <Card className="w-full border-0 shadow-none">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 mt-1 text-blue-500" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-sm font-medium">Task Invitation</p>
                          <p className="text-xs text-muted-foreground">
                            You've been invited to: <strong>{invitation.taskTitle}</strong>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From: {invitation.inviterName} ({invitation.inviterEmail})
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleInvitationResponse(invitation.id, "accept")}
                            className="h-7 px-3"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInvitationResponse(invitation.id, "reject")}
                            className="h-7 px-3"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};