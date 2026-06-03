import { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { navigateByRole } from "@/lib/auth-redirect";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role !== Role.Patient) {
    await navigateByRole();
  }

  return <div className="min-h-screen flex flex-col">{children}</div>;
}
