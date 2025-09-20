import BasicPageLayout from "@/components/layouts/BasicPageLayout";
import WonderlandBackground from "@/components/WonderlandBackground";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session) {
    redirect("/login");
  }

  return <WonderlandBackground centered>{children}</WonderlandBackground>;
}
