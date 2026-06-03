import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AppointmentItem {
  id: string;
  time: string;
  status: string;
  condition: string | null;
  department: string | null;
  doctorComments: string | null;
  doctor: {
    id: string;
    name: string | null;
    specialization: string;
  } | null;
  existingRating: {
    stars: number;
    comment: string | null;
  } | null;
}

export async function getPatientAppointments() {
  const session = await auth();
  if (!session?.user?.id) {
    return { appointments: [], error: "Unauthorized" };
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        appointments: {
          orderBy: { time: "desc" },
          select: {
            id: true,
            time: true,
            status: true,
            condition: true,
            department: true,
            doctorComments: true,
            doctor: {
              select: {
                id: true,
                specialization: true,
                user: { select: { name: true } },
              },
            },
          },
        },
        ratings: {
          select: {
            doctorId: true,
            stars: true,
            comment: true,
          },
        },
      },
    });

    if (!patient) {
      return { appointments: [], error: "Patient record not found" };
    }

    // Index ratings by doctorId for O(1) lookup
    const ratingByDoctor = new Map(
      patient.ratings
        .filter((r) => r.doctorId !== null)
        .map((r) => [r.doctorId, { stars: r.stars, comment: r.comment }]),
    );

    const appointments: AppointmentItem[] = patient.appointments.map((a) => ({
      id: a.id,
      time: a.time.toISOString(),
      status: a.status as string,
      condition: a.condition,
      department: a.department,
      doctorComments: a.doctorComments,
      doctor: a.doctor
        ? {
            id: a.doctor.id,
            name: a.doctor.user.name,
            specialization: a.doctor.specialization,
          }
        : null,
      existingRating: a.doctor
        ? (ratingByDoctor.get(a.doctor.id) ?? null)
        : null,
    }));

    return { appointments, error: null };
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return { appointments: [], error: "Failed to load appointments" };
  }
}
