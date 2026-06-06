import { redirect } from "next/navigation";
import OnboardingForm from "@/components/protected/patient/onboarding";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (patient) redirect("/dashboard");

  return <OnboardingForm />;
}
