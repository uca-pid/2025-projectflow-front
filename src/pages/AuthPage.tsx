import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AuthForm from "@/components/AuthForm";
import WonderlandBackground from "../components/WonderlandBackground";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { signIn, signUp, signInSocial } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);

      setTimeout(async () => {
        try {
          const session = await authClient.getSession();
          const currentUser = session?.data?.user;

          if (currentUser) {
            toast.success("Access Granted - Welcome Back", {
              description:
                "You're successfully logged in and ready to continue working on your projects",
              style: {
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #000000",
                color: "#0f172a",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              },
            });
          } else {
            toast.error("Access Denied - Authentication Failed", {
              description:
                "Invalid credentials - please double-check your email and password before trying again",
              style: {
                background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
                border: "1px solid #000000",
                color: "#991b1b",
                boxShadow:
                  "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)",
              },
            });
          }
        } catch {
          toast.error("Connection Failed - Network Issue", {
            description:
              "Network error - please check your internet connection and try logging in again",
            style: {
              background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
              border: "1px solid #000000",
              color: "#991b1b",
              boxShadow:
                "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)",
            },
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

      setTimeout(async () => {
        try {
          const session = await authClient.getSession();
          const currentUser = session?.data?.user;

          if (currentUser) {
            toast.success("Account Ready - Registration Complete", {
              description:
                "Welcome to ProjectFlow - your account has been created successfully and you're all set to start",
              style: {
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #000000",
                color: "#0f172a",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              },
            });
          } else {
            toast.error("Registration Failed - Account Creation Error", {
              description:
                "Unable to create account - please check your information and try the registration process again",
              style: {
                background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
                border: "1px solid #000000",
                color: "#991b1b",
                boxShadow:
                  "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)",
              },
            });
          }
        } catch {
          toast.error("Registration Error - System Issue", {
            description:
              "Something went wrong - there was a system error during registration, please try again",
            style: {
              background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
              border: "1px solid #000000",
              color: "#991b1b",
              boxShadow:
                "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)",
            },
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

  const handleLoginSocial = async (provider: string) => {
    try {
      await signInSocial(provider);

      setTimeout(async () => {
        try {
          const session = await authClient.getSession();
          const currentUser = session?.data?.user;

          if (currentUser) {
            toast.success("Access Granted - Welcome!", {
              description:
                "You're successfully logged in and ready to continue working on your projects",
              style: {
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #000000",
                color: "#0f172a",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              },
            });
          } else {
            toast.error("Access Denied - Authentication Failed", {
              description:
                "Invalid credentials - please double-check your email and password before trying again",
              style: {
                background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
                border: "1px solid #000000",
                color: "#991b1b",
                boxShadow:
                  "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)",
              },
            });
          }
        } catch {
          toast.error("Connection Failed - Network Issue", {
            description:
              "Network error - please check your internet connection and try logging in again",
            style: {
              background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
              border: "1px solid #000000",
              color: "#991b1b",
              boxShadow:
                "0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)",
            },
          });
        }
      }, 1000);
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
        onSocialLogin={handleLoginSocial}
        onSignup={handleSignup}
        onToggleMode={toggleMode}
        mode={mode}
      />
    </WonderlandBackground>
  );
}
