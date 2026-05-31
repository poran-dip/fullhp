"use client";

import AdminAmbulances from "@/components/admin/ambulances";
import AdminDashboardLayout from "@/components/dashboard/admin-dashboard";

function AmbulancesPage() {
  return (
    <AdminDashboardLayout>
      <AdminAmbulances />
    </AdminDashboardLayout>
  );
}

export default AmbulancesPage;
