"use client";

import { format, isAfter, isToday, parseISO } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  Clock,
  MoreHorizontal,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AppointmentItem } from "@/services/patient-appointments";

interface Props {
  appointments: AppointmentItem[];
  error: string | null;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return format(parseISO(iso), "MMMM d, yyyy");
}

function formatTime(iso: string) {
  return format(parseISO(iso), "h:mm a");
}

function initials(name: string | null) {
  if (!name) return "DR";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Completed":
      return <Badge variant="secondary">Completed</Badge>;
    case "Cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "Emergency":
      return <Badge className="bg-red-500">Emergency</Badge>;
    case "DoctorAssigned":
      return <Badge className="bg-blue-500">Doctor Assigned</Badge>;
    default:
      return <Badge variant="outline">Requested</Badge>;
  }
}

// ─── star rating display ─────────────────────────────────────────────────────

function StarDisplay({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i <= stars
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

// ─── rating dialog ────────────────────────────────────────────────────────────

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  doctorName: string | null;
  doctorId: string;
  appointmentId: string;
  existing: { stars: number; comment: string | null } | null;
  onSuccess: (doctorId: string, stars: number, comment: string) => void;
  onDelete: (doctorId: string) => void;
}

function RatingDialog({
  open,
  onOpenChange,
  doctorName,
  doctorId,
  appointmentId,
  existing,
  onSuccess,
  onDelete,
}: RatingDialogProps) {
  const { apiFetch } = useApi();

  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isEdit = existing !== null;

  const handleSubmit = async () => {
    if (stars === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/ratings", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, appointmentId, stars, comment }),
      });
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Rating updated" : "Rating submitted");
      onSuccess(doctorId, stars, comment);
      onOpenChange(false);
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/ratings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Rating removed");
      onDelete(doctorId);
      onOpenChange(false);
    } catch {
      toast.error("Failed to remove rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Rating" : "Rate Doctor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update your rating for" : "How was your experience with"}{" "}
            <span className="font-medium text-foreground">
              {doctorName ?? "your doctor"}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStars(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      i <= (hovered || stars)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-none text-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEdit && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
              className="sm:mr-auto"
            >
              Remove
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="secondary" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitting || stars === 0}>
            {isEdit ? "Update" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── appointment card ─────────────────────────────────────────────────────────

interface CardProps {
  appointment: AppointmentItem;
  onRateClick: (appointment: AppointmentItem) => void;
}

function AppointmentCard({ appointment, onRateClick }: CardProps) {
  const isCompleted = appointment.status === "Completed";
  const hasDoctor = appointment.doctor !== null;
  const canRate = isCompleted && hasDoctor;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {initials(appointment.doctor?.name ?? null)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">
                {appointment.doctor?.name ?? "Doctor TBA"}
              </p>
              <StatusBadge status={appointment.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {appointment.doctor?.specialization ??
                appointment.department ??
                "General Consultation"}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(appointment.time)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(appointment.time)}</span>
              </div>
            </div>
            {appointment.condition && (
              <p className="text-sm">
                <span className="font-medium">Condition:</span>{" "}
                {appointment.condition}
              </p>
            )}
            {appointment.doctorComments && (
              <p className="text-sm">
                <span className="font-medium">Doctor&apos;s notes:</span>{" "}
                {appointment.doctorComments}
              </p>
            )}
            {canRate && appointment.existingRating && (
              <div className="flex items-center gap-2 pt-1">
                <StarDisplay stars={appointment.existingRating.stars} />
                {appointment.existingRating.comment && (
                  <span className="text-xs text-muted-foreground truncate max-w-xs">
                    &ldquo;{appointment.existingRating.comment}&rdquo;
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {canRate && (
              <Button
                size="sm"
                variant={appointment.existingRating ? "secondary" : "outline"}
                onClick={() => onRateClick(appointment)}
              >
                <Star className="h-4 w-4 mr-1" />
                {appointment.existingRating ? "Edit Rating" : "Rate"}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isCompleted ? (
                  <>
                    <DropdownMenuItem>View Medical Notes</DropdownMenuItem>
                    <DropdownMenuItem>Book Follow-up</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Cancel Appointment
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AppointmentsList({
  appointments: initial,
  error,
}: Props) {
  const [appointments, setAppointments] = useState(initial);
  const [date, setDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingTarget, setRatingTarget] = useState<AppointmentItem | null>(
    null,
  );

  const now = new Date();

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return appointments.filter((a) => {
      if (date) {
        const d = parseISO(a.time);
        if (
          d.getFullYear() !== date.getFullYear() ||
          d.getMonth() !== date.getMonth() ||
          d.getDate() !== date.getDate()
        ) {
          return false;
        }
      }
      if (!q) return true;
      return (
        (a.doctor?.name ?? "").toLowerCase().includes(q) ||
        (a.doctor?.specialization ?? "").toLowerCase().includes(q) ||
        (a.condition ?? "").toLowerCase().includes(q) ||
        (a.department ?? "").toLowerCase().includes(q)
      );
    });
  }, [appointments, date, searchQuery]);

  const upcoming = useMemo(
    () =>
      filtered
        .filter((a) => {
          const d = parseISO(a.time);
          return (
            a.status !== "Completed" &&
            a.status !== "Cancelled" &&
            (isToday(d) || isAfter(d, now))
          );
        })
        .sort(
          (a, b) => parseISO(a.time).getTime() - parseISO(b.time).getTime(),
        ),
    [filtered, now],
  );

  const past = useMemo(
    () =>
      filtered
        .filter(
          (a) =>
            a.status === "Completed" ||
            a.status === "Cancelled" ||
            !isAfter(parseISO(a.time), now),
        )
        .sort(
          (a, b) => parseISO(b.time).getTime() - parseISO(a.time).getTime(),
        ),
    [filtered, now],
  );

  const handleRatingSuccess = (
    doctorId: string,
    stars: number,
    comment: string,
  ) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.doctor?.id === doctorId
          ? { ...a, existingRating: { stars, comment } }
          : a,
      ),
    );
  };

  const handleRatingDelete = (doctorId: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.doctor?.id === doctorId ? { ...a, existingRating: null } : a,
      ),
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your upcoming and past appointments.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming and past appointments.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-60",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
          {date && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDate(undefined)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Clear date</span>
            </Button>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search appointments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No upcoming appointments</p>
                <p className="text-sm text-muted-foreground mb-4">
                  You don&apos;t have any upcoming appointments scheduled.
                </p>
                <Button asChild>
                  <Link href="/patient/book">Book an Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcoming.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onRateClick={setRatingTarget}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {past.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No past appointments</p>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any past appointments on record.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {past.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onRateClick={setRatingTarget}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {ratingTarget?.doctor && (
        <RatingDialog
          open={ratingTarget !== null}
          onOpenChange={(v) => {
            if (!v) setRatingTarget(null);
          }}
          doctorName={ratingTarget.doctor.name}
          doctorId={ratingTarget.doctor.id}
          appointmentId={ratingTarget.id}
          existing={ratingTarget.existingRating}
          onSuccess={handleRatingSuccess}
          onDelete={handleRatingDelete}
        />
      )}
    </div>
  );
}
