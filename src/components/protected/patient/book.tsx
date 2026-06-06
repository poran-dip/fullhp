"use client";

import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Clock,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { BookingDoctor } from "@/services/book-appointment";

// ─── constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Hematology",
  "Nephrology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
];

function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

// ─── combobox ─────────────────────────────────────────────────────────────────

function Combobox({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
}: {
  options: { value: string; label: string; sub?: string }[];
  value: string;
  onSelect: (v: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? (
              <span>
                {selected.label}
                {selected.sub && (
                  <span className="text-muted-foreground ml-1 text-xs">
                    — {selected.sub}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label + (o.sub ?? "")}
                  onSelect={() => {
                    onSelect(o.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === o.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span>
                    {o.label}
                    {o.sub && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        — {o.sub}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

interface Props {
  doctors: BookingDoctor[];
  preselectedDoctor: BookingDoctor | null;
  error: string | null;
}

export default function BookAppointment({
  doctors,
  preselectedDoctor,
  error,
}: Props) {
  const router = useRouter();
  const { apiFetch } = useApi();

  const [department, setDepartment] = useState(
    preselectedDoctor?.department ?? "",
  );
  const [doctorId, setDoctorId] = useState(preselectedDoctor?.id ?? "");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [condition, setCondition] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // filter doctors by selected department
  const filteredDoctors = useMemo(
    () =>
      department ? doctors.filter((d) => d.department === department) : doctors,
    [doctors, department],
  );

  const departmentOptions = DEPARTMENTS.map((d) => ({ value: d, label: d }));

  const doctorOptions = filteredDoctors.map((d) => ({
    value: d.id,
    label: d.name ?? "Unknown",
    sub: d.specialization,
  }));

  const handleDepartmentSelect = (val: string) => {
    setDepartment(val);
    // clear doctor if they're no longer in new department
    if (doctorId) {
      const still = doctors.find(
        (d) => d.id === doctorId && d.department === val,
      );
      if (!still) setDoctorId("");
    }
  };

  const handleSubmit = async () => {
    if (!department) {
      toast.error("Please select a department");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (!time) {
      toast.error("Please select a time");
      return;
    }

    const [hours, minutes] = time.split(":");
    if (!hours || !minutes) {
      toast.error("Please select a time");
      return;
    }

    const appointmentTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      parseInt(hours, 10),
      parseInt(minutes, 10),
    );

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(doctorId && { doctorId }),
          department,
          condition: condition || undefined,
          time: appointmentTime.toISOString(),
          status: "Requested",
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Appointment requested");
      router.push(`/patient/appointments`);
    } catch {
      toast.error("Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div>
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
        <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
        <p className="text-muted-foreground">
          Select a department and time. A doctor will be assigned if you
          don&apos;t have a preference.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Department */}
          <div className="space-y-2">
            <Label>Department *</Label>
            <Combobox
              options={departmentOptions}
              value={department}
              onSelect={handleDepartmentSelect}
              placeholder="Select a department"
              searchPlaceholder="Search departments..."
              emptyText="No department found."
            />
          </div>

          {/* Doctor (optional) */}
          <div className="space-y-2">
            <Label>
              Doctor{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional — admin will assign if left blank)
              </span>
            </Label>
            <Combobox
              options={doctorOptions}
              value={doctorId}
              onSelect={setDoctorId}
              placeholder={
                department
                  ? filteredDoctors.length === 0
                    ? "No active doctors in this department"
                    : "Select a doctor"
                  : "Select a department first"
              }
              searchPlaceholder="Search doctors..."
              emptyText="No doctors found."
              disabled={!department || filteredDoctors.length === 0}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label>Time *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !time && "text-muted-foreground",
                  )}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {time || "Select a time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
                <div className="grid grid-cols-4 gap-1 max-h-60 overflow-y-auto">
                  {TIME_SLOTS.map((slot) => (
                    <Button
                      key={slot}
                      variant={time === slot ? "default" : "ghost"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label>
              Condition{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder="Briefly describe your condition or reason for visit..."
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || !department || !date || !time}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Request Appointment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
