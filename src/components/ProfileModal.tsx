import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    onClose();
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Perfil de Usuario</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {user && (
            <div className="space-y-6">
              {/* User Avatar */}
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Información Personal
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ID de Usuario:</span>
                      <span className="font-medium text-gray-900 font-mono text-sm">
                        {user.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Información de Cuenta
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cuenta creada:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Última actualización:
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatDate(user.updatedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estado:</span>
                      <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Activo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3">
                    Estadísticas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {
                          JSON.parse(
                            localStorage.getItem("projectflow-tasks") || "[]",
                          ).length
                        }
                      </div>
                      <div className="text-blue-800 text-sm">
                        Tareas Totales
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {
                          JSON.parse(
                            localStorage.getItem("projectflow-tasks") || "[]",
                          ).filter((task: any) => task.status === "completed")
                            .length
                        }
                      </div>
                      <div className="text-green-800 text-sm">Completadas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="button"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Cerrar Sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

