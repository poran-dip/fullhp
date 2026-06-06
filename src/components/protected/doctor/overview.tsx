"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApi } from "@/lib/api";

interface Patient {
  id: string;
  name: string | null;
  image: string | null;
  gender: string | null;
  dob: string | null;
}

interface Appointment {
  id: string;
  time: string;
  status: string;
  condition: string | null;
  department: string | null;
  patient: Patient;
}

interface DashboardData {
  doctorName: string | null;
  todaySchedule: { startTime: string; endTime: string } | null;
  appointments: Appointment[];
}

interface DoctorOverviewProps {
  data: DashboardData | null;
  error: string | null;
}

export default function DoctorOverview({ data, error }: DoctorOverviewProps) {
  const { apiFetch } = useApi();

  const appointments: Appointment[] = data?.appointments ?? [];
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hoursDisplay = data?.todaySchedule
    ? `${data.todaySchedule.startTime} – ${data.todaySchedule.endTime}`
    : "No schedule today";

  const handleAcknowledge = async (appointmentId: string) => {
    setAcknowledging(appointmentId);
    try {
      const res = await apiFetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DoctorAssigned" }),
      });

      if (!res.ok) throw new Error("Failed to update");
    } catch (err) {
      console.error("Failed to acknowledge appointment:", err);
    } finally {
      setAcknowledging(null);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold">
          Welcome, {data?.doctorName ?? "Doctor"}
        </h3>
        <p className="text-slate-500 mt-1 text-sm">{formattedDate}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium text-slate-500">
            Today&apos;s Appointments
          </h4>
          <p className="text-3xl font-bold mt-2">{appointments.length}</p>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-medium text-slate-500">Working Hours</h4>
          <p className="text-xl font-bold mt-auto">{hoursDisplay}</p>
        </Card>
      </div>

      {/* Today's appointments list */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Today&apos;s Appointments</h3>
          <Link href="/doctor/appointments">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">
              No appointments scheduled for today.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const isRequested = appointment.status === "Requested";
              return (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    {isRequested && (
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <div className={!isRequested ? "ml-5" : ""}>
                      <p className="font-semibold">
                        {formatTime(appointment.time)} —{" "}
                        {appointment.patient.name ?? "Unknown Patient"}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {appointment.condition ??
                          appointment.department ??
                          "General"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {appointment.status}
                      </p>
                    </div>
                  </div>

                  {isRequested && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={acknowledging === appointment.id}
                      onClick={() => handleAcknowledge(appointment.id)}
                    >
                      {acknowledging === appointment.id
                        ? "Saving..."
                        : "Acknowledge"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
