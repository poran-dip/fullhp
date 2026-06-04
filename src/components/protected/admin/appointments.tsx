"use client";

import { format, set } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AppointmentStatus =
  | "Requested"
  | "DoctorAssigned"
  | "Completed"
  | "Cancelled"
  | "Emergency";

interface Appointment {
  id: string;
  time: Date;
  status: AppointmentStatus;
  condition: string | null;
  department: string | null;
  patient: { id: string; user: { name: string | null } };
  doctor: {
    id: string;
    specialization: string;
    department: string;
    user: { name: string | null };
  } | null;
  driver: { id: string; user: { name: string | null } } | null;
}

interface Patient {
  id: string;
  phoneNo: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface Doctor {
  id: string;
  specialization: string;
  department: string;
  user: { name: string | null };
}

interface Props {
  initialAppointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  error: string | null;
  defaultPatientId?: string | undefined;
  defaultDoctorId?: string | undefined;
}

const STATUSES: AppointmentStatus[] = [
  "Requested",
  "DoctorAssigned",
  "Completed",
  "Cancelled",
  "Emergency",
];

const statusColors: Record<AppointmentStatus, string> = {
  Requested: "bg-blue-100 text-blue-800",
  DoctorAssigned: "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Emergency: "bg-orange-100 text-orange-800",
};

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
    .toString()
    .padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const emptyForm = {
  patientId: "",
  doctorId: "",
  date: undefined as Date | undefined,
  time: "",
  condition: "",
  department: "",
  status: "Requested" as AppointmentStatus,
};

const PER_PAGE = 50;

export default function AppointmentsTable({
  initialAppointments,
  patients,
  doctors,
  error,
  defaultPatientId,
  defaultDoctorId,
}: Props) {
  const router = useRouter();
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<Appointment | null>(null);
  const [form, setForm] = useState(emptyForm);

  const field = <K extends keyof typeof emptyForm>(
    k: K,
    v: (typeof emptyForm)[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.patient.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.condition?.toLowerCase().includes(search.toLowerCase()) ||
      a.department?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => {
    setForm({
      ...emptyForm,
      patientId: defaultPatientId ?? "",
      doctorId: defaultDoctorId ?? "",
    });
    setAddOpen(true);
  };

  const openEdit = (a: Appointment) => {
    setCurrent(a);
    setForm({
      patientId: a.patient.id,
      doctorId: a.doctor?.id ?? "",
      date: new Date(a.time),
      time: format(new Date(a.time), "HH:mm"),
      condition: a.condition ?? "",
      department: a.department ?? "",
      status: a.status,
    });
    setEditOpen(true);
  };

  const openDelete = (a: Appointment) => {
    setCurrent(a);
    setDeleteOpen(true);
  };

  const buildDateTime = () => {
    if (!form.date || !form.time) return null;
    const [hours, minutes] = form.time.split(":").map(Number) as [
      number,
      number,
    ];
    return set(form.date, { hours, minutes });
  };

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId,
          doctorId: form.doctorId || null,
          time: buildDateTime(),
          condition: form.condition || null,
          department: form.department || null,
          status: form.status,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Appointment created");
      setAddOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!current) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId,
          doctorId: form.doctorId || null,
          time: buildDateTime(),
          condition: form.condition || null,
          department: form.department || null,
          status: form.status,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Appointment updated");
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${current.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setAppointments((prev) => prev.filter((a) => a.id !== current.id));
      toast.success("Appointment deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const appointmentForm = (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Patient *</Label>
        <div className="col-span-3">
          <Combobox
            items={patients}
            itemToStringValue={(p) =>
              [p.user.name, p.user.email, p.phoneNo].filter(Boolean).join(" ")
            }
            value={patients.find((p) => p.id === form.patientId) ?? null}
            onValueChange={(p) => field("patientId", p?.id ?? "")}
          >
            <ComboboxInput placeholder="Search by name, email or phone..." />
            <ComboboxContent>
              <ComboboxEmpty>No patients found.</ComboboxEmpty>
              <ComboboxList>
                {(p) => (
                  <ComboboxItem key={p.id} value={p}>
                    <div className="flex flex-col">
                      <span>{p.user.name ?? p.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.user.email} · {p.phoneNo}
                      </span>
                    </div>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Doctor</Label>
        <div className="col-span-3">
          <Combobox
            items={doctors.filter(
              (d) => !form.department || d.department === form.department,
            )}
            itemToStringValue={(d) =>
              [d.user.name, d.specialization, d.department]
                .filter(Boolean)
                .join(" ")
            }
            value={doctors.find((d) => d.id === form.doctorId) ?? null}
            onValueChange={(d) => {
              field("doctorId", d?.id ?? "");
              if (d) field("department", d.department);
            }}
          >
            <ComboboxInput placeholder="Search by name or specialization..." />
            <ComboboxContent>
              <ComboboxEmpty>No doctors found.</ComboboxEmpty>
              <ComboboxList>
                {(d) => (
                  <ComboboxItem key={d.id} value={d}>
                    <div className="flex flex-col">
                      <span>{d.user.name ?? d.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {d.specialization} · {d.department}
                      </span>
                    </div>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Date</Label>
        <div className="col-span-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.date ? format(form.date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.date}
                onSelect={(d) => field("date", d)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Time</Label>
        <div className="col-span-3">
          <Select
            value={form.time}
            onValueChange={(v) => field("time", v)}
            disabled={!form.date}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Condition</Label>
        <Input
          value={form.condition}
          onChange={(e) => field("condition", e.target.value)}
          className="col-span-3"
          placeholder="Patient's condition"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Department</Label>
        <Input
          value={form.department}
          onChange={(e) => field("department", e.target.value)}
          className="col-span-3"
          placeholder="e.g. Cardiology"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Status</Label>
        <div className="col-span-3">
          <Select
            value={form.status}
            onValueChange={(v) => field("status", v as AppointmentStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  if (error) return <p className="text-destructive text-sm">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {(defaultPatientId || defaultDoctorId) && (
        <p className="text-sm text-muted-foreground">
          Filtered by {defaultPatientId ? "patient" : "doctor"} —{" "}
          <button
            type="button"
            className="underline"
            onClick={() => router.push("/admin/appointments")}
          >
            clear filter
          </button>
        </p>
      )}

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
            appointments
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.patient.user.name ?? "—"}
                  </TableCell>
                  <TableCell>{a.doctor?.user.name ?? "Unassigned"}</TableCell>
                  <TableCell>
                    {format(new Date(a.time), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>{a.condition ?? "—"}</TableCell>
                  <TableCell>{a.department ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(a)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDelete(a)}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Schedule a new appointment</DialogDescription>
          </DialogHeader>
          {appointmentForm}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleAdd}
              disabled={submitting || !form.patientId}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details</DialogDescription>
          </DialogHeader>
          {appointmentForm}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleEdit}
              disabled={submitting || !form.patientId}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the appointment for{" "}
              {current?.patient.user.name}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
