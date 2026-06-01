import LabResultsList from "@/components/protected/patient/results";
import { getPatientLabResults } from "@/services/lab-results";

export default async function LabResultsPage() {
  const { appointments, error } = await getPatientLabResults();
  return <LabResultsList appointments={appointments} error={error} />;
}
