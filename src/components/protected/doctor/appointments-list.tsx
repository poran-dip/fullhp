"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface DoctorAppointmentsListProps {
  data: Appointment[] | null;
  error: string | null;
}

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, string> = {
  Requested: "bg-blue-100 text-blue-800",
  DoctorAssigned: "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Emergency: "bg-red-200 text-red-900",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

export default function DoctorAppointmentsList({
  data,
  error,
}: DoctorAppointmentsListProps) {
  const { apiFetch } = useApi();

  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">(
    "upcoming",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [completing, setCompleting] = useState<string | null>(null);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const filtered = useMemo(() => {
    if (!data) return [];

    return data.filter((a) => {
      const aTime = new Date(a.time);
      const query = search.toLowerCase();

      const matchesSearch =
        a.patient.name?.toLowerCase().includes(query) ||
        a.condition?.toLowerCase().includes(query) ||
        a.department?.toLowerCase().includes(query);

      const matchesTime =
        timeFilter === "all"
          ? true
          : timeFilter === "upcoming"
            ? aTime >= todayStart &&
              a.status !== "Completed" &&
              a.status !== "Cancelled"
            : aTime < todayStart ||
              a.status === "Completed" ||
              a.status === "Cancelled";

      const matchesStart = startDate ? aTime >= new Date(startDate) : true;
      const matchesEnd = endDate
        ? aTime <= new Date(new Date(endDate).setHours(23, 59, 59, 999))
        : true;

      return matchesSearch && matchesTime && matchesStart && matchesEnd;
    });
  }, [data, search, timeFilter, startDate, endDate, todayStart]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (val: string) => {
    setTimeFilter(val as "upcoming" | "past" | "all");
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleComplete = async (id: string) => {
    setCompleting(id);
    await apiFetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Completed" }),
    });
    setCompleting(null);
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
      <h3 className="text-2xl font-bold">Appointments</h3>

      <Card className="p-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <Input
            placeholder="Search by patient, condition, department..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1"
          />

          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-36"
            />
            <span className="text-slate-400 text-sm">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-36"
            />
          </div>

          <Select value={timeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          {filtered.length} appointment{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* List */}
        {paginated.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">No appointments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((a) => (
              <div
                key={a.id}
                className="p-4 border rounded-lg hover:bg-slate-50 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    {a.patient.name ?? "Unknown Patient"}
                    <StatusBadge status={a.status} />
                  </p>
                  <p className="text-sm text-blue-600 mt-0.5">
                    {formatDateTime(a.time)}
                  </p>
                  {(a.condition || a.department) && (
                    <p className="text-sm text-slate-500 mt-0.5">
                      {a.condition ?? a.department}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {a.status !== "Completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={completing === a.id}
                      onClick={() => handleComplete(a.id)}
                    >
                      {completing === a.id ? "Saving..." : "Mark Complete"}
                    </Button>
                  )}
                  <Link href={`/doctor/appointments/${a.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
