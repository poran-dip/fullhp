"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define enums and interfaces based on schema
enum Status {
  NEW = "NEW",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

interface Patient {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

interface Appointment {
  id: string;
  patient?: Patient;
  patientId: string;
  doctor?: Doctor;
  doctorId?: string;
  dateTime?: string;
  condition?: string;
  specialization?: string;
  status: Status;
}

interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

interface StatusBadgeProps {
  status: Status;
}

// Status badge component for appointment status
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = (): string => {
    switch (status) {
      case Status.NEW:
        return "bg-blue-100 text-blue-800";
      case Status.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case Status.COMPLETED:
        return "bg-green-100 text-green-800";
      case Status.CANCELED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`${getStatusStyles()} px-2 py-0.5 rounded-full text-xs font-medium`}
    >
      {status}
    </span>
  );
};

const AllAppointmentsPage: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [doctorId, setDoctorId] = useState<string>("");
  const [doctorName, setDoctorName] = useState<string>("");
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAppointmentsLoading, setIsAppointmentsLoading] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // 'all' or one of Status enum values
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: "",
    endDate: "",
  });

  const checkAuth = useCallback((): void => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const storedDoctorId = localStorage.getItem("doctorId");
    const storedDoctorName = localStorage.getItem("doctorName");

    if (storedIsLoggedIn === "true" && storedDoctorId) {
      setIsLoggedIn(true);
      setDoctorId(storedDoctorId);
      setDoctorName(storedDoctorName || "");
    } else {
      // Unlike the dashboard, we'll show an access denied message instead of redirecting
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []);

  // Check login status on component mount
  useEffect(() => {
    // We need to make sure we're running in the browser before accessing localStorage
    if (typeof window !== "undefined") {
      checkAuth();
    }
  }, [checkAuth]);

  // Fetch appointments when logged in and doctorId is available - only once
  useEffect(() => {
    const fetchAllAppointments = async (): Promise<void> => {
      if (!isLoggedIn || !doctorId) return;

      try {
        setIsAppointmentsLoading(true);

        // Fetch all appointments with patient details in a single call
        const url = `/api/doctors/${doctorId}/appointments?includePatientDetails=true`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error fetching appointments: ${response.status}`);
        }

        const data = await response.json();
        setAllAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setIsAppointmentsLoading(false);
      }
    };

    fetchAllAppointments();
  }, [isLoggedIn, doctorId]);

  // Filter appointments based on all criteria
  const filteredAppointments = allAppointments.filter((appointment) => {
    const patientName = appointment.patient?.name?.toLowerCase() || "";
    const condition = appointment.condition?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const status = appointment.status;
    const appointmentDate = appointment.dateTime
      ? new Date(appointment.dateTime)
      : null;

    // Apply search filter
    const matchesSearch =
      patientName.includes(query) || condition.includes(query);

    // Apply status filter
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    // Apply date range filter
    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate && appointmentDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      matchesDateRange =
        appointmentDate >= startDate && appointmentDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Handle login redirect
  const handleLoginRedirect = (): void => {
    router.push("/docs/login");
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "No date specified";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <p className="text-xl font-medium text-slate-600">Loading...</p>
      </div>
    );
  }

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-6 text-slate-600">
            You need to be logged in to view appointments.
          </p>
          <Button onClick={handleLoginRedirect}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  // Logged in state with appointments
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Appointments</h1>
          {doctorName && <p className="text-slate-600">Dr. {doctorName}</p>}
        </div>
        <Link href="/docs">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card className="p-6">
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by patient name or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-36"
            />
            <span className="flex items-center">to</span>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-36"
            />
          </div>

          <div>
            <Tabs
              defaultValue="all"
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value={Status.NEW}>New</TabsTrigger>
                <TabsTrigger value={Status.PENDING}>Pending</TabsTrigger>
                <TabsTrigger value={Status.COMPLETED}>Completed</TabsTrigger>
                <TabsTrigger value={Status.CANCELED}>Canceled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-slate-600">
          Found {filteredAppointments.length} appointments
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {isAppointmentsLoading ? (
            <div className="p-10 text-center">
              <p className="text-slate-600">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 border rounded-lg hover:bg-slate-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold flex items-center">
                      {appointment.patient?.name || "Unknown Patient"}
                      <span className="ml-2">
                        <StatusBadge status={appointment.status} />
                      </span>
                    </p>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      <span className="text-blue-600">
                        {formatDate(appointment.dateTime)}
                      </span>
                      {appointment.condition && ` - ${appointment.condition}`}
                    </p>
                    {appointment.patient?.age &&
                      appointment.patient?.gender && (
                        <p className="text-sm text-slate-500 mt-1">
                          {appointment.patient.age} years,{" "}
                          {appointment.patient.gender}
                        </p>
                      )}
                  </div>
                  <Link href={`/docs/appointments/${appointment.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <p className="text-xl font-semibold text-slate-600">
                No appointments found
              </p>
              <p className="text-slate-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AllAppointmentsPage;
