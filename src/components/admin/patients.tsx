import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UpdatedData {
  name: string;
  email: string;
  gender?: string | null;
  age?: number | null;
  password?: string;
}

// Define types based on Prisma schema
interface Patient {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  gender?: string | null;
  appointments?: Appointment[];
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string | null;
  dateTime?: Date | null;
  condition?: string | null;
  specialization?: string | null;
  status: "NEW" | "PENDING" | "COMPLETED" | "CANCELED";
  doctor?: {
    name: string;
    email: string;
    specialization?: string | null;
  } | null;
}

interface AppointmentViewProps {
  patientId: string;
  patientName: string;
  appointments: Appointment[];
  isLoading: boolean;
}

// Appointment view component
const AppointmentView: React.FC<AppointmentViewProps> = ({
  patientName,
  appointments,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        Appointments for {patientName}
      </h3>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments found for this patient.</p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {appointment.dateTime
                      ? format(new Date(appointment.dateTime), "PPp")
                      : "Not scheduled"}
                  </TableCell>
                  <TableCell>
                    {appointment.doctor
                      ? appointment.doctor.name
                      : "Unassigned"}
                  </TableCell>
                  <TableCell>
                    {appointment.condition || "Not specified"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                      ${appointment.status === "NEW" ? "bg-blue-100 text-blue-800" : ""}
                      ${appointment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${appointment.status === "COMPLETED" ? "bg-green-100 text-green-800" : ""}
                      ${appointment.status === "CANCELED" ? "bg-red-100 text-red-800" : ""}
                    `}
                    >
                      {appointment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Patient form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>(
    [],
  );
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formGender, setFormGender] = useState("");
  const [formAge, setFormAge] = useState("");

  // Fetch all patients from API
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/patients", { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      const data = await response.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Error", {
        description: "Failed to load patient data",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all patients on component mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(term) ||
          patient.email.toLowerCase().includes(term),
      );
      setFilteredPatients(filtered);
    }
  };

  // Add patient
  const handleAddPatient = () => {
    // Reset form
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormGender("");
    setFormAge("");
    setIsAddDialogOpen(true);
  };

  // Submit new patient
  const submitNewPatient = async () => {
    if (!formName || !formEmail || !formPassword) {
      toast.error("Requiured Fields", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          gender: formGender || null,
          age: formAge ? parseInt(formAge, 10) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create patient");
      }

      const newPatient = await response.json();

      // Update local state
      setPatients((prev) => [...prev, newPatient]);
      setFilteredPatients((prev) => [...prev, newPatient]);

      toast.success("Success", {
        description: "Patient created successfully",
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error creating patient:", error);
      toast.error("Error", {
        description: "Failed to create patient",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit patient
  const handleEditPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    setFormName(patient.name);
    setFormEmail(patient.email);
    setFormPassword(""); // Don't populate password for security
    setFormGender(patient.gender || "");
    setFormAge(patient.age?.toString() || "");
    setIsEditDialogOpen(true);
  };

  // Submit edited patient
  const submitEditedPatient = async () => {
    if (!currentPatient || !formName || !formEmail) {
      toast.error("Required Fields", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedData: UpdatedData = {
        name: formName,
        email: formEmail,
        gender: formGender || null,
        age: formAge ? parseInt(formAge, 10) : null,
      };

      // Only include password if it was changed
      if (formPassword) {
        updatedData.password = formPassword;
      }

      const response = await fetch(`/api/patients/${currentPatient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update patient");
      }

      const updatedPatient = await response.json();

      // Update local state
      setPatients((prev) =>
        prev.map((p) => (p.id === currentPatient.id ? updatedPatient : p)),
      );
      setFilteredPatients((prev) =>
        prev.map((p) => (p.id === currentPatient.id ? updatedPatient : p)),
      );

      toast.success("Success", {
        description: "Patient updated successfully",
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Error", {
        description: "Failed to update patient",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete patient
  const handleDeleteClick = (patient: Patient) => {
    setCurrentPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentPatient) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/patients/${currentPatient.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }

      // Update local state
      setPatients((prev) => prev.filter((p) => p.id !== currentPatient.id));
      setFilteredPatients((prev) =>
        prev.filter((p) => p.id !== currentPatient.id),
      );

      toast.success("Success", {
        description: "Patient deleted successfully",
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Error", {
        description: "Failed to delete patient",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // View appointments
  const handleViewAppointments = async (patient: Patient) => {
    setCurrentPatient(patient);
    setIsAppointmentDialogOpen(true);

    // Fetch appointments for this patient
    setIsLoadingAppointments(true);
    try {
      const response = await fetch(`/api/appointments?patientId=${patient.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setPatientAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error", {
        description: "Failed to load appointment data",
      });
      setPatientAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center flex-1">
          <Search className="mr-2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={handleSearch}
            className="grow"
          />
        </div>

        <Button
          onClick={handleAddPatient}
          className="flex items-center bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Patient
        </Button>

        <Link href="/patient">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            Patient Dashboard
          </Button>
        </Link>
      </div>

      {/* Patients Table */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>List of all registered patients</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.age || "-"}</TableCell>
                  <TableCell>{patient.gender || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAppointments(patient)}
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPatient(patient)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteClick(patient)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Gender</Label>
              <RadioGroup
                value={formGender}
                onValueChange={setFormGender}
                className="col-span-3 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                className="col-span-3"
                min={0}
                max={120}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={submitNewPatient}
              disabled={
                isSubmitting || !formName || !formEmail || !formPassword
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Patient"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Update the patient details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email *
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Password
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="col-span-3"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Gender</Label>
              <RadioGroup
                value={formGender}
                onValueChange={setFormGender}
                className="col-span-3 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="edit-male" />
                  <Label htmlFor="edit-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="edit-female" />
                  <Label htmlFor="edit-female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="edit-other" />
                  <Label htmlFor="edit-other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-age" className="text-right">
                Age
              </Label>
              <Input
                id="edit-age"
                type="number"
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                className="col-span-3"
                min={0}
                max={120}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={submitEditedPatient}
              disabled={isSubmitting || !formName || !formEmail}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {currentPatient?.name}&apos;s record
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Appointments Dialog */}
      <Dialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Patient Appointments</DialogTitle>
            <DialogDescription>
              Viewing all appointments for {currentPatient?.name}
            </DialogDescription>
          </DialogHeader>

          {currentPatient && (
            <div className="py-2">
              <AppointmentView
                patientId={currentPatient.id}
                patientName={currentPatient.name}
                appointments={patientAppointments}
                isLoading={isLoadingAppointments}
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPatients;
