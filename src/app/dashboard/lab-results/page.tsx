"use client";

import LabResultsList from "@/components/dashboard/lab-results-list";
import PatientDashboardLayout from "@/components/dashboard/patient-dashboard";

function LabResultsPage() {
  return (
    <PatientDashboardLayout>
      <LabResultsList />
    </PatientDashboardLayout>
  );
}

export default LabResultsPage;
