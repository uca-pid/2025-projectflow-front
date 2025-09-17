import React, { createContext, useEffect, useState } from "react";
import { type User } from "@/types/user";
import { authClient } from "@/lib/auth-client";

type AuthContextType = {
  user: User | null | undefined;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInSocial: (provider: string) => Promise<AuthResponse>;
  signUp: (
    email: string,
    name: string,
    password: string,
  ) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  requestPasswordReset: (
    email: string,
  ) => Promise<{ data: { status: boolean }; error: string }>;
  resetPassword: (
    password: string,
    token: string,
  ) => Promise<{ data: { status: boolean }; error: string }>;
};

type AuthResponse = {
  redirect: boolean;
  token: string;
  url?: string;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    role: string;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null | undefined>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await authClient.getSession();

        const found_user = session?.data?.user;
        setUser(found_user);
        if (found_user) {
          setIsAuthenticated(true);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await authClient.signIn.email({ email, password });
    const session = await authClient.getSession();
    const found_user = session?.data?.user;
    setUser(found_user);

    if (found_user) {
      setIsAuthenticated(true);
    }

    return response as AuthResponse;
  };

  const signInSocial = async (provider: string) => {
    const response = await authClient.signIn.social({
      provider,
      callbackURL: "http://localhost:5173/dashboard",
    });
    const session = await authClient.getSession();
    const found_user = session?.data?.user;
    setUser(found_user);

    if (found_user) {
      setIsAuthenticated(true);
    }

    return response as AuthResponse;
  };

  const signUp = async (email: string, name: string, password: string) => {
    const response = await authClient.signUp.email({ email, password, name });
    const session = await authClient.getSession();
    const found_user = session?.data?.user;
    setUser(found_user);

    if (found_user) {
      setIsAuthenticated(true);
    }

    return response as AuthResponse;
  };

  const signOut = async () => {
    await authClient.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    const response = await authClient.requestPasswordReset({
      email,
      redirectTo: "http://localhost:5173/reset-password",
    });
    return response;
  };

  const resetPassword = async (password: string, token: string) => {
    const response = await authClient.resetPassword({
      token,
      newPassword: password,
    });
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        signIn,
        signInSocial,
        signUp,
        signOut,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
