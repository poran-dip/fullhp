import { prisma } from "@/lib/prisma";

export async function getDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        specialization: true,
        department: true,
        status: true,
        avgRating: true,
        phoneNo: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        appointments: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { doctors, error: null };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { doctors: [], error: "Failed to load doctors" };
  }
}

export async function getDoctorById(id: string) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        specialization: true,
        department: true,
        status: true,
        avgRating: true,
        ratingCount: true,
        phoneNo: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            image: true,
            email: true,
          },
        },
        schedule: {
          select: {
            days: {
              select: {
                day: true,
                startTime: true,
                endTime: true,
              },
              orderBy: { day: "asc" },
            },
          },
        },
        appointments: {
          select: { id: true },
        },
        ratings: {
          select: {
            id: true,
            stars: true,
            comment: true,
            createdAt: true,
            patient: {
              select: {
                user: {
                  select: { name: true, image: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!doctor) return { doctor: null, error: "Doctor not found" };
    return { doctor, error: null };
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return { doctor: null, error: "Failed to load doctor profile" };
  }
}
