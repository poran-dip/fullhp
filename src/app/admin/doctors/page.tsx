"use client";

import AdminDoctors from "@/components/admin/doctors";
import AdminDashboardLayout from "@/components/dashboard/admin-dashboard";

function DoctorsPage() {
  return (
    <AdminDashboardLayout>
      <AdminDoctors />
    </AdminDashboardLayout>
  );
}

export default DoctorsPage;
