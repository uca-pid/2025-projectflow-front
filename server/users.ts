"use server";

import { auth } from "@/lib/auth";

export const signUp = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  return await auth.api.signUpEmail({ body: { name, email, password } });
};

export const signIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return await auth.api.signInEmail({ body: { email, password } });
};

export const signInSocial = async ({ provider }: { provider: string }) => {
  return await auth.api.signInSocial({
    body: { provider: provider, callbackURL: "http://localhost:3000" },
  });
};
