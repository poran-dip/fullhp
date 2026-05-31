import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function navigateByRole() {
  const session = await auth();
  const role = session?.user?.role;

  const routes: Record<string, string> = {
    patient: "/patient",
    doctor: "/doctor",
    admin: "/admin",
    driver: "/driver",
  };

  redirect(routes[role ?? ""] ?? "/");
}
