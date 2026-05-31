"use client";

import AppointmentsList from "@/components/dashboard/appointment-list";
import PatientDashboardLayout from "@/components/dashboard/patient-dashboard";

function AppointmentsPage() {
  return (
    <PatientDashboardLayout>
      <AppointmentsList />
    </PatientDashboardLayout>
  );
}

export default AppointmentsPage;
