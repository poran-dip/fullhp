import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Updated interface to match Prisma schema
interface Patient {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
}

interface AppointmentData {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  condition?: string;
  status: "NEW" | "PENDING" | "COMPLETED" | "CANCELED";
  patient: Patient;
  description?: string;
  prescriptions?: string[];
  tests?: string[];
  comments?: string;
  appointmentHistory?: {
    date: string;
    notes: string;
  }[];
}

interface DaySchedule {
  workingHours: string;
  listOfPatients: FormattedAppointment[];
}

interface WeeklySchedule {
  [day: string]: DaySchedule;
}

interface FormattedAppointment {
  id: string;
  appointmentTime: string;
  patientName: string;
  condition?: string;
  description?: string;
  isNew: boolean;
  status: "NEW" | "PENDING" | "COMPLETED" | "CANCELED";
  age?: number;
  sex?: string;
  patientId: string;
  prescriptions?: string[];
  tests?: string[];
  comments?: string;
  appointmentHistory?: {
    date: string;
    notes: string;
  }[];
}

const generateWeekDates = () => {
  const today = new Date();
  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    weekDates.push({
      fullDay: date.toLocaleString("en-us", { weekday: "long" }),
      shortDay: date.toLocaleString("en-us", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleString("en-us", { month: "short" }),
      fullDate: date,
      isoString: date.toISOString().split("T")[0], // YYYY-MM-DD format for API calls
    });
  }

  return weekDates;
};

// Default working hours by day
const DEFAULT_WORKING_HOURS = {
  Monday: "2:00 PM - 4:00 PM",
  Tuesday: "2:00 PM - 4:00 PM",
  Wednesday: "2:00 PM - 4:00 PM",
  Thursday: "7:00 PM - 9:00 PM",
  Friday: "7:00 PM - 9:00 PM",
  Saturday: "Day off",
  Sunday: "Day off",
};

const DocAppointments = () => {
  const weekDates = useMemo(() => generateWeekDates(), []);
  const todayFullDay = new Date().toLocaleString("en-us", { weekday: "long" });
  const [selectedDay, setSelectedDay] = useState(todayFullDay);
  const [selectedDate, setSelectedDate] = useState(weekDates[0]);
  const [weeklyAppointments, setWeeklyAppointments] = useState<WeeklySchedule>(
    {},
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] =
    useState<FormattedAppointment | null>(null);
  const [patientComments, setPatientComments] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(true);

  // Get doctor ID from session/context/localStorage
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const storedDoctorId = localStorage.getItem("doctorId");
    if (storedDoctorId) setDoctorId(storedDoctorId);
  }, []);

  // Transform API data to weekly schedule format
  const formatAppointmentsToWeeklySchedule = useCallback(
    (
      appointments: AppointmentData[],
      dates: typeof weekDates,
    ): WeeklySchedule => {
      const schedule: WeeklySchedule = {};
      const dateToDay = new Map();

      dates.forEach((dateInfo) => {
        dateToDay.set(dateInfo.isoString, dateInfo.fullDay);
        schedule[dateInfo.fullDay] = {
          workingHours:
            DEFAULT_WORKING_HOURS[
              dateInfo.fullDay as keyof typeof DEFAULT_WORKING_HOURS
            ],
          listOfPatients: [],
        };
      });

      appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.dateTime);
        const appointmentIsoDate = appointmentDate.toLocaleDateString("en-CA");
        const dayName = dateToDay.get(appointmentIsoDate);

        if (dayName && schedule[dayName]) {
          const appointmentTime = appointmentDate.toLocaleTimeString("en-us", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          schedule[dayName].listOfPatients.push({
            id: appointment.id,
            appointmentTime,
            patientName: appointment.patient.name,
            patientId: appointment.patientId,
            condition: appointment.condition || "General Checkup",
            description: appointment.description || "",
            isNew: appointment.status === "NEW",
            status: appointment.status,
            age: appointment.patient.age,
            sex: appointment.patient.gender,
            comments: appointment.comments || "",
            prescriptions: appointment.prescriptions || [],
            tests: appointment.tests || [],
            appointmentHistory: appointment.appointmentHistory || [],
          });
        }
      });

      return schedule;
    },
    [],
  );

  useEffect(() => {
    if (!doctorId) return;

    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        // Calculate date range for next 7 days
        const startDate = weekDates[0].isoString;
        const endDate = weekDates[6].isoString;

        // Fetch appointments from API with date range
        const response = await fetch(
          `/api/appointments?doctorId=${doctorId}&startDate=${startDate}&endDate=${endDate}&includePatientDetails=true`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        console.log("Response: ", response);

        const data: AppointmentData[] = await response.json();

        // Transform appointments into weekly schedule format
        const formattedSchedule = formatAppointmentsToWeeklySchedule(
          data,
          weekDates,
        );
        setWeeklyAppointments(formattedSchedule);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Error", {
          description: "Failed to load appointments. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId, weekDates, formatAppointmentsToWeeklySchedule]);

  const countNewAppointments = (day: string) => {
    return (
      weeklyAppointments[day]?.listOfPatients.filter((patient) => patient.isNew)
        .length || 0
    );
  };

  const viewDetails = (day: string, patientId: string) => {
    const patient = weeklyAppointments[day]?.listOfPatients.find(
      (p) => p.patientId === patientId,
    );
    if (patient) {
      setSelectedPatient(patient);
      setPatientComments(patient.comments || "");
      setDetailDialogOpen(true);
    }
  };

  const saveComments = async () => {
    if (selectedPatient && selectedDay) {
      try {
        // Update comments in the backend
        const response = await fetch(
          `/api/appointments/${selectedPatient.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              comments: patientComments,
              status: "PENDING", // Change from NEW to PENDING if it was NEW
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update comments");
        }

        // Update local state
        const updatedAppointments = { ...weeklyAppointments };

        const patientIndex = updatedAppointments[
          selectedDay
        ].listOfPatients.findIndex((p) => p.id === selectedPatient.id);

        if (patientIndex !== -1) {
          const updatedPatients = [
            ...updatedAppointments[selectedDay].listOfPatients,
          ];
          updatedPatients[patientIndex] = {
            ...updatedPatients[patientIndex],
            isNew: false,
            comments: patientComments,
          };

          updatedAppointments[selectedDay] = {
            ...updatedAppointments[selectedDay],
            listOfPatients: updatedPatients,
          };

          setWeeklyAppointments(updatedAppointments);

          setSelectedPatient({
            ...selectedPatient,
            isNew: false,
          });

          toast.success("Success", {
            description: "Patient notes saved successfully",
          });
        }
      } catch (error) {
        console.error("Error saving comments:", error);
        toast.error("Error", {
          description: "Failed to save patient notes. Please try again.",
        });
      }

      setDetailDialogOpen(false);
    }
  };

  // Add a new API endpoint to handle the actual data update
  const addPrescription = async (prescription: string) => {
    if (selectedPatient) {
      // Implementation for adding prescription would go here
      console.log("Adding prescription", prescription);
    }
  };

  const addTest = async (test: string) => {
    if (selectedPatient) {
      // Implementation for adding test would go here
      console.log("Adding test", test);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <p className="text-lg">Loading appointments...</p>
        </div>
      )}

      {/* Following Week's Schedule */}
      <h3 className="text-xl font-bold mb-6">This Week&apos;s Schedule</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {weekDates.map((day) => {
          const hasNewAppointments = countNewAppointments(day.fullDay) > 0;
          const isSelected = day.fullDay === selectedDay;
          const isToday = day.fullDay === todayFullDay;
          const totalAppointments =
            weeklyAppointments[day.fullDay]?.listOfPatients.length || 0;

          return (
            <Button
              key={day.fullDay}
              onClick={() => {
                setSelectedDay(day.fullDay);
                setSelectedDate(day);
              }}
              className={`p-4 border w-full text-left flex flex-col items-start h-32 relative
              ${isSelected ? "bg-blue-600 text-white border-blue-700" : isToday ? "bg-blue-50 border-blue-200" : "hover:bg-blue-100"}`}
              variant="outline"
            >
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold">{day.shortDay}</div>
                <div className="text-lg font-semibold">{day.date}</div>
                <div className="text-sm text-slate-500">{day.month}</div>
              </div>
              <p
                className={`text-sm mt-1 ${isSelected ? "text-blue-100" : "text-slate-500"}`}
              >
                {weeklyAppointments[day.fullDay]?.workingHours ||
                  DEFAULT_WORKING_HOURS[
                    day.fullDay as keyof typeof DEFAULT_WORKING_HOURS
                  ]}
              </p>

              <div
                className={`text-sm mt-2 ${isSelected ? "text-blue-100" : "text-slate-600"}`}
              >
                Appointments: {totalAppointments}
              </div>

              {hasNewAppointments && (
                <div className="absolute top-4 right-4 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  {countNewAppointments(day.fullDay)}
                </div>
              )}
            </Button>
          );
        })}
        <Link href="/docs/all-appointments" className="block w-full h-32">
          <Button className="p-8 border w-full text-left flex flex-col items-start h-32 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
            <h4 className="font-semibold">View More</h4>
            <div className="mt-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-2"
                aria-hidden="true"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </Button>
        </Link>
      </div>
      <Card className="p-6">
        {/* Selected Day's Schedule */}
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4">
            Appointments on {selectedDate.shortDay}, {selectedDate.date}{" "}
            {selectedDate.month}
          </h3>

          {/* Display working hours */}
          <p className="text-md font-medium mb-6 pb-2 border-b">
            Working Hours:{" "}
            {weeklyAppointments[selectedDay]?.workingHours ||
              DEFAULT_WORKING_HOURS[
                selectedDay as keyof typeof DEFAULT_WORKING_HOURS
              ]}
          </p>

          {/* Check if it's a day off or if there are patients */}
          {weeklyAppointments[selectedDay]?.workingHours === "Day off" ? (
            <div className="p-10 text-center">
              <p className="text-xl font-semibold text-slate-600">
                It&apos;s your day off!
              </p>
              <p className="text-slate-500 mt-2">Time to relax and recharge.</p>
            </div>
          ) : !weeklyAppointments[selectedDay] ||
            weeklyAppointments[selectedDay]?.listOfPatients.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-xl font-semibold text-slate-600">
                No appointments scheduled
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyAppointments[selectedDay]?.listOfPatients.map(
                (patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 border rounded-lg hover:bg-slate-50 relative ${patient.status === "CANCELED" ? "opacity-60 bg-slate-100" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold flex items-center">
                          {patient.appointmentTime} - {patient.patientName}
                          {patient.isNew && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                          {patient.status === "CANCELED" && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Canceled
                            </span>
                          )}
                        </p>
                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {patient.condition}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {patient.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          viewDetails(selectedDay, patient.patientId)
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              {selectedPatient?.patientName}
              {selectedPatient?.isNew && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  New Patient
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Tabs for different sections */}
              <Tabs
                defaultValue="info"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="info">Patient Info</TabsTrigger>
                  <TabsTrigger value="medical">Medical Records</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="notes">Doctor&apos;s Notes</TabsTrigger>
                </TabsList>

                {/* Patient Info Tab */}
                <TabsContent value="info" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">
                        Personal Details
                      </h3>
                      <div className="border rounded-md p-4 space-y-2">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {selectedPatient.patientName}
                        </p>
                        <p>
                          <span className="font-medium">Age:</span>{" "}
                          {selectedPatient.age || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Sex:</span>{" "}
                          {selectedPatient.sex || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">
                        Current Appointment
                      </h3>
                      <div className="border rounded-md p-4 space-y-2">
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {selectedDate.shortDay}, {selectedDate.date}{" "}
                          {selectedDate.month}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {selectedPatient.appointmentTime}
                        </p>
                        <p>
                          <span className="font-medium">Condition:</span>{" "}
                          {selectedPatient.condition}
                        </p>
                        <p>
                          <span className="font-medium">Description:</span>{" "}
                          {selectedPatient.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Medical Records Tab */}
                <TabsContent value="medical" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Prescriptions</h3>
                      <div className="border rounded-md p-4">
                        {selectedPatient.prescriptions &&
                        selectedPatient.prescriptions.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedPatient.prescriptions.map(
                              (prescription) => (
                                <li key={prescription}>{prescription}</li>
                              ),
                            )}
                          </ul>
                        ) : (
                          <p className="text-slate-500 italic">
                            No prescriptions recorded
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Tests</h3>
                      <div className="border rounded-md p-4">
                        {selectedPatient.tests &&
                        selectedPatient.tests.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedPatient.tests.map((test) => (
                              <li key={test}>{test}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 italic">
                            No tests recorded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-semibold">Add New</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => addPrescription("New prescription")}
                        >
                          + Add Prescription
                        </Button>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => addTest("New test")}
                        >
                          + Add Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Appointment History
                  </h3>

                  {selectedPatient.appointmentHistory &&
                  selectedPatient.appointmentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPatient.appointmentHistory.map((appointment) => (
                        <div
                          key={appointment.date}
                          className="border rounded-md p-4"
                        >
                          <p className="font-medium text-blue-600">
                            {new Date(appointment.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-slate-600 mt-2">
                            {appointment.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border rounded-md p-6 text-center">
                      <p className="text-slate-500">No previous appointments</p>
                    </div>
                  )}
                </TabsContent>

                {/* Doctor's Notes Tab */}
                <TabsContent value="notes" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">Private Notes</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      These notes are for your reference only and won&apos;t be
                      shared with the patient.
                    </p>
                    <Textarea
                      placeholder="Enter your private notes about this patient..."
                      className="min-h-32"
                      value={patientComments}
                      onChange={(e) => setPatientComments(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant="outline"
                onClick={() => setDetailDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveComments}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocAppointments;
