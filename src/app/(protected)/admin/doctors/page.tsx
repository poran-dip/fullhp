import DoctorsTable from "@/components/protected/admin/doctors";
import { getDoctors } from "@/services/doctor";

export default async function AdminDoctorsPage() {
  const { doctors, error } = await getDoctors();
  return <DoctorsTable initialDoctors={doctors} error={error} />;
}
