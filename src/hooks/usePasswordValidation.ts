import { useState, useMemo } from "react";

export interface PasswordValidation {
  length: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface UsePasswordValidationReturn {
  password: string;
  confirmPassword: string;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  passwordValidation: PasswordValidation;
  isPasswordValid: boolean;
  doPasswordsMatch: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
}

export const usePasswordValidation = (): UsePasswordValidationReturn => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pwd: string): PasswordValidation => {
    return {
      length: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const passwordValidation = useMemo(
    () => validatePassword(password),
    [password],
  );
  const isPasswordValid = useMemo(
    () => Object.values(passwordValidation).every(Boolean),
    [passwordValidation],
  );
  const doPasswordsMatch = useMemo(
    () => password === confirmPassword && password.length > 0,
    [password, confirmPassword],
  );

  return {
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
  };
};
