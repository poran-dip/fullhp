"use client";

import {
  Bell,
  Calendar,
  ChevronRight,
  Monitor,
  Shield,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const DocSettings = () => {
  // Working hours state
  const [schedule, setSchedule] = useState([
    { day: "Monday", time: "3pm - 5pm", isWorking: true },
    { day: "Tuesday", time: "2pm - 4pm", isWorking: true },
    { day: "Wednesday", time: "9am - 11am", isWorking: true },
    { day: "Thursday", time: "1pm - 3pm", isWorking: true },
    { day: "Friday", time: "10am - 12pm", isWorking: true },
    { day: "Saturday", time: "10am - 12pm", isWorking: false },
    { day: "Sunday", time: "10am - 12pm", isWorking: false },
  ]);

  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    appointmentReminders: true,
    newPatients: true,
    systemUpdates: false,
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisibility: "verified",
    shareAnalytics: true,
    twoFactorAuth: false,
  });

  // Display settings state
  const [display, setDisplay] = useState({
    theme: "light",
    fontSize: "medium",
    compactView: false,
    language: "english",
  });

  // Toggle schedule working day
  const toggleWorkingDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isWorking = !newSchedule[index].isWorking;
    setSchedule(newSchedule);
  };

  // Update working hours
  const updateWorkingHours = (index: number, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index].time = value;
    setSchedule(newSchedule);
  };

  // Toggle notification setting
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserCog size={16} />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Schedule</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell size={16} />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield size={16} />
            <span>Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Monitor size={16} />
            <span>Display</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings Tab */}
        <TabsContent value="account">
          <h3 className="text-xl font-bold mb-4">Account Settings</h3>
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first-name"
                    className="text-sm text-slate-500"
                  >
                    First Name
                  </label>
                  <Input
                    id="first-name"
                    name="first-name"
                    defaultValue="John"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="text-sm text-slate-500">
                    Last Name
                  </label>
                  <Input id="last-name" name="last-name" defaultValue="Doe" />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm text-slate-500">
                    Email
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      defaultValue="john.doe@example.com"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                      Verified
                    </Badge>
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm text-slate-500">
                    Phone
                  </label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue="+1 (555) 123-4567"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-700"
                      >
                        Not Verified
                      </Badge>
                      <Button
                        size="sm"
                        variant="link"
                        className="text-blue-600 p-0 h-auto"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide">
                Professional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="specialization"
                    className="text-sm text-slate-500"
                  >
                    Specialization
                  </label>
                  <Select name="specialization" defaultValue="cardiologist">
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiologist">Cardiologist</SelectItem>
                      <SelectItem value="neurologist">Neurologist</SelectItem>
                      <SelectItem value="pediatrician">Pediatrician</SelectItem>
                      <SelectItem value="dermatologist">
                        Dermatologist
                      </SelectItem>
                      <SelectItem value="orthopedic">
                        Orthopedic Surgeon
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="license" className="text-sm text-slate-500">
                    License Number
                  </label>
                  <div className="relative">
                    <Input
                      id="license"
                      name="license"
                      defaultValue="MED12345678"
                      readOnly
                      className="bg-slate-50"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                      Verified
                    </Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="text-sm text-slate-500">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue="Experienced cardiologist with over 10 years of practice. Specializing in preventive cardiology and heart disease management."
                    className="h-24"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide">
                Security
              </h4>
              <div className="space-y-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Change Password
                </Button>
                <div className="text-sm text-slate-500">
                  Last password change: 45 days ago
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Schedule Settings Tab */}
        <TabsContent value="schedule">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Schedule Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Working Hours
                </h4>
                <div className="space-y-3">
                  {schedule.map((day, index) => (
                    <div
                      key={day.day}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center">
                        <Switch
                          checked={day.isWorking}
                          onCheckedChange={() => toggleWorkingDay(index)}
                          className="mr-3"
                        />
                        <span className="w-24 font-medium">{day.day}</span>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <Input
                          value={day.time}
                          onChange={(e) =>
                            updateWorkingHours(index, e.target.value)
                          }
                          disabled={!day.isWorking}
                          className={
                            !day.isWorking ? "bg-slate-100 text-slate-400" : ""
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Appointment Settings
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="duration"
                        className="text-sm text-slate-500"
                      >
                        Default Appointment Duration
                      </label>
                      <Select name="duration" defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        htmlFor="buffer"
                        className="text-sm text-slate-500"
                      >
                        Buffer Time Between Appointments
                      </label>
                      <Select name="buffer" defaultValue="10">
                        <SelectTrigger>
                          <SelectValue placeholder="Select buffer time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">Allow Online Booking</h5>
                      <p className="text-sm text-slate-500">
                        Let patients book appointments online
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">
                        Require Appointment Confirmation
                      </h5>
                      <p className="text-sm text-slate-500">
                        Manually approve each appointment request
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings Tab */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Notification Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Notification Methods
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">Email Notifications</h5>
                      <p className="text-sm text-slate-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={() => toggleNotification("email")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">SMS Notifications</h5>
                      <p className="text-sm text-slate-500">
                        Receive notifications via text message
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={() => toggleNotification("sms")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">Push Notifications</h5>
                      <p className="text-sm text-slate-500">
                        Receive notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={() => toggleNotification("push")}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Notification Types
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">Appointment Reminders</h5>
                      <p className="text-sm text-slate-500">
                        Get notified about upcoming appointments
                      </p>
                    </div>
                    <Switch
                      checked={notifications.appointmentReminders}
                      onCheckedChange={() =>
                        toggleNotification("appointmentReminders")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">New Patient Notifications</h5>
                      <p className="text-sm text-slate-500">
                        Get notified when a new patient registers
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newPatients}
                      onCheckedChange={() => toggleNotification("newPatients")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">System Updates</h5>
                      <p className="text-sm text-slate-500">
                        Get notified about Eazydoc updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.systemUpdates}
                      onCheckedChange={() =>
                        toggleNotification("systemUpdates")
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Reminder Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reminder"
                      className="text-sm text-slate-500"
                    >
                      Appointment Reminder Time
                    </label>
                    <Select name="reminder" defaultValue="24">
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="3">3 hours before</SelectItem>
                        <SelectItem value="24">24 hours before</SelectItem>
                        <SelectItem value="48">48 hours before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="privacy">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Privacy and Security</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Privacy Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="visibility"
                      className="text-sm text-slate-500"
                    >
                      Profile Visibility
                    </label>
                    <Select
                      name="visibility"
                      value={privacy.profileVisibility}
                      onValueChange={(value) =>
                        setPrivacy({ ...privacy, profileVisibility: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          Public - Visible to everyone
                        </SelectItem>
                        <SelectItem value="verified">
                          Verified Patients Only
                        </SelectItem>
                        <SelectItem value="private">
                          Private - By invitation only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">Anonymous Analytics</h5>
                      <p className="text-sm text-slate-500">
                        Share anonymous usage data to improve Eazydoc
                      </p>
                    </div>
                    <Switch
                      checked={privacy.shareAnalytics}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, shareAnalytics: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Security Settings
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">Two-Factor Authentication</h5>
                      <p className="text-sm text-slate-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Switch
                        checked={privacy.twoFactorAuth}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, twoFactorAuth: checked })
                        }
                        className="mr-2"
                      />
                      <Button variant="ghost" size="sm">
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>

                  <Button className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-red-200">
                    View Login History
                  </Button>

                  <Button className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-red-200">
                    Revoke All Sessions
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Data Management
                </h4>
                <div className="space-y-3">
                  <Button className="bg-white border hover:bg-slate-50 text-slate-700">
                    Export Patient Data
                  </Button>

                  <Button className="bg-white border hover:bg-slate-50 text-slate-700">
                    Export My Data
                  </Button>

                  <Button className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-red-200">
                    Delete Account
                  </Button>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Display Settings Tab */}
        <TabsContent value="display">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Display Preferences</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Theme Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="theme" className="text-sm text-slate-500">
                      Theme
                    </label>
                    <Select
                      name="theme"
                      value={display.theme}
                      onValueChange={(value) =>
                        setDisplay({ ...display, theme: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="color" className="text-sm text-slate-500">
                      Color Scheme
                    </label>
                    <Select name="color" defaultValue="blue">
                      <SelectTrigger>
                        <SelectValue placeholder="Select color scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue (Default)</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="teal">Teal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Content Display
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="font-size"
                        className="text-sm text-slate-500"
                      >
                        Font Size
                      </label>
                      <Select
                        name="font-size"
                        value={display.fontSize}
                        onValueChange={(value) =>
                          setDisplay({ ...display, fontSize: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">
                            Medium (Default)
                          </SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label
                        htmlFor="language"
                        className="text-sm text-slate-500"
                      >
                        Language
                      </label>
                      <Select
                        name="language"
                        value={display.language}
                        onValueChange={(value) =>
                          setDisplay({ ...display, language: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h5 className="font-medium">Compact View</h5>
                      <p className="text-sm text-slate-500">
                        Display more content with less spacing
                      </p>
                    </div>
                    <Switch
                      checked={display.compactView}
                      onCheckedChange={(checked) =>
                        setDisplay({ ...display, compactView: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wide mb-4">
                  Time Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="time-format"
                      className="text-sm text-slate-500"
                    >
                      Time Format
                    </label>
                    <Select name="time-format" defaultValue="12h">
                      <SelectTrigger>
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="time-zone"
                      className="text-sm text-slate-500"
                    >
                      Time Zone
                    </label>
                    <Select name="time-zone" defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="et">Eastern Time (ET)</SelectItem>
                        <SelectItem value="ct">Central Time (CT)</SelectItem>
                        <SelectItem value="mt">Mountain Time (MT)</SelectItem>
                        <SelectItem value="pt">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button variant="outline">Reset to Default</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocSettings;
