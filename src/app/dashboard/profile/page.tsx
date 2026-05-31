"use client";

import PatientDashboardLayout from "@/components/dashboard/patient-dashboard";
import ProfileForm from "@/components/dashboard/profile-form";

function ProfileFormPage() {
  return (
    <PatientDashboardLayout>
      <ProfileForm />
    </PatientDashboardLayout>
  );
}

export default ProfileFormPage;
