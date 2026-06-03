import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface DoctorProfile {
  name: string | null;
  email: string | null;
  image: string | null;
  phoneNo: string;
  specialization: string;
  department: string;
  status: string;
  hasPassword: boolean;
  googleConnected: boolean;
  schedule: {
    id: string;
    days: {
      id: string;
      day: string;
      startTime: string;
      endTime: string;
    }[];
  } | null;
}

export async function getDoctorProfile(): Promise<{
  data: DoctorProfile | null;
  error: string | null;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { data: null, error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        password: true,
        accounts: {
          select: { provider: true },
        },
        doctor: {
          select: {
            phoneNo: true,
            specialization: true,
            department: true,
            status: true,
            schedule: {
              select: {
                id: true,
                days: {
                  select: {
                    id: true,
                    day: true,
                    startTime: true,
                    endTime: true,
                  },
                  orderBy: { day: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!user?.doctor) {
      return { data: null, error: "Doctor record not found" };
    }

    return {
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
        phoneNo: user.doctor.phoneNo,
        specialization: user.doctor.specialization,
        department: user.doctor.department,
        status: user.doctor.status,
        hasPassword: !!user.password,
        googleConnected: user.accounts.some((a) => a.provider === "google"),
        schedule: user.doctor.schedule,
      },
      error: null,
    };
  } catch (err) {
    console.error("Error fetching doctor profile:", err);
    return { data: null, error: "Failed to load profile" };
  }
}
