"use client";

import { CheckCircle, Loader } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AppointmentDetails {
  id: string;
  patient: {
    name: string;
    email: string;
  };
  doctor?: {
    name: string;
    specialization: string;
  };
  dateTime?: string;
  description?: string;
  condition?: string;
}

export default function ConfirmationPage(props: {
  searchParams: Promise<{ doctor: string; appointment: string }>;
}) {
  const searchParams = use(props.searchParams);
  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointmentDetails() {
      try {
        // Fetch appointment details
        const response = await fetch(
          `/api/appointments/${searchParams.appointment}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch appointment details");
        }
        const data = await response.json();

        setAppointmentDetails(data);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setIsLoading(false);
      }
    }

    if (searchParams.appointment) {
      fetchAppointmentDetails();
    }
  }, [searchParams.appointment]);

  // Format date and time
  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return "Not specified";
    return new Date(dateTime).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="container py-20 flex items-center justify-center mx-auto my-auto">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-20 flex items-center justify-center mx-auto my-auto">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-red-500">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-20 flex items-center justify-center mx-auto my-auto">
      <Card className="text-center max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-3 sm:mb-4">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">
            Appointment Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">
            Your appointment has been successfully scheduled. We have sent a
            confirmation email with all the details.
          </p>
          <div className="rounded-lg bg-muted p-3 sm:p-4 text-left space-y-2">
            <p className="text-xs sm:text-sm">
              <strong>Patient Name:</strong> {appointmentDetails?.patient.name}
            </p>
            <p className="text-xs sm:text-sm">
              <strong>Email:</strong> {appointmentDetails?.patient.email}
            </p>
            <p className="text-xs sm:text-sm">
              <strong>Appointment ID:</strong> {appointmentDetails?.id}
            </p>
            {appointmentDetails?.doctor && (
              <>
                <p className="text-xs sm:text-sm">
                  <strong>Doctor:</strong> {appointmentDetails.doctor.name}
                </p>
                <p className="text-xs sm:text-sm">
                  <strong>Specialization:</strong>{" "}
                  {appointmentDetails.doctor.specialization}
                </p>
              </>
            )}
            <p className="text-xs sm:text-sm">
              <strong>Date & Time:</strong>{" "}
              {formatDateTime(appointmentDetails?.dateTime)}
            </p>
            {appointmentDetails?.description && (
              <p className="text-xs sm:text-sm">
                <strong>Description:</strong> {appointmentDetails.description}
              </p>
            )}
            {appointmentDetails?.condition && (
              <p className="text-xs sm:text-sm">
                <strong>Condition:</strong> {appointmentDetails.condition}
              </p>
            )}
            <p className="text-xs sm:text-sm">
              <strong>Status:</strong>{" "}
              <span className="text-green-600">Confirmed</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Link href="/">Return Home</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Link href="/dashboard">View Appointments</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
