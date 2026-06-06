import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Role = "Patient" | "Doctor" | "Admin";

export async function requireAuth(requiredRoles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (requiredRoles && !requiredRoles.includes(session.user.role as Role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}

export async function getPatientFromSession(session: Session) {
  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });
  if (!patient) throw new Error("Patient record not found");
  return patient;
}

export async function getDoctorFromSession(session: Session) {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctor) throw new Error("Doctor record not found");
  return doctor;
}
