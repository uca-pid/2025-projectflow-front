import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/AuthForm";
import WonderlandBackground from "../components/WonderlandBackground";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { signIn, signUp } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignup = async (
    email: string,
    name: string,
    password: string,
  ) => {
    await signUp(email, name, password);
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <WonderlandBackground>
      <AuthForm
        onLogin={handleLogin}
        onSignup={handleSignup}
        onToggleMode={toggleMode}
        mode={mode}
      />
    </WonderlandBackground>
  );
}
