import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User as UserIcon } from "lucide-react";
import { type User } from "@/types/user";

interface EditUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: (user: User) => Promise<void>;
}

export default function EditUserModal({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof User, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    startTransition(async () => {
      e.preventDefault();
      if (!user) return;
      await onUserUpdated(formData as User);
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update the user information below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="col-span-3"
                placeholder="User's full name"
                disabled={isPending}
              />
            </div>

            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="col-span-3"
                placeholder="user@example.com"
                required
                disabled={isPending}
              />
            </div>

            {/* Image */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                type="url"
                value={formData.image || ""}
                onChange={(e) => handleInputChange("image", e.target.value)}
                className="col-span-3"
                placeholder="https://example.com/avatar.jpg"
                disabled={isPending}
              />
            </div>

            {/* Role */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.role || "user"}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Verified */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailVerified" className="text-right">
                Email Verified
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="emailVerified"
                  checked={formData.emailVerified || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("emailVerified", checked)
                  }
                  disabled={isPending}
                />
                <Label
                  htmlFor="emailVerified"
                  className="text-sm text-muted-foreground"
                >
                  {formData.emailVerified
                    ? "Email is verified"
                    : "Email not verified"}
                </Label>
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
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
