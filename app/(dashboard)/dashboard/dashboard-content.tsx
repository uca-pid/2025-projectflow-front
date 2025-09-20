// app/(dashboard)/dashboard/dashboard-content.tsx (client component)
"use client";
import { useRouter } from "next/navigation";
import WonderlandBackground from "@/components/WonderlandBackground";
import { LogOut, User as UserIcon, ClipboardList, Cog } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { User } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface Props {
  user: User;
}

export function DashboardContent({ user }: Props) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <Card className="w-screen/5 h-screen/2 flex items-center justify-center flex-col">
      <CardTitle>
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </CardTitle>
      <p className="text-gray-600 mb-6 text-center">
        Welcome {user?.name}, access different pages:
      </p>
      <div className="space-y-4 flex flex-col items-center">
        <Button onClick={() => router.push("/tasks")} className="w-48">
          <ClipboardList className="h-4 w-4" />
          Task Management
        </Button>
        {user?.role === "ADMIN" && (
          <Button onClick={() => router.push("/users")} className="w-48">
            <UserIcon className="h-4 w-4" />
            User Management
          </Button>
        )}
        {user?.role === "ADMIN" && (
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
            <Button className="w-48">
              <Cog className="h-4 w-4 animate-spin-slow" />
              Site Management
            </Button>
          </a>
        )}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="text-red-600 w-48"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </Card>
  );
}
