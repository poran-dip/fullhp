import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDoctorAppointmentDetail(appointmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { data: null, error: "Unauthorized" };
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!doctor) {
      return { data: null, error: "Doctor record not found" };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        doctorId: true,
        time: true,
        status: true,
        condition: true,
        department: true,
        doctorComments: true,
        patient: {
          select: {
            id: true,
            gender: true,
            dob: true,
            user: {
              select: { name: true, image: true },
            },
            appointments: {
              where: {
                doctorId: doctor.id,
                NOT: { id: appointmentId },
              },
              orderBy: { time: "desc" },
              select: {
                id: true,
                time: true,
                status: true,
                condition: true,
                department: true,
                doctorComments: true,
              },
            },
          },
        },
        prescriptions: {
          select: { id: true, medicine: true, dosage: true },
        },
        tests: {
          select: { id: true, test: true, result: true },
        },
      },
    });

    if (!appointment) {
      return { data: null, error: "Appointment not found" };
    }

    if (appointment.doctorId !== doctor.id) {
      return { data: null, error: "Unauthorized" };
    }

    return {
      data: {
        id: appointment.id,
        time: appointment.time.toISOString(),
        status: appointment.status as string,
        condition: appointment.condition,
        department: appointment.department,
        doctorComments: appointment.doctorComments,
        patient: {
          id: appointment.patient.id,
          name: appointment.patient.user.name,
          image: appointment.patient.user.image,
          gender: appointment.patient.gender,
          dob: appointment.patient.dob?.toISOString() ?? null,
          pastAppointments: appointment.patient.appointments.map((a) => ({
            id: a.id,
            time: a.time.toISOString(),
            status: a.status as string,
            condition: a.condition,
            department: a.department,
            doctorComments: a.doctorComments,
          })),
        },
        prescriptions: appointment.prescriptions,
        tests: appointment.tests,
      },
      error: null,
    };
  } catch (err) {
    console.error("Error fetching appointment detail:", err);
    return { data: null, error: "Failed to load appointment" };
  }
}
