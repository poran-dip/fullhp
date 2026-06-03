import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDoctorAppointments() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: null, error: "Unauthorized" };
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!doctor) {
      return { data: null, error: "Doctor record not found" };
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      orderBy: { time: "asc" },
      select: {
        id: true,
        time: true,
        status: true,
        condition: true,
        department: true,
        patient: {
          select: {
            id: true,
            gender: true,
            dob: true,
            user: {
              select: { name: true, image: true },
            },
          },
        },
      },
    });

    return {
      data: appointments.map((a) => ({
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
      error: null,
    };
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    return { data: null, error: "Failed to load appointments" };
  }
}
