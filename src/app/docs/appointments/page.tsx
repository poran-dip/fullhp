"use client";

import DoctorDashboardLayout from "@/components/dashboard/doctor-dashboard";
import DocAppointments from "@/components/doc/appointments";

function DoctorAppointments() {
  return (
    <DoctorDashboardLayout>
      <DocAppointments />
    </DoctorDashboardLayout>
  );
}

export default DoctorAppointments;
