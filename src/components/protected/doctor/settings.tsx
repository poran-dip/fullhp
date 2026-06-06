"use client";

import { Loader2, Save } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ImageCropper } from "@/components/image-cropper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/lib/api";
import type { DoctorProfile } from "@/services/doctor-profile";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Weekday = (typeof WEEKDAYS)[number];

interface DayEntry {
  id: string | null; // null = not yet in DB
  startTime: string;
  endTime: string;
  enabled: boolean;
}

type ScheduleState = Record<Weekday, DayEntry>;

function buildScheduleState(
  schedule: DoctorProfile["schedule"],
): ScheduleState {
  const state = {} as ScheduleState;
  for (const day of WEEKDAYS) {
    const existing = schedule?.days.find((d) => d.day === day);
    state[day] = existing
      ? {
          id: existing.id,
          startTime: existing.startTime,
          endTime: existing.endTime,
          enabled: true,
        }
      : { id: null, startTime: "09:00", endTime: "17:00", enabled: false };
  }
  return state;
}

interface Props {
  profile: DoctorProfile | null;
  error: string | null;
}

export default function DoctorSettings({ profile, error: initError }: Props) {
  const { apiFetch } = useApi();

  // ── profile state ──
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phoneNo, setPhoneNo] = useState(profile?.phoneNo ?? "");
  const [specialization, setSpecialization] = useState(
    profile?.specialization ?? "",
  );
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [image, setImage] = useState(profile?.image ?? "");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // ── status state ──
  const [status, setStatus] = useState(profile?.status ?? "Active");
  const [savingStatus, setSavingStatus] = useState(false);

  // ── schedule state ──
  const [scheduleState, setScheduleState] = useState<ScheduleState>(
    buildScheduleState(profile?.schedule ?? null),
  );
  const [savingSchedule, setSavingSchedule] = useState(false);

  // ── password state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // ── google state ──
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  if (initError || !profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
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

  // ── handlers ──

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await apiFetch("/api/doctors/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phoneNo,
          specialization,
          department,
          image,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    try {
      const res = await apiFetch("/api/doctors/me/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const days = WEEKDAYS.filter((d) => scheduleState[d].enabled).map(
        (d) => ({
          id: scheduleState[d].id,
          day: d,
          startTime: scheduleState[d].startTime,
          endTime: scheduleState[d].endTime,
        }),
      );

      const deletedIds = WEEKDAYS.filter(
        (d) => !scheduleState[d].enabled && scheduleState[d].id !== null,
      ).map((d) => scheduleState[d].id);

      const res = await apiFetch("/api/doctors/me/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, deletedIds }),
      });
      if (!res.ok) throw new Error();
      toast.success("Schedule saved");
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setSavingSchedule(false);
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
      const res = await apiFetch("/api/doctors/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      const { signIn } = await import("next-auth/react");
      await signIn("google", { callbackUrl: window.location.href });
    } catch {
      toast.error("Failed to link Google account");
      setLinkingGoogle(false);
    }
  };

  const updateDay = (day: Weekday, patch: Partial<DayEntry>) => {
    setScheduleState((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...patch },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, schedule, and account.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name, contact details, and profile photo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                {image ? (
                  <div className="flex items-center gap-3">
                    <Image
                      src={image}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setImage("");
                        setCropperOpen(true);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : cropperOpen ? (
                  <ImageCropper
                    onDone={(url) => {
                      setImage(url);
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Status</CardTitle>
              <CardDescription>
                Set your current availability for appointments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="OnLeave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSaveStatus}
                disabled={savingStatus}
                variant="outline"
              >
                {savingStatus && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Status
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ── Schedule Tab ── */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Set your working hours for each day. Toggle off for a day off.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {WEEKDAYS.map((day) => {
                const entry = scheduleState[day];
                return (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <Switch
                      checked={entry.enabled}
                      onCheckedChange={(checked) =>
                        updateDay(day, { enabled: checked })
                      }
                    />
                    <span className="w-28 font-medium text-sm">{day}</span>
                    {entry.enabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={entry.startTime}
                          onChange={(e) =>
                            updateDay(day, { startTime: e.target.value })
                          }
                          className="w-32"
                        />
                        <span className="text-slate-400 text-sm">to</span>
                        <Input
                          type="time"
                          value={entry.endTime}
                          onChange={(e) =>
                            updateDay(day, { endTime: e.target.value })
                          }
                          className="w-32"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">
                        Day off
                      </span>
                    )}
                  </div>
                );
              })}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSchedule} disabled={savingSchedule}>
                {savingSchedule ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Schedule
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ── Security Tab ── */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and connected accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password */}
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

              {/* Google */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
