"use client";

import { Search } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DoctorWithUser } from "@/types";

interface DoctorSearchProps {
  doctors: DoctorWithUser[];
  onResults: (results: DoctorWithUser[], department: string) => void;
}

const DEPARTMENTS = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "General Practice",
];

export default function DoctorSearch({
  doctors,
  onResults,
}: DoctorSearchProps) {
  const [department, setDepartment] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || department === "All") {
      onResults(doctors, department);
      return;
    }
    onResults(
      doctors.filter((d) => d.department === department),
      department,
    );
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    if (!value || value === "All") onResults(doctors, department);
  };

  return (
    <Card className="shadow-sm bg-white">
      <CardContent className="p-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-10">
              <label
                htmlFor="department"
                className="text-sm font-medium block mb-2"
              >
                Department
              </label>
              <Select value={department} onValueChange={handleDepartmentChange}>
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
