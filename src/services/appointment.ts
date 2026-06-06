import { prisma } from "@/lib/prisma";

export async function getAppointments(filters?: {
  patientId?: string;
  doctorId?: string;
}) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        ...(filters?.patientId && { patientId: filters.patientId }),
        ...(filters?.doctorId && { doctorId: filters.doctorId }),
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
            phoneNo: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            specialization: true,
            department: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { time: "desc" },
    });

    return { appointments, error: null };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return { appointments: [], error: "Failed to load appointments" };
  }
}

export async function getAppointmentFormData() {
  try {
    const [patients, doctors] = await Promise.all([
      prisma.patient.findMany({
        select: {
          id: true,
          phoneNo: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.doctor.findMany({
        where: { status: "Active" },
        select: {
          id: true,
          specialization: true,
          department: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { patients, doctors, error: null };
  } catch (error) {
    console.error("Error fetching form data:", error);
    return { patients: [], doctors: [], error: "Failed to load form data" };
  }
}
