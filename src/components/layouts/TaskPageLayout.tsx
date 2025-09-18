import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileModal } from "@/components/ProfileModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FolderKanbanIcon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function TaskPageLayout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <FolderKanbanIcon className="w-6 h-6" />
                <h1 className="text-xl font-bold text-gray-900">ProjectFlow</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm hidden sm:block">
                Hello, {user?.name}!
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 h-10"
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user?.image} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:block">Profile</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-red-600 hover:text-red-700 hover:border-red-300 h-10"
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
