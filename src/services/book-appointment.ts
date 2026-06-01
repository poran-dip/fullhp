import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface BookingDoctor {
  id: string;
  name: string | null;
  specialization: string;
  department: string;
}

export async function getBookingData(doctorId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { doctors: [], preselectedDoctor: null, error: "Unauthorized" };
    }

    const doctors = await prisma.doctor.findMany({
      where: { status: "Active" },
      select: {
        id: true,
        specialization: true,
        department: true,
        user: { select: { name: true } },
      },
      orderBy: { department: "asc" },
    });

    const mapped: BookingDoctor[] = doctors.map((d) => ({
      id: d.id,
      name: d.user.name,
      specialization: d.specialization,
      department: d.department,
    }));

    const preselectedDoctor = doctorId
      ? (mapped.find((d) => d.id === doctorId) ?? null)
      : null;

    return { doctors: mapped, preselectedDoctor, error: null };
  } catch (err) {
    console.error("Error fetching booking data:", err);
    return {
      doctors: [],
      preselectedDoctor: null,
      error: "Failed to load booking data",
    };
  }
}
