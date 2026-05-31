"use client";

import { useState } from "react";
import type { DoctorWithUser } from "@/types";
import DoctorResults from "./doctor-search/results";
import DoctorSearch from "./doctor-search/search";

export default function DoctorSearchSection({
  doctors,
}: {
  doctors: DoctorWithUser[];
}) {
  const [results, setResults] = useState<DoctorWithUser[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [department, setDepartment] = useState("");

  const handleResults = (
    filtered: DoctorWithUser[],
    selectedDepartment: string,
  ) => {
    setResults(filtered);
    setHasSearched(true);
    setDepartment(selectedDepartment);
  };

  return (
    <section id="hero" className="py-16 md:py-20 bg-blue-50">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter">
            Find The Right Doctor For You
          </h1>
          <p className="mx-auto max-w-175 text-muted-foreground md:text-lg">
            Search thousands of specialists and get the care you deserve.
          </p>
        </div>
        <DoctorSearch doctors={doctors} onResults={handleResults} />
        <DoctorResults
          results={results}
          hasSearched={hasSearched}
          department={department}
        />
      </div>
    </section>
  );
}
