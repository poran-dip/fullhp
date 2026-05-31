"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  appointments: Appointment[];
}

// Patient type based on Prisma schema
export interface Patient {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  appointments: Appointment[];
}

enum AppointmentStatus {
  NEW = "NEW",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

interface Appointment {
  id: string;
  patient: Patient;
  patientId: string;
  doctor?: Doctor;
  doctorId?: string;
  dateTime?: Date | string;
  condition?: string;
  specialization?: string;
  status: AppointmentStatus;
}

interface DocHomeProps {
  doctorId: string;
  doctorDetails?: Doctor;
}

const DocHome: React.FC<DocHomeProps> = ({ doctorId }) => {
  // State for fetched data
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date information
  const today = new Date();
  const todayFullDay = today.toLocaleString("en-us", { weekday: "long" });

  // Format date for display
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Mock working hours (kept as placeholder)
  const workingHours =
    todayFullDay === "Sunday" ? "Day off" : "9:00 AM - 5:00 PM";

  useEffect(() => {
    const fetchAllAppointmentData = async () => {
      if (!doctorId) return;

      setIsLoading(true);
      try {
        // Fetch all appointments with a single API call
        const response = await fetch(
          `/api/appointments/?doctorId=${doctorId}&includePatientDetails=true`,
        );
        if (!response.ok) throw new Error("Failed to fetch appointments");

        const data = await response.json();
        setAllAppointments(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAppointmentData();
  }, [doctorId]);

  // Client-side filtering for today's appointments
  const todayAppointments = allAppointments.filter((appointment) => {
    if (!appointment.dateTime) return false;

    const appointmentDate = new Date(appointment.dateTime);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return appointmentDate >= startOfToday && appointmentDate <= endOfToday;
  });

  // Client-side filtering for new patients this week
  const newPatientsThisWeek = allAppointments.filter((appointment) => {
    if (!appointment.dateTime || appointment.status !== AppointmentStatus.NEW)
      return false;

    const appointmentDate = new Date(appointment.dateTime);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
  });

  // Client-side filtering for total appointments this week
  const totalAppointmentsThisWeek = allAppointments.filter((appointment) => {
    if (!appointment.dateTime) return false;

    const appointmentDate = new Date(appointment.dateTime);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
  });

  // Format appointment time
  const formatAppointmentTime = (
    dateTime: Date | string | undefined,
  ): string => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <h3 className="text-2xl font-bold">Welcome, Doctor</h3>
      <p className="text-slate-600 mt-2">{formattedDate}</p>

      {workingHours === "Day off" ? (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">
            It&apos;s your day off today. Enjoy your rest!
          </p>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">
            Today&apos;s working hours: {workingHours}
          </p>
        </div>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium text-slate-500">
            Today&apos;s Appointments
          </h4>
          {isLoading ? (
            <p className="text-3xl font-bold mt-2">...</p>
          ) : (
            <p className="text-3xl font-bold mt-2">
              {todayAppointments.length}
            </p>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-medium text-slate-500">
            New Patients This Week
          </h4>
          {isLoading ? (
            <p className="text-3xl font-bold mt-2">...</p>
          ) : (
            <p className="text-3xl font-bold mt-2">
              {newPatientsThisWeek.length}
            </p>
          )}
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-medium text-slate-500">
            Total Appointments This Week
          </h4>
          {isLoading ? (
            <p className="text-3xl font-bold mt-2">...</p>
          ) : (
            <p className="text-3xl font-bold mt-2">
              {totalAppointmentsThisWeek.length}
            </p>
          )}
        </Card>
      </div>

      {/* Today's appointments */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Today&apos;s Appointments</h3>
          <Link href="/docs/all-appointments">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-10 text-center">
            <p className="text-slate-600">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>Error loading appointments: {error}</p>
          </div>
        ) : workingHours === "Day off" ? (
          <div className="p-10 text-center">
            <p className="text-xl font-semibold text-slate-600">
              It&apos;s your day off!
            </p>
            <p className="text-slate-500 mt-2">Time to relax and recharge.</p>
          </div>
        ) : todayAppointments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-xl font-semibold text-slate-600">
              No appointments scheduled for today
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 border rounded-lg hover:bg-slate-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold flex items-center">
                      {formatAppointmentTime(appointment.dateTime)} -{" "}
                      {appointment.patient.name}
                      {appointment.status === AppointmentStatus.NEW && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </p>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {appointment.condition || "General Checkup"}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Status: {appointment.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent actions - kept as placeholder */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Recent Actions</h3>
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-600">
              You added notes for{" "}
              <span className="font-semibold">Bob Smith</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Yesterday at 3:42 PM</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-600">
              You prescribed medication for{" "}
              <span className="font-semibold">Alice Johnson</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Yesterday at 3:20 PM</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-600">
              You scheduled a follow-up with{" "}
              <span className="font-semibold">Charlie Wu</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Monday at 2:35 PM</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DocHome;
