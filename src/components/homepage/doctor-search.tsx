"use client";

import Cookies from "js-cookie";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type for Doctor
interface Doctor {
  id: string;
  name: string | null;
  specialization: string;
  image: string | null;
  rating: number;
  location: string | null;
  status?: string;
  appointments: Appointment[];
}

interface Appointment {
  [key: string]: unknown;
}

interface DoctorSearchProps {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
}

export default function DoctorSearch({
  doctors,
  isLoading,
  error,
}: DoctorSearchProps) {
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [searchResults, setSearchResults] = useState<Doctor[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);

    // Filter doctors based on search criteria
    let results = doctors;

    // Filter by specialty if not "All"
    if (specialty && specialty !== "All") {
      results = results.filter((doctor) => doctor.specialization === specialty);
    }

    // Filter by location with partial matching
    if (location) {
      const locationLower = location.toLowerCase();
      results = results.filter((doctor) =>
        doctor.location?.toLowerCase().includes(locationLower),
      );
    }

    setSearchResults(results);
  };

  // Reset search results when specialty or location changes
  const handleSpecialtyChange = (value: string) => {
    setSpecialty(value);
    setSearchResults(null);
    setHasSearched(false);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setSearchResults(null);
    setHasSearched(false);
  };

  const handleBookAppointment = (doctorId: string) => {
    Cookies.set("selectedDoctorId", doctorId, { expires: 2 / 1440 });
    router.push(`/book`);
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm bg-white">
        <CardContent className="p-6 text-center">
          <p>Loading doctors...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm bg-white">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-sm bg-white">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label
                  htmlFor="specialty"
                  className="text-sm font-medium block mb-2"
                >
                  Specialty
                </label>
                <Select value={specialty} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger id="specialty" className="w-full">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Specialties</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                    <SelectItem value="General Practice">
                      General Practice
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-5">
                <label
                  htmlFor="location"
                  className="text-sm font-medium block mb-2"
                >
                  Location
                </label>
                <Input
                  id="location"
                  placeholder="City, State or Zip Code"
                  value={location}
                  onChange={handleLocationChange}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasSearched && searchResults?.length === 0 && (
        <div className="mt-8 text-center">
          <Card>
            <CardContent className="p-6">
              <p className="text-lg text-muted-foreground">
                No doctors found
                {specialty && specialty !== "All" ? ` for ${specialty}` : ""}
                {location ? ` in ${location}` : ""}. Please try different search
                criteria.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-xl font-semibold">Search Results</h3>
          <div className="space-y-4">
            {searchResults.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={
                          doctor.image ||
                          "/placeholder.svg?height=100&width=100"
                        }
                        alt={doctor.name || "Doctor"}
                      />
                      <AvatarFallback>
                        {doctor.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "DR"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="text-lg font-semibold">{doctor.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialization}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {Array(5)
                            .fill(null)
                            .map((_, i) => (
                              <svg
                                // biome-ignore lint: static list
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? "opacity-100" : "opacity-30"}`}
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-sm">
                          {doctor.rating} ({doctor.appointments.length} reviews)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Specialty: {doctor.specialization}
                        </Badge>
                        {doctor.location && (
                          <Badge variant="outline" className="text-xs">
                            Location: {doctor.location}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center sm:flex-col sm:items-end gap-2 mt-4 sm:mt-0">
                      <Button
                        className="bg-black text-white cursor-pointer hover:bg-gray-800"
                        onClick={() => handleBookAppointment(doctor.id)}
                      >
                        Book Appointment
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`#`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
