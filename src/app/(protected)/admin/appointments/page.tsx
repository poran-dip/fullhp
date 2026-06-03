import AppointmentsTable from "@/components/protected/admin/appointments";
import {
  getAppointmentFormData,
  getAppointments,
} from "@/services/appointment";

interface Props {
  searchParams: Promise<{ patientId?: string; doctorId?: string }>;
}

export default async function AdminAppointmentsPage({ searchParams }: Props) {
  const { patientId, doctorId } = await searchParams;

  const [{ appointments, error }, { patients, doctors }] = await Promise.all([
    getAppointments({
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
    }),
    getAppointmentFormData(),
  ]);

  return (
    <AppointmentsTable
      initialAppointments={appointments}
      patients={patients}
      doctors={doctors}
      error={error}
      defaultPatientId={patientId}
      defaultDoctorId={doctorId}
    />
  );
}
