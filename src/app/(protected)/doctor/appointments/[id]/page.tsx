import DoctorAppointmentDetail from "@/components/protected/doctor/appointment-details";
import { getDoctorAppointmentDetail } from "@/services/doctor-appointment-details";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DoctorAppointmentDetailPage({ params }: Props) {
  const { id } = await params;
  const { data, error } = await getDoctorAppointmentDetail(id);

  return <DoctorAppointmentDetail data={data} error={error} />;
}
