import DoctorOverview from "@/components/protected/doctor/overview";
import { getDoctorDashboardData } from "@/services/doctor-dashboard";

export default async function DoctorDashboardPage() {
  const { data, error } = await getDoctorDashboardData();

  return <DoctorOverview data={data} error={error} />;
}
