import PatientOverview from "@/components/protected/patient/overview";
import { getPatientDashboardData } from "@/services/patient-dashboard";

export default async function PatientDashboardPage() {
  const { data, error } = await getPatientDashboardData();

  return <PatientOverview data={data} error={error} />;
}
