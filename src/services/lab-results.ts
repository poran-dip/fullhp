import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AppointmentWithTests {
  id: string;
  time: string;
  updatedAt: string;
  department: string | null;
  doctor: {
    name: string | null;
    specialization: string;
  } | null;
  tests: {
    id: string;
    test: string;
    result: string | null;
  }[];
}

export async function getPatientLabResults() {
  const session = await auth();
  if (!session?.user?.id) {
    return { appointments: [], error: "Unauthorized" };
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: {
        appointments: {
          where: {
            tests: { some: {} },
          },
          orderBy: { time: "desc" },
          select: {
            id: true,
            time: true,
            updatedAt: true,
            department: true,
            doctor: {
              select: {
                specialization: true,
                user: { select: { name: true } },
              },
            },
            tests: {
              select: {
                id: true,
                test: true,
                result: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return { appointments: [], error: "Patient record not found" };
    }

    const appointments: AppointmentWithTests[] = patient.appointments.map(
      (a) => ({
        id: a.id,
        time: a.time.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        department: a.department,
        doctor: a.doctor
          ? {
              name: a.doctor.user.name,
              specialization: a.doctor.specialization,
            }
          : null,
        tests: a.tests.map((t) => ({
          id: t.id,
          test: t.test,
          result: t.result,
        })),
      }),
    );

    return { appointments, error: null };
  } catch (err) {
    console.error("Error fetching lab results:", err);
    return { appointments: [], error: "Failed to load lab results" };
  }
}
