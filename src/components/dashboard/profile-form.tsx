"use client";

import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Save } from "lucide-react";
import type React from "react";
import { useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function ProfileForm() {
  const [date, setDate] = useState<Date>();
  const [isSaving, setIsSaving] = useState(false);

  // Mock user data
  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    emergencyContactName: "Jane Doe",
    emergencyContactPhone: "(555) 987-6543",
    emergencyContactRelationship: "Spouse",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSaving(false);
  };

  // Custom calendar navigation components
  const CalendarHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    view,
    setView,
  }: {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
    view: "date" | "month" | "year";
    setView: (view: "date" | "month" | "year") => void;
  }) => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={decreaseMonth}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            onClick={() => setView("month")}
            className={cn(
              "text-sm font-medium",
              view === "month" && "bg-muted",
            )}
          >
            {format(date, "MMMM")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setView("year")}
            className={cn("text-sm font-medium", view === "year" && "bg-muted")}
          >
            {format(date, "yyyy")}
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={increaseMonth}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>
    );
  };

  const MonthsView = ({
    date,
    setDate,
    setView,
  }: {
    date: Date;
    setDate: (date: Date) => void;
    setView: (view: "date" | "month" | "year") => void;
  }) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const handleMonthSelect = (monthIndex: number) => {
      const newDate = new Date(date);
      newDate.setMonth(monthIndex);
      setDate(newDate);
      setView("date");
    };

    return (
      <div className="p-2">
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <Button
              key={month}
              variant="outline"
              className={cn(
                "h-10",
                date.getMonth() === index &&
                  "bg-primary text-primary-foreground",
              )}
              onClick={() => handleMonthSelect(index)}
            >
              {month.substring(0, 3)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const YearsView = ({
    date,
    setDate,
    setView,
    minYear = new Date().getFullYear() - 100,
    maxYear = new Date().getFullYear(),
  }: {
    date: Date;
    setDate: (date: Date) => void;
    setView: (view: "date" | "month" | "year") => void;
    minYear?: number;
    maxYear?: number;
  }) => {
    const currentYear = date.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;

    const years = Array.from({ length: 12 }, (_, i) => {
      const year = startYear + i;
      return year >= minYear && year <= maxYear ? year : null;
    }).filter(Boolean) as number[];

    const handleYearSelect = (year: number) => {
      const newDate = new Date(date);
      newDate.setFullYear(year);
      setDate(newDate);
      setView("month");
    };

    return (
      <div className="p-2">
        <div className="flex justify-between mb-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newDate = new Date(date);
              newDate.setFullYear(currentYear - 12);
              setDate(newDate);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {years[0]} - {years[years.length - 1]}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newDate = new Date(date);
              newDate.setFullYear(currentYear + 12);
              setDate(newDate);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant="outline"
              className={cn(
                "h-10",
                date.getFullYear() === year &&
                  "bg-primary text-primary-foreground",
              )}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const CustomCalendar = ({
    selected,
    onSelect,
    disabled,
    minYear,
    maxYear,
  }: {
    selected?: Date;
    onSelect: (date: Date | undefined) => void;
    disabled?: (date: Date) => boolean;
    minYear?: number;
    maxYear?: number;
  }) => {
    const [view, setView] = useState<"date" | "month" | "year">("date");
    const [viewDate, setViewDate] = useState<Date>(selected || new Date());

    const handleDateSelect = (date: Date | undefined) => {
      onSelect(date);
      if (date) {
        setViewDate(date);
      }
    };

    return (
      <div className="p-1">
        <CalendarHeader
          date={viewDate}
          decreaseMonth={() => {
            const newDate = new Date(viewDate);
            newDate.setMonth(viewDate.getMonth() - 1);
            setViewDate(newDate);
          }}
          increaseMonth={() => {
            const newDate = new Date(viewDate);
            newDate.setMonth(viewDate.getMonth() + 1);
            setViewDate(newDate);
          }}
          view={view}
          setView={setView}
        />

        {view === "date" && (
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            month={viewDate}
            onMonthChange={setViewDate}
            disabled={disabled}
            className="border-none"
          />
        )}

        {view === "month" && (
          <MonthsView date={viewDate} setDate={setViewDate} setView={setView} />
        )}

        {view === "year" && (
          <YearsView
            date={viewDate}
            setDate={setViewDate}
            setView={setView}
            minYear={minYear}
            maxYear={maxYear}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={userData.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={userData.lastName} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={userData.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={userData.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select your date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date > new Date()}
                      minYear={new Date().getFullYear() - 100}
                      maxYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue={userData.address} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" defaultValue={userData.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select defaultValue={userData.state}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" defaultValue={userData.zipCode} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>
                Add someone we can contact in case of an emergency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    defaultValue={userData.emergencyContactName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    defaultValue={userData.emergencyContactPhone}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelationship">
                  Relationship
                </Label>
                <Select defaultValue={userData.emergencyContactRelationship}>
                  <SelectTrigger id="emergencyContactRelationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>
                Add your medical history and allergies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any allergies you have (medications, food, etc.)"
                  className="min-h-25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  placeholder="List any chronic medical conditions"
                  className="min-h-25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List any medications you are currently taking"
                  className="min-h-25"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4 pt-6">
              <Button variant="outline">Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
