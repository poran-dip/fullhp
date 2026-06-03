import { notFound } from "next/navigation";
import DoctorProfileClient from "@/components/marketing/doctor-profile";
import { auth } from "@/lib/auth";
import { getDoctorById } from "@/services/doctor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DoctorProfilePage({ params }: Props) {
  const { id } = await params;
  const [{ doctor, error }, session] = await Promise.all([
    getDoctorById(id),
    auth(),
  ]);

  if (error || !doctor) notFound();

  return <DoctorProfileClient doctor={doctor} isLoggedIn={!!session?.user} />;
}
