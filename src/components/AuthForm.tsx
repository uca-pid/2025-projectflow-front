import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Eye, EyeOff, Lock, Mail, User, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import Google from "@mui/icons-material/Google";
import GitHub from "@mui/icons-material/GitHub";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { PasswordRequirements } from "@/components/PasswordRequirements";

interface AuthFormProps {
  onLogin?: (email: string, password: string) => void;
  onSocialLogin?: (provider: string) => void;
  onSignup?: (email: string, name: string, password: string) => void;
  onToggleMode?: () => void;
  mode?: "login" | "signup";
}

export default function AuthForm({
  onLogin,
  onSocialLogin,
  onSignup,
  onToggleMode,
  mode = "login",
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  // For login mode, use simple state
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // For signup mode, use the validation hook
  const {
    password: signupPassword,
    confirmPassword,
    setPassword: setSignupPassword,
    setConfirmPassword,
    passwordValidation,
    isPasswordValid,
    doPasswordsMatch,
    showPassword: showSignupPassword,
    showConfirmPassword,
    setShowPassword: setShowSignupPassword,
    setShowConfirmPassword,
  } = usePasswordValidation();

  const isLogin = mode === "login";

  // Use appropriate password state based on mode
  const password = isLogin ? loginPassword : signupPassword;
  const setPassword = isLogin ? setLoginPassword : setSignupPassword;
  const showPassword = isLogin ? showLoginPassword : showSignupPassword;
  const setShowPassword = isLogin
    ? setShowLoginPassword
    : setShowSignupPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);

    if (mode === "login") {
      await onLogin?.(email, password);
    }

    if (mode === "signup") {
      // Validate signup requirements
      if (!isPasswordValid) {
        toast.error("Password does not meet requirements");
        setIsRequesting(false);
        return;
      }

      if (!doPasswordsMatch) {
        toast.error("Passwords do not match");
        setIsRequesting(false);
        return;
      }

      await onSignup?.(email, name, password);
    }
    
    setIsRequesting(false);
  };

  const handleSocial = async (provider: "github" | "google") => {
    if (provider !== "github" && provider !== "google") {
      toast.error("Access Denied - Social Provider Error", {
        description:
          "The social provided with which you are trying to log in is not supported.",
        style: {
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid #000000",
          color: "#0f172a",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
      });
      return;
    }
    setIsRequesting(true);
    await onSocialLogin?.(provider);
    setIsRequesting(false);
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-card rounded-2xl border border-border p-8 shadow-2xl backdrop-blur-sm">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-xl">
            <FolderKanban className="w-12 h-12" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              ProjectFlow
            </h1>
            <p className="text-sm text-muted-foreground">
              Streamline your projects
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 text-base focus-visible:ring-1 transition-all duration-200"
                required
              />
            </div>
          </div>
        )}

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
              className="pl-10 h-12 text-base focus-visible:ring-1 transition-all duration-200"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 text-base focus-visible:ring-1 transition-all duration-200"
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

        {!isLogin && (
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-12 text-base focus-visible:ring-1 transition-all duration-200"
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
        )}

        {/* Password Requirements - Only show for signup */}
        {!isLogin && (
          <PasswordRequirements
            password={signupPassword}
            confirmPassword={confirmPassword}
            passwordValidation={passwordValidation}
            doPasswordsMatch={doPasswordsMatch}
          />
        )}

        {isLogin && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground"
              >
                Remember me
              </label>
            </div>
            <a
              type="button"
              className="text-sm text-primary hover:text-primary/80 transition-colors hover:cursor-pointer"
              href="/password-recovery"
            >
              Forgot password?
            </a>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isRequesting || (!isLogin && (!isPasswordValid || !doPasswordsMatch))}
        >
          {isLogin ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-12 border-border hover:bg-accent transition-all duration-200"
          type="button"
          onClick={() => handleSocial("google")}
          disabled={isRequesting}
        >
          <Google className="h-4 w-4" />
          <span className="ml-2">Google</span>
        </Button>
        <Button
          variant="outline"
          className="h-12 border-border hover:bg-accent transition-all duration-200"
          type="button"
          disabled
        >
          <GitHub className="h-4 w-4" />
          <span className="ml-2">GitHub</span>
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-primary hover:text-primary/80 font-medium transition-colors hover:cursor-pointer"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
