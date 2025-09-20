import { auth } from "@/lib/auth";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  return <DashboardContent user={session?.user} />;
}
