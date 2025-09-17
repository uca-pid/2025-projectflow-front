import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import WonderlandBackground from "@/components/WonderlandBackground";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <WonderlandBackground>
      <Card className="w-screen/5 h-screen/2 flex items-center justify-center flex-col">
        <CardTitle>
          <h1 className="text-4xl font-bold mb-4">¡Panel de Control!</h1>
        </CardTitle>
        <p className="text-gray-600 mb-6 text-center">
          Bienvenido {user?.name}, accede a diferentes secciones de la aplicación
        </p>
        <div className="space-y-4 flex flex-col items-center">
          <Button 
            onClick={() => navigate('/')}
            className="w-48 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Gestión de Tareas
          </Button>
          <Button onClick={signOut} variant="outline" className="w-48">
            Cerrar Sesión
          </Button>
        </div>
      </Card>
    </WonderlandBackground>
  );
}
