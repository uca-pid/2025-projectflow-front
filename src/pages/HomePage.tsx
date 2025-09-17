import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import WonderlandBackground from "@/components/WonderlandBackground";

export default function HomePage() {
  const { user, signOut } = useAuth();
  return (
    <WonderlandBackground>
      <Card className="w-screen/5 h-screen/2 flex items-center justify-center flex-col">
        <CardTitle>
          <h1 className="text-4xl font-bold mb-4">
            ¡Bienvenido {user?.name} usted es {user?.role}!
          </h1>
        </CardTitle>
        <Button onClick={signOut}>Logout</Button>
      </Card>
    </WonderlandBackground>
  );
}
