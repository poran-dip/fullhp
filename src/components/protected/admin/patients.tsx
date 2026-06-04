"use client";

import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
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

interface Patient {
  id: string;
  age: number;
  gender: string;
  phoneNo: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface Props {
  initialPatients: Patient[];
  error: string | null;
}

const emptyForm = { name: "", email: "", gender: "", dob: "", phoneNo: "" };

export default function PatientsTable({ initialPatients, error }: Props) {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 50;
  const [submitting, setSubmitting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<Patient | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = patients.filter(
    (p) =>
      p.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user.email?.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const field = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const openEdit = (p: Patient) => {
    setCurrent(p);
    setForm({
      name: p.user.name ?? "",
      email: p.user.email ?? "",
      gender: p.gender,
      dob: "",
      phoneNo: p.phoneNo,
    });
    setEditOpen(true);
  };

  const openDelete = (p: Patient) => {
    setCurrent(p);
    setDeleteOpen(true);
  };

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Patient created");
      setAddOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!current) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Patient updated");
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${current.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setPatients((prev) => prev.filter((p) => p.id !== current.id));
      toast.success("Patient deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete patient");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
            patients
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.user.name ?? "—"}
                  </TableCell>
                  <TableCell>{p.user.email ?? "—"}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>{p.gender}</TableCell>
                  <TableCell>{p.phoneNo}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/appointments?patientId=${p.id}`}>
                          Appointments
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDelete(p)}
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
            <DialogTitle>Add Patient</DialogTitle>
            <DialogDescription>Create a new patient account</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(["name", "email", "phoneNo"] as const).map((k) => (
              <div key={k} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right capitalize">
                  {k === "phoneNo" ? "Phone" : k}
                </Label>
                <Input
                  value={form[k]}
                  onChange={(e) => field(k, e.target.value)}
                  className="col-span-3"
                  type={k === "email" ? "email" : "text"}
                />
              </div>
            ))}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">DOB</Label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => field("dob", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Gender</Label>
              <RadioGroup
                value={form.gender}
                onValueChange={(v) => field("gender", v)}
                className="col-span-3 flex gap-4"
              >
                {["Male", "Female", "Other"].map((g) => (
                  <div key={g} className="flex items-center space-x-2">
                    <RadioGroupItem value={g} id={`add-${g}`} />
                    <Label htmlFor={`add-${g}`}>{g}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleAdd}
              disabled={
                submitting ||
                !form.name ||
                !form.email ||
                !form.dob ||
                !form.phoneNo
              }
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Patient"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update patient details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(["name", "email", "phoneNo"] as const).map((k) => (
              <div key={k} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right capitalize">
                  {k === "phoneNo" ? "Phone" : k}
                </Label>
                <Input
                  value={form[k]}
                  onChange={(e) => field(k, e.target.value)}
                  className="col-span-3"
                  type={k === "email" ? "email" : "text"}
                />
              </div>
            ))}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Gender</Label>
              <RadioGroup
                value={form.gender}
                onValueChange={(v) => field("gender", v)}
                className="col-span-3 flex gap-4"
              >
                {["Male", "Female", "Other"].map((g) => (
                  <div key={g} className="flex items-center space-x-2">
                    <RadioGroupItem value={g} id={`edit-${g}`} />
                    <Label htmlFor={`edit-${g}`}>{g}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleEdit}
              disabled={submitting || !form.name || !form.email}
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
            <AlertDialogTitle>Delete patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {current?.user.name}&apos;s record
              and all associated data. This cannot be undone.
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
