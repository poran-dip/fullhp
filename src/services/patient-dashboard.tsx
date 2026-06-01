import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getPatientDashboardData() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Unauthorized" };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        appointments: {
          select: {
            id: true,
            time: true,
            status: true,
            department: true,
            doctorComments: true,
            doctor: {
              select: {
                id: true,
                specialization: true,
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
            prescriptions: {
              select: { id: true },
            },
            tests: {
              select: {
                test: true,
                result: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return { data: null, error: "Patient record not found" };
    }

    const now = new Date();

    const upcoming = patient.appointments
      .filter(
        (a) =>
          new Date(a.time) > now &&
          a.status !== "Cancelled" &&
          a.status !== "Completed",
      )
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    const nextAppointment = upcoming[0] ?? null;

    const previous = patient.appointments
      .filter((a) => a.status === "Completed" || new Date(a.time) <= now)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const lastAppointment = previous[0] ?? null;

    // Latest test result across all appointments
    const allTests = patient.appointments
      .flatMap((a) => a.tests)
      .filter((t) => t.result !== null);
    const latestTest =
      allTests.length > 0 ? allTests[allTests.length - 1] : null;

    const prescriptionCount = patient.appointments.reduce(
      (sum, a) => sum + a.prescriptions.length,
      0,
    );

    return {
      data: {
        nextAppointment: nextAppointment
          ? {
              id: nextAppointment.id,
              time: nextAppointment.time.toISOString(),
              status: nextAppointment.status as string,
              department: nextAppointment.department,
              doctor: nextAppointment.doctor
                ? {
                    id: nextAppointment.doctor.id,
                    name: nextAppointment.doctor.user.name,
                    image: nextAppointment.doctor.user.image,
                    specialization: nextAppointment.doctor.specialization,
                  }
                : null,
            }
          : null,
        lastAppointment: lastAppointment
          ? {
              id: lastAppointment.id,
              time: lastAppointment.time.toISOString(),
              status: lastAppointment.status as string,
              department: lastAppointment.department,
              doctorComments: lastAppointment.doctorComments,
              doctor: lastAppointment.doctor
                ? {
                    id: lastAppointment.doctor.id,
                    name: lastAppointment.doctor.user.name,
                    image: lastAppointment.doctor.user.image,
                    specialization: lastAppointment.doctor.specialization,
                  }
                : null,
            }
          : null,
        latestTest: latestTest ?? null,
        prescriptionCount,
        // Pass through all upcoming for the tab list
        upcomingAppointments: upcoming.map((a) => ({
          id: a.id,
          time: a.time.toISOString(),
          status: a.status as string,
          department: a.department,
          doctor: a.doctor
            ? {
                id: a.doctor.id,
                name: a.doctor.user.name,
                image: a.doctor.user.image,
                specialization: a.doctor.specialization,
              }
            : null,
        })),
      },
      error: null,
    };
  } catch (err) {
    console.error("Error fetching patient dashboard data:", err);
    return { data: null, error: "Failed to load dashboard data" };
  }
}
