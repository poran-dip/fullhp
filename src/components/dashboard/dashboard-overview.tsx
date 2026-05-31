import { Calendar, ClipboardList, Clock, User } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Appointment {
  id: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    image?: string;
  };
  dateTime: string;
  status: string;
}

export default function DashboardOverview() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for recent lab results - keeping this as placeholder
  const recentLabResults = [
    {
      id: 1,
      name: "Complete Blood Count (CBC)",
      date: "April 28, 2024",
      status: "normal",
      doctor: "Dr. Emily Rodriguez",
    },
    {
      id: 2,
      name: "Lipid Panel",
      date: "April 28, 2024",
      status: "abnormal",
      doctor: "Dr. Emily Rodriguez",
    },
  ];

  // Function to filter upcoming appointments
  const filterUpcomingAppointments = useCallback(
    (allAppointments: Appointment[]): Appointment[] => {
      const now = new Date();
      return allAppointments
        .filter((appointment) => {
          const appointmentDate = new Date(appointment.dateTime);
          return appointmentDate > now;
        })
        .sort((a, b) => {
          // Sort by date (earliest first)
          return (
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          );
        });
    },
    [],
  );

  useEffect(() => {
    async function fetchAppointments() {
      try {
        // Get patientId from localStorage
        const patientId = localStorage.getItem("patientId");

        if (!patientId) {
          setError("No patient ID found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch appointments from API
        const response = await fetch(
          `/api/appointments?patientId=${patientId}`,
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching appointments: ${response.statusText}`,
          );
        }

        const data = await response.json();

        // Filter for upcoming appointments
        const upcoming = filterUpcomingAppointments(data);
        setUpcomingAppointments(upcoming);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [filterUpcomingAppointments]);

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time from ISO string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your health information.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : upcomingAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Loading..."
                : error
                  ? "Error loading data"
                  : upcomingAppointments.length > 0
                    ? `Next: ${formatDate(upcomingAppointments[0]?.dateTime)}`
                    : "No upcoming appointments"}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/dashboard/appointments">View all</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Results</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentLabResults.length}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {recentLabResults[0]?.date}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/dashboard/lab-results">View all</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Active prescriptions
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              View details
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80%</div>
            <p className="text-xs text-muted-foreground">Profile completion</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/dashboard/profile">Complete profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="lab-results">Recent Lab Results</TabsTrigger>
        </TabsList>
        <TabsContent value="appointments" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Loading appointments...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-500">{error}</p>
              </CardContent>
            </Card>
          ) : upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No upcoming appointments found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={
                            appointment.doctor.image ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={appointment.doctor.name}
                        />
                        <AvatarFallback>
                          {appointment.doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{appointment.doctor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor.specialization}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(appointment.dateTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatTime(appointment.dateTime)}
                          </span>
                        </div>
                        <Badge
                          variant={
                            appointment.status === "COMPLETED"
                              ? "outline"
                              : appointment.status === "CANCELED"
                                ? "destructive"
                                : appointment.status === "EMERGENCY"
                                  ? "destructive"
                                  : "default"
                          }
                          className={
                            appointment.status === "NEW" ||
                            appointment.status === "PENDING"
                              ? "bg-green-500"
                              : ""
                          }
                        >
                          {appointment.status.charAt(0) +
                            appointment.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-6 pt-0">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button size="sm">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/appointments">View All Appointments</Link>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="lab-results" className="space-y-4">
          <div className="grid gap-4">
            {recentLabResults.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ordered by: {result.doctor}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{result.date}</span>
                      </div>
                      <Badge
                        variant={
                          result.status === "normal" ? "default" : "destructive"
                        }
                        className={
                          result.status === "normal" ? "bg-green-500" : ""
                        }
                      >
                        {result.status === "normal" ? "Normal" : "Abnormal"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end p-6 pt-0">
                  <Button size="sm">View Results</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/lab-results">View All Lab Results</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
