import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function navigateByRole() {
  const session = await auth();
  const role = session?.user?.role;

  const routes: Record<string, string> = {
    Patient: "/patient",
    Doctor: "/doctor",
    Admin: "/admin",
  };

  redirect(routes[role ?? ""] ?? "/");
}
