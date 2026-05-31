import { Suspense } from "react";
import Disclaimer from "@/components/homepage/disclaimer";
import DoctorSearch from "@/components/homepage/doctor-search";
import FeaturedDoctors from "@/components/homepage/featured-doctors";
import MedbotPromo from "@/components/homepage/medbot-promo";
import Navbar from "@/components/navbar";
import { Prisma } from "@/generated/client";
import { prisma } from "@/lib/prisma";

// Define the Doctor interface at the top level
interface Doctor {
  id: string;
  name: string | null;
  specialization: string;
  image: string | null;
  rating: number;
  location: string | null;
  status?: string;
  appointments: Appointment[];
}

interface Appointment {
  [key: string]: unknown;
}

// Set revalidation time to 24 hours (in seconds)
export const revalidate = 86400;

async function fetchDoctors(): Promise<{
  doctors: Doctor[];
  error: string | null;
}> {
  try {
    const doctorsData = await prisma.doctor.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        specialization: true,
        status: true,
        rating: true,
        image: true,
        location: true,
        appointments: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Convert Decimal to number for each doctor
    const doctors: Doctor[] = doctorsData.map((doctor) => ({
      ...doctor,
      rating:
        doctor.rating instanceof Prisma.Decimal
          ? doctor.rating.toDecimalPlaces(1).toNumber()
          : Number(doctor.rating),
    }));

    return {
      doctors,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return {
      doctors: [],
      error: "Failed to load doctors",
    };
  }
}

export default async function Home() {
  const { doctors, error } = await fetchDoctors();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="bg-blue-50">
        <Disclaimer />
      </section>
      <main className="flex-1">
        <section className="py-16 md:py-20 bg-blue-50">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                Find The Right Doctor For You
              </h1>
              <p className="mx-auto max-w-175 text-muted-foreground md:text-lg">
                Search thousands of specialists and get the care you deserve.
              </p>
            </div>
            <Suspense
              fallback={
                <div className="text-center">Loading doctor search...</div>
              }
            >
              <DoctorSearch doctors={doctors} isLoading={false} error={error} />
            </Suspense>
          </div>
        </section>

        <MedbotPromo />

        <Suspense
          fallback={
            <div className="text-center">Loading featured doctors...</div>
          }
        >
          <FeaturedDoctors doctors={doctors} isLoading={false} error={error} />
        </Suspense>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-col md:gap-6">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Cosmic Titans. All Rights Reserved.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Eazydoc™ – A Project By Cosmic Titans.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
