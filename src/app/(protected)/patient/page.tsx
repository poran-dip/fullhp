import { redirect } from "next/navigation";
import PatientOverview from "@/components/protected/patient/overview";
import { getPatientDashboardData } from "@/services/patient-dashboard";

export default async function PatientDashboardPage() {
  const { data, error } = await getPatientDashboardData();

  if (error === "Patient record not found") redirect("/onboarding");

  return <PatientOverview data={data} error={error} />;
}
