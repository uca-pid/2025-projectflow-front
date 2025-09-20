import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    return redirect("/dashboard");
  } else {
    return redirect("/login");
  }
}
