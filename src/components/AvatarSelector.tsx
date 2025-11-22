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
import type { Achievement } from "@/types/achievement";

type AvatarSelectorProps = {
  name: string;
  image: string;
  achievements: Achievement[];
};

export default function AvatarSelector({
  name,
  image,
  achievements,
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Avatar className="h-24 w-24 cursor-pointer">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
            {name?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Choose Your Avatar
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 mt-6 max-h-96 overflow-y-auto p-2">
          {Object.entries(avatars).map(([name, src]) => (
            <button
              key={name}
              onClick={() => setSelectedAvatar(name)}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                selectedAvatar === name
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                achievements.find((a) => a.name === name) ? "bg-red-500" : ""
              }`}
            >
              <img
                src={src}
                alt={name}
                className="w-20 h-20 rounded-full mb-2"
              />
              <span className="text-sm font-medium text-gray-700">{name}</span>
            </button>
          ))}
        </div>
        {selectedAvatar && (
          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Selected avatar:", selectedAvatar);
                setOpen(false);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Confirm
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
