import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import WonderlandBackground from "@/components/WonderlandBackground";
import { LogOut, User, ClipboardList, Cog } from "lucide-react";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <WonderlandBackground centered={true}>
      <Card className="w-screen/5 h-screen/2 flex items-center justify-center flex-col">
        <CardTitle>
          <h1 className="text-4xl font-bold">Dashboard</h1>
        </CardTitle>
        <p className="text-gray-600 mb-6 text-center">
          Welcome {user?.name}, access different pages:
        </p>
        <div className="space-y-4 flex flex-col items-center">
          <Button className="w-48" onClick={() => navigate("/tasks")}>
            <ClipboardList className="h-4 w-4" />
            Task Management
          </Button>
          {user?.role === "ADMIN" && (
            <Button className="w-48" onClick={() => navigate("/users")}>
              <User className="h-4 w-4" />
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
            variant="outline"
            className="text-red-600 w-48"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </Card>
    </WonderlandBackground>
  );
}
