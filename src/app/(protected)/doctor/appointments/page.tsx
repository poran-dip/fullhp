import DoctorAppointmentsList from "@/components/protected/doctor/appointments-list";
import { getDoctorAppointments } from "@/services/doctor-appointments";

export default async function DoctorAppointmentsPage() {
  const { data, error } = await getDoctorAppointments();

  return <DoctorAppointmentsList data={data} error={error} />;
}
