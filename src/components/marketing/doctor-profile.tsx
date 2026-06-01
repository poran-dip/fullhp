"use client";

import { format } from "date-fns";
import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const REVIEWS_PER_PAGE = 5;

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

type Day = {
  day: string;
  startTime: string;
  endTime: string;
};

type Rating = {
  id: string;
  stars: number;
  comment: string | null;
  createdAt: Date;
  patient: {
    user: {
      name: string | null;
      image: string | null;
    };
  };
};

type Doctor = {
  id: string;
  specialization: string;
  department: string;
  status: keyof typeof statusConfig;
  avgRating: number | null;
  ratingCount: number | null;
  phoneNo: string;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
  schedule: { days: Day[] } | null;
  appointments: { id: string }[];
  ratings: Rating[];
};

interface Props {
  doctor: Doctor;
  isLoggedIn: boolean;
}

function StarRow({ count, filled }: { count: number; filled: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <Star
            // biome-ignore lint: static list
            key={i}
            className={`h-4 w-4 text-yellow-400 ${i < filled ? "fill-yellow-400" : "fill-transparent"}`}
            aria-hidden="true"
          />
        ))}
    </div>
  );
}

export default function DoctorProfileClient({ doctor, isLoggedIn }: Props) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const status = statusConfig[doctor.status] ?? statusConfig.Inactive;
  const isBookable = doctor.status === "Active";

  const initials =
    doctor.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") ?? "DR";

  const sortedDays = [...(doctor.schedule?.days ?? [])].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day),
  );

  const visibleRatings = doctor.ratings.slice(0, visibleCount);
  const hasMore = visibleCount < doctor.ratings.length;

  const handleBook = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push(`/patient/book?doctorId=${doctor.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <header>
        <div>
          <Link
            href="/doctors"
            className="text-blue-600 font-medium hover:underline"
          >
            &larr; View All Doctors
          </Link>
        </div>
      </header>
      {/* Header card */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarImage
                src={doctor.user.image ?? undefined}
                alt={doctor.user.name ?? "Doctor"}
              />
              <AvatarFallback className="text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {doctor.user.name ?? "Unnamed Doctor"}
                </h1>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {doctor.specialization}
                <span className="mx-2 text-muted-foreground/40">·</span>
                {doctor.department}
              </p>
              <div className="flex items-center gap-2">
                <StarRow count={5} filled={Math.floor(doctor.avgRating ?? 0)} />
                <span className="text-sm text-muted-foreground">
                  {doctor.avgRating?.toFixed(1) ?? "—"} (
                  {doctor.ratingCount ?? 0} review
                  {doctor.ratingCount !== 1 ? "s" : ""})
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {doctor.appointments.length} total appointments
              </p>
            </div>

            <div className="shrink-0 flex sm:flex-col gap-2 sm:items-end sm:justify-start">
              <Button
                disabled={!isBookable}
                className="bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
                onClick={handleBook}
              >
                {isBookable ? "Book Appointment" : "Unavailable"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      {sortedDays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {WEEKDAY_ORDER.map((weekday) => {
                const slot = sortedDays.find((d) => d.day === weekday);
                const isToday = weekday === todayName;
                return (
                  <div
                    key={weekday}
                    className={`flex items-center justify-between px-6 py-3 ${isToday ? "bg-blue-50" : ""}`}
                  >
                    <span
                      className={`text-sm font-medium ${isToday ? "text-blue-700" : "text-foreground"}`}
                    >
                      {weekday}
                      {isToday && (
                        <span className="ml-2 text-xs text-blue-500">
                          Today
                        </span>
                      )}
                    </span>
                    {slot ? (
                      <span className="text-sm text-muted-foreground">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Off
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Patient Reviews
          {doctor.ratings.length > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({doctor.ratings.length})
            </span>
          )}
        </h2>

        {doctor.ratings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        ) : (
          <>
            <div className="space-y-3">
              {visibleRatings.map((rating) => {
                const patientInitials =
                  rating.patient.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") ?? "P";
                return (
                  <Card key={rating.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage
                            src={rating.patient.user.image ?? undefined}
                            alt={rating.patient.user.name ?? "Patient"}
                          />
                          <AvatarFallback className="text-xs">
                            {patientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-medium">
                              {rating.patient.user.name ?? "Anonymous"}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(rating.createdAt),
                                "MMM d, yyyy",
                              )}
                            </span>
                          </div>
                          <StarRow count={5} filled={rating.stars} />
                          {rating.comment && (
                            <p className="mt-1.5 text-sm text-muted-foreground">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
                >
                  Load more reviews
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Separator />

      {/* Member since */}
      <p className="text-xs text-muted-foreground text-center">
        On FullHP since {format(new Date(doctor.createdAt), "MMMM yyyy")}
      </p>
    </div>
  );
}
