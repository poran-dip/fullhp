import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const patientId = cookieStore.get("patientId")?.value;
  const doctorId = cookieStore.get("doctorId")?.value;
  const adminId = cookieStore.get("adminId")?.value;
  const role = cookieStore.get("role")?.value;

  if (!role) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  try {
    let user = null;

    switch (role) {
      case "PATIENT":
        if (patientId) {
          user = await prisma.patient.findUnique({
            where: { id: patientId },
            select: {
              id: true,
              name: true,
              email: true,
            },
          });
        }
        break;

      case "DOCTOR":
        if (doctorId) {
          user = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: {
              id: true,
              name: true,
              email: true,
              specialization: true,
              status: true,
            },
          });
        }
        break;

      case "ADMIN":
        if (adminId) {
          user = await prisma.admin.findUnique({
            where: { id: adminId },
            select: {
              id: true,
              name: true,
              email: true,
            },
          });
        }
        break;
    }

    return NextResponse.json(
      {
        authenticated: !!user,
        user,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Auth status check error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: "Failed to verify authentication status",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
