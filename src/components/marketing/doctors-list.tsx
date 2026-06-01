"use client";

import { Search, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DoctorWithUser } from "@/types";

const PAGE_SIZE = 20;

const statusConfig = {
  Active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  OnLeave: {
    label: "On Leave",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Inactive: {
    label: "Inactive",
    className: "bg-red-50 text-red-700 border-red-200",
  },
} as const satisfies Record<string, { label: string; className: string }>;

interface DoctorsListProps {
  doctors: DoctorWithUser[];
  error: string | null;
}

export default function DoctorsList({ doctors, error }: DoctorsListProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [page, setPage] = useState(1);

  const departments = useMemo(() => {
    return [...new Set(doctors.map((d) => d.department))].sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return doctors.filter((doctor) => {
      const nameMatch = doctor.user.name?.toLowerCase().includes(term) ?? false;
      const specMatch = doctor.specialization.toLowerCase().includes(term);
      const deptMatch = doctor.department.toLowerCase().includes(term);
      const termMatch = term === "" || nameMatch || specMatch || deptMatch;
      const departmentMatch =
        selectedDepartment === "all" ||
        doctor.department === selectedDepartment;
      return termMatch && departmentMatch;
    });
  }, [doctors, searchTerm, selectedDepartment]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleDepartment = (value: string) => {
    setSelectedDepartment(value);
    setPage(1);
  };

  const handleBook = (doctorId: string, status: string) => {
    if (status !== "Active") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    router.push(`/patient/book?doctorId=${doctorId}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => router.refresh()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-12 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
          Find a Doctor
        </h1>
        <p className="text-muted-foreground">
          Browse our network of qualified medical professionals.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, specialization, or department..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={handleDepartment}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filtered.length === 0
          ? "No doctors found"
          : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} doctor${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {/* List */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No doctors match your search. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((doctor) => {
            const status = statusConfig[doctor.status] ?? statusConfig.Inactive;
            const initials =
              doctor.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") ?? "DR";
            const isBookable = doctor.status === "Active";

            return (
              <div
                key={doctor.id}
                className="flex items-center gap-4 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow"
              >
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarImage
                    src={doctor.user.image ?? undefined}
                    alt={doctor.user.name ?? "Doctor"}
                  />
                  <AvatarFallback className="text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate">
                      {doctor.user.name ?? "Unnamed Doctor"}
                    </p>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {doctor.specialization}
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    {doctor.department}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <Star
                          // biome-ignore lint: static list
                          key={i}
                          className={`h-3.5 w-3.5 text-yellow-400 ${i < Math.floor(doctor.avgRating ?? 0) ? "fill-yellow-400" : "fill-transparent"}`}
                          aria-hidden="true"
                        />
                      ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      {doctor.avgRating?.toFixed(1) ?? "—"} ·{" "}
                      {doctor.appointments.length} appointments
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/doctors/${doctor.id}`}>Profile</Link>
                  </Button>
                  <Button
                    size="sm"
                    disabled={!isBookable}
                    className={`bg-black text-white hover:bg-neutral-800 disabled:opacity-50 ${!isBookable && `cursor-pointer`}`}
                    onClick={() => handleBook(doctor.id, doctor.status)}
                  >
                    Book
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
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
    </div>
  );
}
