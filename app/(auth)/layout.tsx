import WonderlandBackground from "@/components/WonderlandBackground";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <WonderlandBackground centered={true}>{children}</WonderlandBackground>
  );
}
