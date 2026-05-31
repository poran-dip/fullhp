"use client";

import DoctorDashboardLayout from "@/components/dashboard/doctor-dashboard";
import DocStatus from "@/components/doc/status";

function DoctorStatus() {
  return (
    <DoctorDashboardLayout>
      <DocStatus />
    </DoctorDashboardLayout>
  );
}

export default DoctorStatus;
