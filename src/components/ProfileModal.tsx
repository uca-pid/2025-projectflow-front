import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Hash, Calendar, Shield, LogOut } from "lucide-react";
import AvatarSelector from "./AvatarSelector";
import { apiCall } from "@/lib/api-client";
import type { Achievement } from "@/types/achievement";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, signOut, updateUser } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState(user?.image || "");

  useEffect(() => {
    if (open) {
      apiCall("GET", "/user/achievements").then((res) =>
        setAchievements(res.data as Achievement[]),
      );
    }
  }, [open]);

  useEffect(() => {
    if (user?.image) {
      setCurrentAvatar(user.image);
    }
  }, [user?.image]);

  const handleLogout = async () => {
    setIsRequesting(true);
    await signOut();
    setIsRequesting(false);
    onClose();
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    setCurrentAvatar(newAvatar);
    // Update the user context so the avatar changes everywhere
    if (user && updateUser) {
      updateUser({ ...user, image: newAvatar });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {user && (
            <>
              {/* User Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <AvatarSelector
                  name={user.name}
                  image={currentAvatar}
                  achievements={achievements || []}
                  userId={user.id}
                  onAvatarUpdate={handleAvatarUpdate}
                />
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Separator />

              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Name
                      </Label>
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <div className="font-medium font-mono text-sm">
                        {user.email}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        User ID
                      </Label>
                      <div className="font-medium font-mono text-sm">
                        {user.id.substring(0, 8)}...
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Role
                      </Label>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex flex-col items-center p-2 rounded-lg border"
                        >
                          <img
                            src={achievement.avatar}
                            alt={achievement.name}
                            className="w-12 h-12 rounded-full mb-1"
                          />
                          <span className="text-xs text-center">
                            {achievement.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No achievements yet. Complete tasks to unlock avatars!
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            className="hover:cursor-pointer"
            disabled={isRequesting}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}