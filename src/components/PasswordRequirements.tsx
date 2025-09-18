import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { type PasswordValidation } from "@/hooks/usePasswordValidation";

interface PasswordRequirementsProps {
  password: string;
  confirmPassword: string;
  passwordValidation: PasswordValidation;
  doPasswordsMatch: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword,
  passwordValidation,
  doPasswordsMatch,
}) => {
  if (!password) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">
        Password Requirements:
      </p>
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div
          className={`flex items-center space-x-2 ${
            passwordValidation.length
              ? "text-green-600"
              : "text-muted-foreground"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              passwordValidation.length
                ? "bg-green-600"
                : "bg-muted-foreground/30"
            }`}
          />
          <span>At least 8 characters</span>
        </div>
        <div
          className={`flex items-center space-x-2 ${
            passwordValidation.hasUppercase
              ? "text-green-600"
              : "text-muted-foreground"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              passwordValidation.hasUppercase
                ? "bg-green-600"
                : "bg-muted-foreground/30"
            }`}
          />
          <span>One uppercase letter</span>
        </div>
        <div
          className={`flex items-center space-x-2 ${
            passwordValidation.hasLowercase
              ? "text-green-600"
              : "text-muted-foreground"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              passwordValidation.hasLowercase
                ? "bg-green-600"
                : "bg-muted-foreground/30"
            }`}
          />
          <span>One lowercase letter</span>
        </div>
        <div
          className={`flex items-center space-x-2 ${
            passwordValidation.hasNumber
              ? "text-green-600"
              : "text-muted-foreground"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              passwordValidation.hasNumber
                ? "bg-green-600"
                : "bg-muted-foreground/30"
            }`}
          />
          <span>One number</span>
        </div>
        <div
          className={`flex items-center space-x-2 ${
            passwordValidation.hasSpecial
              ? "text-green-600"
              : "text-muted-foreground"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              passwordValidation.hasSpecial
                ? "bg-green-600"
                : "bg-muted-foreground/30"
            }`}
          />
          <span>One special character</span>
        </div>
      </div>

      {confirmPassword && (
        <div
          className={`flex items-center space-x-2 text-xs ${
            doPasswordsMatch ? "text-green-600" : "text-red-600"
          }`}
        >
          {doPasswordsMatch ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>
            {doPasswordsMatch ? "Passwords match" : "Passwords do not match"}
          </span>
        </div>
      )}
    </div>
  );
};
