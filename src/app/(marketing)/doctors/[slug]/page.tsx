import { notFound } from "next/navigation";
import DoctorProfileClient from "@/components/marketing/doctor-profile";
import { auth } from "@/lib/auth";
import { getDoctorBySlug } from "@/services/doctor";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DoctorProfilePage({ params }: Props) {
  const { slug } = await params;
  const [{ doctor, error }, session] = await Promise.all([
    getDoctorBySlug(slug),
    auth(),
  ]);

  if (error || !doctor) notFound();

  return <DoctorProfileClient doctor={doctor} isLoggedIn={!!session?.user} />;
}
