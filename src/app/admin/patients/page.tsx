"use client";

import AdminPatients from "@/components/admin/patients";
import AdminDashboardLayout from "@/components/dashboard/admin-dashboard";

function PatientsPage() {
  return (
    <AdminDashboardLayout>
      <AdminPatients />
    </AdminDashboardLayout>
  );
}

export default PatientsPage;
