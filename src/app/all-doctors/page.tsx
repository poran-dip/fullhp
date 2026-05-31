"use client";

import { Loader2, MapPin, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/navbar";
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

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

interface Doctor {
  id: string;
  name: string | null;
  email: string;
  specialization: string;
  status: "AVAILABLE" | "ON_DUTY" | "OFF_DUTY" | "UNAVAILABLE";
  rating: number;
  image: string | null;
  location: string | null;
  appointments: Appointment[];
}

function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  const router = useRouter();

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/doctors");
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = await response.json();

      const safeDoctors = data.map((doctor: Doctor) => ({
        id: doctor.id ?? "",
        name: doctor.name ?? "Unnamed Doctor",
        email: doctor.email,
        specialization: doctor.specialization ?? "General Practice",
        status: doctor.status ?? "AVAILABLE",
        rating: Number(doctor.rating ?? 0),
        image: doctor.image ?? "/placeholder-doctor.png",
        location: doctor.location ?? "Location Not Specified",
        appointments: doctor.appointments ?? [],
      }));

      setDoctors(safeDoctors);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to load doctors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const specializations = useMemo(() => {
    return [...new Set(doctors.map((doctor) => doctor.specialization))].sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const specialization =
      selectedSpecialization === "none" ? "" : selectedSpecialization;
    return doctors.filter((doctor) => {
      const nameMatch =
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const locationMatch =
        doctor.location?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false;
      const specializationMatch =
        specialization === "" ||
        doctor.specialization === selectedSpecialization;

      return (
        (searchTerm === "" || nameMatch || locationMatch) && specializationMatch
      );
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  const handleBookAppointment = (doctorId: string) => {
    localStorage.setItem("doctorIdToBook", doctorId);
    router.push(`/book`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500";
      case "ON_DUTY":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={fetchDoctors} variant="outline">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Find Your Doctor</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Search from our network of qualified medical professionals
        </p>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedSpecialization}
            onValueChange={setSelectedSpecialization}
          >
            <SelectTrigger className="w-50">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No doctors found matching your criteria
              </p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Doctor Details */}
                <div className="flex items-center gap-6">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden">
                    <Image
                      src={doctor.image || "/placeholder-doctor.png"}
                      alt={doctor.name || "Doctor"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 96px) 100vw, 96px"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{doctor.name}</h3>
                    <p className="text-muted-foreground">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {doctor.location}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{doctor.rating.toFixed(1)}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(doctor.status)}
                    >
                      {doctor.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/profile/${doctor.id}`}>View Profile</Link>
                    </Button>
                    <Button
                      onClick={() =>
                        doctor.status === "AVAILABLE" &&
                        handleBookAppointment(doctor.id)
                      }
                      disabled={doctor.status !== "AVAILABLE"}
                      className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-200"
                    >
                      {doctor.status === "AVAILABLE"
                        ? "Book Appointment"
                        : "Not Available"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <DoctorsList />
    </div>
  );
}
