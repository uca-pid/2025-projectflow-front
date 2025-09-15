import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AuthForm from "@/components/AuthForm";
import WonderlandBackground from "../components/WonderlandBackground";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { signIn, signUp } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      
      // Check if authentication succeeded by getting fresh session
      setTimeout(async () => {
        try {
          const session = await authClient.getSession();
          const currentUser = session?.data?.user;
          
          if (currentUser) {
            toast.success("Welcome back!", {
              description: "Successfully signed in to your account",
              style: {
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                color: '#111827',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }
            });
          } else {
            toast.error("Sign in failed", {
              description: "Invalid email or password",
              style: {
                background: 'rgba(254, 242, 242, 0.95)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#dc2626',
              }
            });
          }
        } catch {
          toast.error("Sign in failed", {
            description: "Please check your credentials and try again",
            style: {
              background: 'rgba(254, 242, 242, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
            }
          });
        }
      }, 300);
      
    } catch (error) {
      toast.error("🌐 Connection Error", {
        description: "Please check your internet connection and try again",
      });
      console.log(error);
    }
  };

  const handleSignup = async (
    email: string,
    name: string,
    password: string,
  ) => {
    try {
      await signUp(email, name, password);
      
      // Check if signup succeeded by getting fresh session
      setTimeout(async () => {
        try {
          const session = await authClient.getSession();
          const currentUser = session?.data?.user;
          
          if (currentUser) {
            toast.success("Account created!", {
              description: "Welcome to ProjectFlow",
              style: {
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                color: '#111827',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }
            });
          } else {
            toast.error("Registration failed", {
              description: "Please check your information and try again",
              style: {
                background: 'rgba(254, 242, 242, 0.95)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#dc2626',
              }
            });
          }
        } catch {
          toast.error("Registration failed", {
            description: "Something went wrong. Please try again",
            style: {
              background: 'rgba(254, 242, 242, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
            }
          });
        }
      }, 300);
      
    } catch (error) {
      toast.error("🌐 Connection Error", {
        description: "Please check your internet connection and try again",
      });
      console.log(error);
    }
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
