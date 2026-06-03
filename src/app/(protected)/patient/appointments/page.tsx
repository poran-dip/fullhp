import AppointmentsList from "@/components/protected/patient/appointments";
import { getPatientAppointments } from "@/services/patient-appointments";

export default async function AppointmentsPage() {
  const { appointments, error } = await getPatientAppointments();
  return <AppointmentsList appointments={appointments} error={error} />;
}
