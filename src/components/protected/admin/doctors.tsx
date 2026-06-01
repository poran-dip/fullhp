"use client";

import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Doctor {
  id: string;
  specialization: string;
  department: string;
  status: string;
  phoneNo: string;
  avgRating: number | null;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  _count: { appointments: number };
}

interface Props {
  initialDoctors: Doctor[];
  error: string | null;
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  specialization: "",
  department: "",
  phoneNo: "",
  image: "",
};

// Crop helpers
async function getCroppedBlob(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  // biome-ignore lint: canvas exists
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject()), "image/jpeg"),
  );
}

function ImageCropper({
  onDone,
  onCancel,
}: {
  onDone: (url: string) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback(
    (
      _: unknown,
      pixels: { x: number; y: number; width: number; height: number },
    ) => {
      setCroppedAreaPixels(pixels);
    },
    [],
  );

  const handleUpload = async () => {
    if (!src || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      onDone(url);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (!src) {
    return (
      <div className="space-y-2">
        <Input type="file" accept="image/*" onChange={onFileChange} />
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full h-56 bg-black rounded overflow-hidden">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <input
        type="range"
        min={1}
        max={3}
        step={0.01}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleUpload} disabled={uploading}>
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Use Photo"
          )}
        </Button>
      </div>
    </div>
  );
}

const PER_PAGE = 50;

export default function DoctorsTable({ initialDoctors, error }: Props) {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [current, setCurrent] = useState<Doctor | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = doctors.filter(
    (d) =>
      d.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.user.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const field = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const openEdit = (d: Doctor) => {
    setCurrent(d);
    setForm({
      name: d.user.name ?? "",
      email: d.user.email ?? "",
      password: "",
      specialization: d.specialization,
      department: d.department,
      phoneNo: d.phoneNo,
      image: d.user.image ?? "",
    });
    setEditOpen(true);
  };

  const openDelete = (d: Doctor) => {
    setCurrent(d);
    setDeleteOpen(true);
  };

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Doctor added");
      setAddOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to add doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!current) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/doctors/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Doctor updated");
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/doctors/${current.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setDoctors((prev) => prev.filter((d) => d.id !== current.id));
      toast.success("Doctor deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = [
    { key: "name", label: "Name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "password", label: "Password", type: "password" },
    { key: "specialization", label: "Specialization", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "phoneNo", label: "Phone", type: "text" },
  ] as const;

  const editFields = [
    { key: "name", label: "Name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "specialization", label: "Specialization", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "phoneNo", label: "Phone", type: "text" },
    { key: "password", label: "Password", type: "password" },
  ] as const;

  if (error) return <p className="text-destructive text-sm">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors..."
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
          Add Doctor
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}{" "}
            doctors
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Appts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    {d.user.image ? (
                      <Image
                        src={d.user.image}
                        alt={d.user.name ?? "Doctor"}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {d.user.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {d.user.name ?? "—"}
                  </TableCell>
                  <TableCell>{d.user.email ?? "—"}</TableCell>
                  <TableCell>{d.specialization}</TableCell>
                  <TableCell>{d.department}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  <TableCell>{d._count.appointments}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/appointments?doctorId=${d.id}`}>
                          Appointments
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(d)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDelete(d)}
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
            <DialogTitle>Add Doctor</DialogTitle>
            <DialogDescription>Create a new doctor account</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {formFields.map(({ key, label, type }) => (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => field(key, e.target.value)}
                  className="col-span-3"
                  type={type}
                  placeholder={key === "password" ? "Required" : ""}
                />
              </div>
            ))}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Photo</Label>
              <div className="col-span-3">
                {form.image ? (
                  <div className="flex items-center gap-3">
                    <Image
                      src={form.image}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        field("image", "");
                        setCropperOpen(true);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : cropperOpen ? (
                  <ImageCropper
                    onDone={(url) => {
                      field("image", url);
                      setCropperOpen(false);
                    }}
                    onCancel={() => setCropperOpen(false)}
                  />
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCropperOpen(true)}
                  >
                    Upload Photo
                  </Button>
                )}
              </div>
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
                !form.password ||
                !form.specialization ||
                !form.department ||
                !form.phoneNo
              }
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Doctor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>Update doctor details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editFields.map(({ key, label, type }) => (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => field(key, e.target.value)}
                  className="col-span-3"
                  type={type}
                  placeholder={
                    key === "password" ? "Leave blank to keep current" : ""
                  }
                />
              </div>
            ))}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Photo</Label>
              <div className="col-span-3">
                {form.image ? (
                  <div className="flex items-center gap-3">
                    <Image
                      src={form.image}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        field("image", "");
                        setCropperOpen(true);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : cropperOpen ? (
                  <ImageCropper
                    onDone={(url) => {
                      field("image", url);
                      setCropperOpen(false);
                    }}
                    onCancel={() => setCropperOpen(false)}
                  />
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCropperOpen(true)}
                  >
                    Upload Photo
                  </Button>
                )}
              </div>
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
              disabled={
                submitting ||
                !form.name ||
                !form.email ||
                !form.specialization ||
                !form.department ||
                !form.phoneNo
              }
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
            <AlertDialogTitle>Delete doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {current?.user.name}&apos;s record
              and may affect existing appointments. This cannot be undone.
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
