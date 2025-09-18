import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import WonderlandBackground from "../components/WonderlandBackground";

export default function PasswordReset() {
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token");
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    passwordValidation,
    isPasswordValid,
    doPasswordsMatch,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
  } = usePasswordValidation();

  const handlePasswordReset = async () => {
    if (!token) {
      toast.error("Invalid or expired reset token");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    if (!doPasswordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword(password, token);
      if (!response.data?.status) {
        throw new Error("Error resetting password");
      }
      setIsSuccess(true);
      toast.success("Password reset successfully!");

      // Wait 2 seconds and redirect to login
      await new Promise((resolve) => setTimeout(resolve, 2000));
      window.location.href = "/";
    } catch {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePasswordReset();
    }
  };

  if (isSuccess) {
    return (
      <WonderlandBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8 bg-card rounded-2xl border border-border p-8 shadow-2xl backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Password Updated
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to login...
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">
                  Your password has been successfully updated. You will be
                  redirected to the login page shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </WonderlandBackground>
    );
  }

  return (
    <WonderlandBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-card rounded-2xl border border-border p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Reset Your Password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create a new secure password
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Enter your new password below. Make sure it's secure and
                memorable.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base focus-visible:ring-1 transition-all duration-200"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-10 h-12 text-base focus-visible:ring-1 transition-all duration-200"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <PasswordRequirements
              password={password}
              confirmPassword={confirmPassword}
              passwordValidation={passwordValidation}
              doPasswordsMatch={doPasswordsMatch}
            />

            <Button
              onClick={handlePasswordReset}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Need help?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <a
              href="/login"
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
