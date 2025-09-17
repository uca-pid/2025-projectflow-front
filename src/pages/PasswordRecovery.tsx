import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle, Lock } from "lucide-react";
import WonderlandBackground from "../components/WonderlandBackground";

export default function PasswordRecovery() {
  const { requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordRecovery = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestPasswordReset(email);
      if (response.data?.status) {
        setMode("confirm");
        toast.success("Password recovery email sent successfully");
      } else {
        throw new Error("Error sending password recovery email");
      }
    } catch {
      toast.error("Error sending password recovery email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && mode === "request") {
      handlePasswordRecovery();
    }
  };

  return (
    <WonderlandBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-card rounded-2xl border border-border p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-xl">
                {mode === "request" ? (
                  <Lock className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {mode === "request" ? "Reset Password" : "Check Your Email"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {mode === "request"
                    ? "Recover your account access"
                    : "Recovery link sent"}
                </p>
              </div>
            </div>
          </div>

          {mode === "request" && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset
                  your password
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-base focus-visible:ring-1 transition-all duration-200"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                onClick={handlePasswordRecovery}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Recovery Email"
                )}
              </Button>
            </div>
          )}

          {mode === "confirm" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    A confirmation email has been sent to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Please check your inbox and follow the instructions to reset
                    your password.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setMode("request")}
                variant="outline"
                className="w-full h-12 text-base border-border hover:bg-accent transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Send Another Email
              </Button>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Remember your password?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <a
              href="/authenticate"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Back to Sign In
            </a>
          </p>
        </div>
      </div>
    </WonderlandBackground>
  );
}
