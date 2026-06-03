import DoctorSettings from "@/components/protected/doctor/settings";
import { getDoctorProfile } from "@/services/doctor-profile";

export default async function DoctorSettingsPage() {
  const { data, error } = await getDoctorProfile();

  return <DoctorSettings profile={data} error={error} />;
}
