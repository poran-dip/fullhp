import ProfileForm from "@/components/protected/patient/profile";
import { getPatientProfile } from "@/services/patient-profile";

export default async function ProfilePage() {
  const { profile, error } = await getPatientProfile();
  return <ProfileForm profile={profile} error={error} />;
}
