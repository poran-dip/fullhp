"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DoctorWithUser } from "@/types";

interface FeaturedDoctorsProps {
  doctors: DoctorWithUser[];
  error: string | null;
}

const statusStyles: Record<string, string> = {
  Active: "bg-green-50 text-green-700 border-green-200",
  OnLeave: "bg-blue-50 text-blue-700 border-blue-200",
  Inactive: "bg-red-50 text-red-700 border-red-200",
};

export default function FeaturedDoctorsSection({
  doctors,
  error,
}: FeaturedDoctorsProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleBookAppointment = (doctorId: string) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    router.push(`/patient/book?doctorId=${doctorId}`);
  };

  if (error) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  const featured = doctors.slice(0, 4);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
            Featured Doctors
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground md:text-lg">
            Our top-rated healthcare professionals ready to provide the care you
            need.
          </p>
        </div>

        {/* Mobile: rows */}
        <div className="flex flex-col gap-4 lg:hidden">
          {featured.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden">
              <CardContent className="px-4">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16 shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {doctor.user.name ?? "Unnamed Doctor"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {doctor.department}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array(5)
                        .fill(null)
                        .map((_, i) => (
                          <Star
                            // biome-ignore lint: static list
                            key={i}
                            className={`w-3 h-3 text-yellow-400 ${i < Math.floor(doctor.avgRating ?? 0) ? "fill-yellow-400" : "fill-transparent"}`}
                            aria-hidden="true"
                          />
                        ))}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {doctor.avgRating?.toFixed(1) ?? "—"}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`mt-2 text-xs ${statusStyles[doctor.status] ?? ""}`}
                    >
                      {doctor.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={() => handleBookAppointment(doctor.id)}
                    >
                      Book
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/doctors/${doctor.id}`}>Profile</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop: 4-column grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {featured.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden border shadow-sm">
              <div className="aspect-square relative">
                <Image
                  src={doctor.user.image ?? "/placeholder.svg"}
                  alt={doctor.user.name ?? "Doctor"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="font-semibold text-lg">
                    {doctor.user.name ?? "Unnamed Doctor"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.department}
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
                  <span className="ml-1 text-sm font-medium">
                    {doctor.avgRating?.toFixed(1) ?? "—"} (
                    {doctor.appointments.length})
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={statusStyles[doctor.status] ?? ""}
                >
                  {doctor.status}
                </Badge>
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={() => handleBookAppointment(doctor.id)}
                  >
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Button variant="outline" asChild>
            <Link href="/doctors">View All Doctors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
