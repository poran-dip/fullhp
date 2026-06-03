import { prisma } from "@/lib/prisma";

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export async function getPatients() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        dob: true,
        gender: true,
        phoneNo: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      patients: patients.map((p) => ({
        ...p,
        age: calculateAge(p.dob),
      })),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return { patients: [], error: "Failed to load patients" };
  }
}
