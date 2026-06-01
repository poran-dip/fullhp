"use client";

import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { PatientProfile } from "@/services/patient-profile";

interface Props {
  profile: PatientProfile | null;
  error: string | null;
}

// ─── custom dob calendar (year/month navigation) ──────────────────────────────

function DobCalendar({
  selected,
  onSelect,
}: {
  selected: Date | undefined;
  onSelect: (d: Date | undefined) => void;
}) {
  const [view, setView] = useState<"date" | "month" | "year">("date");
  const [viewDate, setViewDate] = useState<Date>(selected ?? new Date());

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = viewDate.getFullYear();
  const minYear = new Date().getFullYear() - 100;
  const maxYear = new Date().getFullYear();
  const startYear = Math.floor(currentYear / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i).filter(
    (y) => y >= minYear && y <= maxYear,
  );

  return (
    <div className="p-1 w-70">
      {/* header */}
      <div className="flex items-center justify-between px-2 py-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            const d = new Date(viewDate);
            if (view === "year") d.setFullYear(currentYear - 12);
            else d.setMonth(viewDate.getMonth() - 1);
            setViewDate(d);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-sm font-medium",
              view === "month" && "bg-muted",
            )}
            onClick={() => setView(view === "month" ? "date" : "month")}
          >
            {format(viewDate, "MMMM")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-sm font-medium", view === "year" && "bg-muted")}
            onClick={() => setView(view === "year" ? "date" : "year")}
          >
            {format(viewDate, "yyyy")}
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            const d = new Date(viewDate);
            if (view === "year") d.setFullYear(currentYear + 12);
            else d.setMonth(viewDate.getMonth() + 1);
            setViewDate(d);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {view === "month" && (
        <div className="grid grid-cols-3 gap-2 p-2">
          {MONTHS.map((m, i) => (
            <Button
              key={m}
              variant="outline"
              className={cn(
                "h-9",
                viewDate.getMonth() === i &&
                  "bg-primary text-primary-foreground",
              )}
              onClick={() => {
                const d = new Date(viewDate);
                d.setMonth(i);
                setViewDate(d);
                setView("date");
              }}
            >
              {m}
            </Button>
          ))}
        </div>
      )}

      {view === "year" && (
        <div className="grid grid-cols-4 gap-2 p-2">
          {years.map((y) => (
            <Button
              key={y}
              variant="outline"
              className={cn(
                "h-9 text-sm",
                viewDate.getFullYear() === y &&
                  "bg-primary text-primary-foreground",
              )}
              onClick={() => {
                const d = new Date(viewDate);
                d.setFullYear(y);
                setViewDate(d);
                setView("month");
              }}
            >
              {y}
            </Button>
          ))}
        </div>
      )}

      {view === "date" && (
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            onSelect(d);
            if (d) setViewDate(d);
          }}
          month={viewDate}
          onMonthChange={setViewDate}
          disabled={(d) => d > new Date()}
          className="border-none p-0"
        />
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ProfileForm({ profile, error: initError }: Props) {
  // personal info state
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phoneNo, setPhoneNo] = useState(profile?.phoneNo ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [dob, setDob] = useState<Date | undefined>(
    profile?.dob ? parseISO(profile.dob) : undefined,
  );
  const [savingInfo, setSavingInfo] = useState(false);

  // password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // google linking state
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  if (initError || !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive text-sm">
              {initError ?? "Failed to load profile."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const res = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phoneNo,
          gender,
          dob: dob?.toISOString(),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/patient/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // only sent if they already have a password (change flow)
          ...(profile.hasPassword && { currentPassword }),
          newPassword,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        profile.hasPassword ? "Password updated" : "Password added",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true);
    try {
      // Triggers auth.js OAuth flow; redirect handled by next-auth
      const { signIn } = await import("next-auth/react");
      await signIn("google", { callbackUrl: window.location.href });
    } catch {
      toast.error("Failed to link Google account");
      setLinkingGoogle(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information.
        </p>
      </div>

      {/* ── Personal Information ── */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your name, contact details, and date of birth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dob && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? format(dob, "PPP") : "Select date of birth"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DobCalendar selected={dob} onSelect={setDob} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={gender}
              onValueChange={setGender}
              className="flex gap-6"
            >
              {["Male", "Female", "Other"].map((g) => (
                <div key={g} className="flex items-center space-x-2">
                  <RadioGroupItem value={g} id={`gender-${g}`} />
                  <Label htmlFor={`gender-${g}`}>{g}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button onClick={handleSaveInfo} disabled={savingInfo}>
            {savingInfo ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* ── Security ── */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your password and connected accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* password section */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">
                {profile.hasPassword ? "Change Password" : "Add Password"}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.hasPassword
                  ? "Update your existing password."
                  : "Add a password so you can sign in with email too."}
              </p>
            </div>
            <div className="space-y-3">
              {profile.hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleSavePassword}
              disabled={
                savingPassword ||
                !newPassword ||
                !confirmPassword ||
                (profile.hasPassword && !currentPassword)
              }
              variant="outline"
            >
              {savingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {profile.hasPassword ? "Update Password" : "Add Password"}
            </Button>
          </div>

          <Separator />

          {/* google account section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Google icon */}
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-xs text-muted-foreground">
                  {profile.googleConnected
                    ? "Connected — sign in with Google is enabled"
                    : "Not connected"}
                </p>
              </div>
            </div>
            {profile.googleConnected ? (
              <Badge variant="secondary" className="text-xs">
                Connected
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLinkGoogle}
                disabled={linkingGoogle}
              >
                {linkingGoogle && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Link Google
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
