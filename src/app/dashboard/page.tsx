"use client";

import DashboardOverview from "@/components/dashboard/dashboard-overview";
import PatientDashboardLayout from "@/components/dashboard/patient-dashboard";

function DashboardPage() {
  return (
    <PatientDashboardLayout>
      <DashboardOverview />
    </PatientDashboardLayout>
  );
}

export default DashboardPage;
