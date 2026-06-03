import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDoctorDashboardData() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Unauthorized" };
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        user: {
          select: { name: true },
        },
        schedule: {
          select: {
            days: {
              select: {
                day: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
        appointments: {
          where: {
            time: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          select: {
            id: true,
            time: true,
            status: true,
            condition: true,
            department: true,
            patient: {
              select: {
                id: true,
                user: {
                  select: { name: true, image: true },
                },
                gender: true,
                dob: true,
              },
            },
          },
          orderBy: { time: "asc" },
        },
      },
    });

    if (!doctor) {
      return { data: null, error: "Doctor record not found" };
    }

    const todayName = new Date().toLocaleString("en-US", {
      weekday: "long",
    }) as
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday";

    const todaySchedule =
      doctor.schedule?.days.find((d) => d.day === todayName) ?? null;

    return {
      data: {
        doctorName: doctor.user.name,
        todaySchedule: todaySchedule
          ? {
              startTime: todaySchedule.startTime,
              endTime: todaySchedule.endTime,
            }
          : null,
        appointments: doctor.appointments.map((a) => ({
          id: a.id,
          time: a.time.toISOString(),
          status: a.status as string,
          condition: a.condition,
          department: a.department,
          patient: {
            id: a.patient.id,
            name: a.patient.user.name,
            image: a.patient.user.image,
            gender: a.patient.gender,
            dob: a.patient.dob?.toISOString() ?? null,
          },
        })),
      },
      error: null,
    };
  } catch (err) {
    console.error("Error fetching doctor dashboard data:", err);
    return { data: null, error: "Failed to load dashboard data" };
  }
}
