import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileModal } from "@/components/ProfileModal";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import WonderlandBackground from "@/components/WonderlandBackground";
import { FolderKanbanIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function BasicPageLayout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  // "w-full max-w-md space-y-8 bg-card rounded-2xl border border-border p-8 shadow-2xl backdrop-blur-sm"
  return (
    <WonderlandBackground>
      <div className="min-h-screen backdrop-blur bg-white/70">
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <FolderKanbanIcon className="w-8 h-8" />
                <Button
                  variant="link"
                  className="hover:cursor-pointer"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  <h1 className="text-xl font-bold text-gray-900">
                    ProjectFlow
                  </h1>
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-gray-600 text-sm hidden sm:block">
                  Shalom, {user?.name}!
                </span>

                <NotificationBell />

                <Avatar
                  className="h-8 w-8 rounded-full hover:cursor-pointer hover:opacity-80 shadow-lg"
                  onClick={() => setShowProfileModal(true)}
                >
                  <AvatarImage src={user?.image} />
                  <AvatarFallback className="bg-black text-white">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>

        {/* Profile Modal */}
        <ProfileModal
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      </div>
    </WonderlandBackground>
  );
}
