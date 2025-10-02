import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://apiprojectflow.semantic.com.ar",
    fetchOptions: {
    credentials: "include",
  },
});
