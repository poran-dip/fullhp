import DoctorsList from "@/components/marketing/doctors-list";
import { getDoctors } from "@/services/doctor";

export const revalidate = 3600;

export default async function DoctorsPage() {
  const { doctors, error } = await getDoctors();

  return (
    <main className="flex-1 min-h-screen bg-gray-50">
      <DoctorsList doctors={doctors} error={error} />
    </main>
  );
}
