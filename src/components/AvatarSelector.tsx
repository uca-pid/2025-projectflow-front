import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { avatars } from "@/assets/avatars";
import { apiCall } from "@/lib/api-client";
import type { Achievement } from "@/types/achievement";

type AvatarSelectorProps = {
  name: string;
  image: string;
  achievements: Achievement[];
  userId: string;
  onAvatarUpdate?: (newAvatar: string) => void;
};

export default function AvatarSelector({
  name,
  image,
  achievements,
  userId,
  onAvatarUpdate,
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirm = async () => {
    if (!selectedAvatar) return;

    setIsUpdating(true);
    try {
      const newAvatarUrl = avatars[selectedAvatar as keyof typeof avatars];
      
      await apiCall("PUT", `/user/update/${userId}`, {
        userToUpdateData: {
          image: newAvatarUrl,
        },
      });

      if (onAvatarUpdate) {
        onAvatarUpdate(newAvatarUrl);
      }

      setOpen(false);
      setSelectedAvatar(null);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      alert("Failed to update avatar. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isAvatarUnlocked = (avatarName: string) => {
    return achievements.some((a) => a.name === avatarName);
  };

  const currentAvatarName = Object.entries(avatars).find(
    ([_, url]) => url === image
  )?.[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Avatar className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Choose Your Avatar
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 mt-6 max-h-96 overflow-y-auto p-2">
          {Object.entries(avatars).map(([avatarName, src]) => {
            const isUnlocked = isAvatarUnlocked(avatarName);
            const isCurrent = avatarName === currentAvatarName;

            return (
              <button
                key={avatarName}
                onClick={() => setSelectedAvatar(avatarName)}
                disabled={!isUnlocked}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  selectedAvatar === avatarName
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${
                  !isUnlocked
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:shadow-lg cursor-pointer"
                } ${isCurrent ? "ring-2 ring-green-500" : ""}`}
              >
                <img
                  src={src}
                  alt={avatarName}
                  className="w-20 h-20 rounded-full mb-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  {avatarName}
                </span>
                {isCurrent && (
                  <span className="text-xs text-green-600 font-semibold mt-1">
                    Current
                  </span>
                )}
                {!isUnlocked && (
                  <span className="text-xs text-red-600 font-semibold mt-1">
                    🔒 Locked
                  </span>
                )}
                {isUnlocked && !isCurrent && (
                  <span className="text-xs text-blue-600 font-semibold mt-1">
                    ✓ Unlocked
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedAvatar && (
          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => {
                setOpen(false);
                setSelectedAvatar(null);
              }}
              variant="outline"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Confirm"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}