"use client";

import AdminAppointments from "@/components/admin/appointments";
import AdminDashboardLayout from "@/components/dashboard/admin-dashboard";

function AppointmentsPage() {
  return (
    <AdminDashboardLayout>
      <AdminAppointments />
    </AdminDashboardLayout>
  );
}

export default AppointmentsPage;
