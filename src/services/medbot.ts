import { prisma } from "@/lib/prisma";

export async function getActiveDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: "Active" },
      select: {
        id: true,
        slug: true,
        specialization: true,
        department: true,
        avgRating: true,
        user: {
          select: { name: true },
        },
      },
    });
    return { doctors, error: null };
  } catch (error) {
    console.error("Error fetching active doctors:", error);
    return { doctors: [], error: "Failed to load doctors" };
  }
}
