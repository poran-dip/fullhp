"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DoctorWithUser } from "@/types";

interface DoctorResultsProps {
  results: DoctorWithUser[];
  hasSearched: boolean;
  department: string;
}

export default function DoctorResults({
  results,
  hasSearched,
  department,
}: DoctorResultsProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleBookAppointment = (doctorSlug: string) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    router.push(`/patient/book?doctor=${doctorSlug}`);
  };

  if (!hasSearched) return null;

  if (results.length === 0) {
    return (
      <div className="mt-8 text-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-lg text-muted-foreground">
              No doctors found
              {department && department !== "All" ? ` in ${department}` : ""}.
              Please try a different department.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold">Search Results</h3>
      <div className="space-y-4">
        {results.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden">
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={doctor.user.image ?? undefined}
                    alt={doctor.user.name ?? "Doctor"}
                  />
                  <AvatarFallback>
                    {doctor.user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") ?? "DR"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="text-lg font-semibold">
                      {doctor.user.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialization}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <Star
                          // biome-ignore lint: static list
                          key={i}
                          className={`w-4 h-4 text-yellow-400 ${i < Math.floor(doctor.avgRating ?? 0) ? "fill-yellow-400" : "fill-transparent"}`}
                          aria-hidden="true"
                        />
                      ))}
                    <span className="ml-1 text-sm text-muted-foreground">
                      {doctor.avgRating?.toFixed(1) ?? "No ratings"} (
                      {doctor.appointments.length} appointments)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {doctor.department}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {doctor.specialization}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {doctor.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center sm:flex-col sm:items-end gap-2 mt-4 sm:mt-0">
                  <Button
                    className="bg-black text-white hover:bg-gray-800"
                    onClick={() => handleBookAppointment(doctor.slug)}
                  >
                    Book Appointment
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/doctors/${doctor.slug}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
