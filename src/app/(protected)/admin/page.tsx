import PatientsTable from "@/components/protected/admin/patients";
import { getPatients } from "@/services/patient";

export default async function AdminPatientsPage() {
  const { patients, error } = await getPatients();

  return <PatientsTable initialPatients={patients} error={error} />;
}
