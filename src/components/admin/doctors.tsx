import { Calendar, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ProfileImageUploader from "@/components/ProfileImageUploader";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define types based on Prisma schema
interface Doctor {
  id: string;
  specialization: string;
  appointments?: Array<Appointment>;
  appointmentCount?: number;
  name: string;
  email: string;
  image?: string | null;
  location?: string | null;
}

interface DoctorRequest {
  name: string;
  email: string;
  specialization: string;
  password?: string;
  image?: string;
  location?: string;
}

interface Appointment {
  id: string;
  dateTime: Date | string | null;
  condition: string | null;
  status: "NEW" | "PENDING" | "COMPLETED" | "CANCELED";
  patient: {
    id: string;
    name: string | null;
    user: {
      name: string | null;
    } | null;
  };
}

interface AppointmentViewProps {
  doctor: Doctor;
}

// Appointment view component now uses doctor prop with pre-fetched appointments
const AppointmentView: React.FC<AppointmentViewProps> = ({ doctor }) => {
  const appointments = doctor.appointments || [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Appointments for {doctor.name}
      </h2>

      {appointments.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p>No appointments scheduled for this doctor.</p>
        </div>
      ) : (
        <div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Patient Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date & Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Condition
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {appointment.patient?.user?.name ||
                      appointment.patient?.name ||
                      "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.dateTime
                      ? new Date(appointment.dateTime).toLocaleString()
                      : "Not scheduled"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.condition || "Not specified"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Doctor form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formSpecialization, setFormSpecialization] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formImage, setFormImage] = useState("");

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/doctors");
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = await response.json();

      const doctors = data;
      const doctorsWithCount = doctors.map((doctor: Doctor) => ({
        ...doctor,
        appointmentCount: doctor.appointments?.length || 0,
      }));

      setDoctors(doctorsWithCount);
      setFilteredDoctors(doctorsWithCount);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Error", {
        description: "Failed to fetch doctors. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch doctors from API
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(term) ||
          doctor.email.toLowerCase().includes(term) ||
          doctor.specialization.toLowerCase().includes(term) ||
          doctor.location?.toLowerCase().includes(term),
      );
      setFilteredDoctors(filtered);
    }
  };

  // Add doctor
  const handleAddDoctor = () => {
    // Reset form
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormSpecialization("");
    setFormLocation("");
    setFormImage("");
    setIsAddDialogOpen(true);
  };

  // Submit new doctor
  const submitNewDoctor = async () => {
    if (!formName || !formEmail || !formPassword || !formSpecialization) {
      toast.error("Missing fields", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const doctorData: DoctorRequest = {
        name: formName,
        email: formEmail,
        password: formPassword,
        specialization: formSpecialization,
      };

      // Only add optional fields if they have values
      if (formLocation) doctorData.location = formLocation;
      if (formImage) doctorData.image = formImage;

      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add doctor");
      }

      await fetchDoctors();
      setIsAddDialogOpen(false);
      toast.success("Success", {
        description: "Doctor added successfully",
      });
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to add doctor",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit doctor
  const handleEditDoctor = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setFormName(doctor.name);
    setFormEmail(doctor.email);
    setFormPassword(""); // Don't populate password for security
    setFormSpecialization(doctor.specialization);
    setFormLocation(doctor.location || "");
    setFormImage(doctor.image || "");
    setIsEditDialogOpen(true);
  };

  // Submit edited doctor
  const submitEditedDoctor = async () => {
    if (!currentDoctor || !formName || !formEmail || !formSpecialization) {
      toast.error("Missing fields", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody: DoctorRequest = {
        name: formName,
        email: formEmail,
        specialization: formSpecialization,
        location: formLocation || undefined,
        image: formImage || undefined,
      };

      // Only include password if it was changed
      if (formPassword) {
        requestBody.password = formPassword;
      }

      // Changed from PATCH to PUT to match your API route
      const response = await fetch(`/api/doctors/${currentDoctor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update doctor");
      }

      await fetchDoctors();
      setIsEditDialogOpen(false);
      toast.success("Success", {
        description: "Doctor updated successfully",
      });
    } catch (error) {
      console.error("Error updating doctor:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to update doctor",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete doctor
  const handleDeleteClick = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentDoctor) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/doctors/${currentDoctor.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete doctor");
      }

      await fetchDoctors();
      setIsDeleteDialogOpen(false);
      toast.success("Success", {
        description: "Doctor deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete doctor",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // View appointments
  const handleViewAppointments = async (doctor: Doctor) => {
    setIsSubmitting(true);
    try {
      // Fetch detailed doctor info including appointments
      const response = await fetch(`/api/doctors/${doctor.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctor appointments");
      }
      const doctorWithAppointments = await response.json();

      setCurrentDoctor(doctorWithAppointments);
      setIsAppointmentDialogOpen(true);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error", {
        description: "Failed to fetch doctor appointments",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center flex-1">
          <Search className="mr-2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={handleSearch}
            className="grow"
          />
        </div>

        <Button
          onClick={handleAddDoctor}
          className="flex items-center bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Doctor
        </Button>

        <Link href="/docs">
          <Button className="bg-blue-600 text-white text-lg hover:bg-blue-700">
            Doctor Dashboard
          </Button>
        </Link>
      </div>

      {/* Doctors Table */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>List of all registered doctors</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-gray-500"
                >
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    {doctor.image ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={doctor.image}
                          alt={`Dr. ${doctor.name}`}
                          height={40}
                          width={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs font-medium">
                          {doctor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.location || "-"}</TableCell>
                  <TableCell>{doctor.appointmentCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAppointments(doctor)}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDoctor(doctor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteClick(doctor)}
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

      {/* Add Doctor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Enter the doctor&apos;s details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
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
                Email
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
                Password
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
              <Label htmlFor="specialization" className="text-right">
                Specialization
              </Label>
              <Input
                id="specialization"
                value={formSpecialization}
                onChange={(e) => setFormSpecialization(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Profile Image
              </Label>
              <div className="col-span-3">
                <ProfileImageUploader
                  currentImageUrl={formImage}
                  onImageUploaded={(url) => setFormImage(url)}
                />
              </div>
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
              onClick={submitNewDoctor}
              disabled={
                isSubmitting ||
                !formName ||
                !formEmail ||
                !formPassword ||
                !formSpecialization
              }
            >
              {isSubmitting ? "Adding..." : "Add Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update the doctor&apos;s details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
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
                Email
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
                placeholder="Leave blank to keep current password"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-specialization" className="text-right">
                Specialization
              </Label>
              <Input
                id="edit-specialization"
                value={formSpecialization}
                onChange={(e) => setFormSpecialization(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Input
                id="edit-location"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">
                Profile Image
              </Label>
              <div className="col-span-3">
                <ProfileImageUploader
                  currentImageUrl={formImage}
                  onImageUploaded={(url) => setFormImage(url)}
                />
              </div>
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
              onClick={submitEditedDoctor}
              disabled={
                isSubmitting || !formName || !formEmail || !formSpecialization
              }
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
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
              This will permanently delete {currentDoctor?.name}&apos;s record
              and might affect appointments. This action cannot be undone.
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
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Appointments Dialog */}
      <Dialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Doctor&apos;s Appointments</DialogTitle>
            <DialogDescription>
              Viewing all appointments for {currentDoctor?.name}
            </DialogDescription>
          </DialogHeader>

          {currentDoctor && (
            <div className="py-2">
              <AppointmentView doctor={currentDoctor} />
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

export default AdminDoctors;
