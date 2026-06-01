import { Calendar, ClipboardList, Clock, User } from "lucide-react";
import Link from "next/link";
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

interface AppointmentSummary {
  id: string;
  time: string;
  status: string;
  department: string | null;
  doctor: {
    id: string;
    name: string | null;
    image: string | null;
    specialization: string;
  } | null;
}

interface Props {
  data: {
    nextAppointment: AppointmentSummary | null;
    lastAppointment:
      | (AppointmentSummary & { doctorComments: string | null })
      | null;
    latestTest: { test: string; result: string | null } | null;
    prescriptionCount: number;
    upcomingAppointments: AppointmentSummary[];
  } | null;
  error: string | null;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadgeProps(status: string) {
  switch (status) {
    case "Completed":
      return { variant: "outline" as const, className: "" };
    case "Cancelled":
      return { variant: "destructive" as const, className: "" };
    case "Emergency":
      return { variant: "destructive" as const, className: "" };
    default:
      return { variant: "default" as const, className: "bg-green-500" };
  }
}

function doctorInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export default function PatientOverview({ data, error }: Props) {
  if (error || !data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your health information.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive text-sm">
              {error ?? "Failed to load dashboard data."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    nextAppointment,
    lastAppointment,
    latestTest,
    prescriptionCount,
    upcomingAppointments,
  } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your health information.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Next Appointment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Appointment
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <>
                <div className="text-2xl font-bold truncate">
                  {nextAppointment.doctor?.name ?? "Unassigned"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(nextAppointment.time)} &middot;{" "}
                  {formatTime(nextAppointment.time)}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">
                  No upcoming appointments
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/dashboard/appointments">View all</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Latest Test Result */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest Test Result
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestTest ? (
              <>
                <div className="text-2xl font-bold truncate">
                  {latestTest.result ?? "Pending"}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {latestTest.test}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">
                  No tests done yet
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/dashboard/appointments">View appointments</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Medications / Prescriptions */}
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
            <div className="text-2xl font-bold">{prescriptionCount}</div>
            <p className="text-xs text-muted-foreground">
              {prescriptionCount === 1
                ? "Active prescription"
                : "Total prescriptions"}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/dashboard/appointments">View details</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Last Appointment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Appointment
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lastAppointment ? (
              <>
                <div className="text-2xl font-bold truncate">
                  {lastAppointment.doctor?.name ?? "Unassigned"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(lastAppointment.time)}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">
                  No previous appointments
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/dashboard/appointments">View history</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="last">Last Appointment</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No upcoming appointments found.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => {
                const badge = statusBadgeProps(appointment.status);
                return (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={appointment.doctor?.image ?? undefined}
                            alt={appointment.doctor?.name ?? "Doctor"}
                          />
                          <AvatarFallback>
                            {doctorInitials(appointment.doctor?.name ?? null)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">
                            {appointment.doctor?.name ?? "Doctor TBA"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.doctor?.specialization ??
                              appointment.department ??
                              "—"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(appointment.time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatTime(appointment.time)}
                            </span>
                          </div>
                          <Badge
                            variant={badge.variant}
                            className={badge.className}
                          >
                            {appointment.status}
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
                );
              })}
            </div>
          )}
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/appointments">View All Appointments</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="last" className="space-y-4">
          {lastAppointment ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={lastAppointment.doctor?.image ?? undefined}
                      alt={lastAppointment.doctor?.name ?? "Doctor"}
                    />
                    <AvatarFallback>
                      {doctorInitials(lastAppointment.doctor?.name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">
                      {lastAppointment.doctor?.name ?? "Doctor TBA"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lastAppointment.doctor?.specialization ??
                        lastAppointment.department ??
                        "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(lastAppointment.time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatTime(lastAppointment.time)}
                      </span>
                    </div>
                    <Badge {...statusBadgeProps(lastAppointment.status)}>
                      {lastAppointment.status}
                    </Badge>
                  </div>
                </div>
                {lastAppointment.doctorComments && (
                  <div className="mt-4 rounded-md bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Doctor&apos;s Notes
                    </p>
                    <p className="text-sm">{lastAppointment.doctorComments}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end p-6 pt-0">
                <Button size="sm" asChild>
                  <Link href="/dashboard/appointments">View Full History</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No previous appointments found.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
