import { NextResponse } from "next/server";
import { z } from "zod";
import { getPatientFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const adminPostSchema = z.object({
  patientId: z.string(),
  doctorId: z.string().nullable(),
  time: z.string(),
  condition: z.string().nullable(),
  department: z.string().nullable(),
  status: z.enum([
    "Requested",
    "DoctorAssigned",
    "Completed",
    "Cancelled",
    "Emergency",
  ]),
});

const patientPostSchema = z.object({
  doctorId: z.string().optional(),
  department: z.string(),
  condition: z.string().optional(),
  time: z.string(),
  status: z.enum(["Requested"]),
});

export async function POST(req: Request) {
  const { session, error } = await requireAuth(["Admin", "Patient"]);
  if (error) return error;

  const body = await req.json();

  if (session.user.role === "Admin") {
    const parsed = adminPostSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { patientId, doctorId, time, condition, department, status } =
      parsed.data;
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        time: new Date(time),
        condition,
        department,
        status,
      },
    });
    return NextResponse.json(appointment, { status: 201 });
  }

  const parsed = patientPostSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const patient = await getPatientFromSession(session);
  const { doctorId, department, condition, time, status } = parsed.data;
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      department,
      status,
      time: new Date(time),
      ...(doctorId && { doctorId }),
      ...(condition && { condition }),
    },
  });
  return NextResponse.json(appointment, { status: 201 });
}
