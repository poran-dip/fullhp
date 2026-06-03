import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface PatientProfile {
  // User fields
  name: string | null;
  email: string | null;
  image: string | null;
  hasPassword: boolean;
  googleConnected: boolean;
  // Patient fields
  dob: string; // ISO string
  gender: string;
  phoneNo: string;
}

export async function getPatientProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return { profile: null, error: "Unauthorized" };
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
        patient: {
          select: {
            dob: true,
            gender: true,
            phoneNo: true,
          },
        },
      },
    });

    if (!user?.patient) {
      return { profile: null, error: "Patient record not found" };
    }

    const profile: PatientProfile = {
      name: user.name,
      email: user.email,
      image: user.image,
      hasPassword: !!user.password,
      googleConnected: user.accounts.some((a) => a.provider === "google"),
      dob: user.patient.dob.toISOString(),
      gender: user.patient.gender,
      phoneNo: user.patient.phoneNo,
    };

    return { profile, error: null };
  } catch (err) {
    console.error("Error fetching patient profile:", err);
    return { profile: null, error: "Failed to load profile" };
  }
}
