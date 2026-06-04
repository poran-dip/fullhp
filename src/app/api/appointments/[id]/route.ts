import { NextResponse } from "next/server";
import { z } from "zod";
import { getDoctorFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const adminPatchSchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().nullable().optional(),
  time: z.string().optional(),
  condition: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  status: z
    .enum([
      "Requested",
      "DoctorAssigned",
      "Completed",
      "Cancelled",
      "Emergency",
    ])
    .optional(),
});

const doctorPatchSchema = z.object({
  status: z
    .enum([
      "Requested",
      "DoctorAssigned",
      "Completed",
      "Cancelled",
      "Emergency",
    ])
    .optional(),
  doctorComments: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireAuth(["Admin", "Doctor"]);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  if (session.user.role === "Admin") {
    const parsed = adminPatchSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { patientId, doctorId, time, condition, department, status } =
      parsed.data;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(patientId !== undefined && { patientId }),
        ...(doctorId !== undefined && { doctorId }),
        ...(time !== undefined && { time: new Date(time) }),
        ...(condition !== undefined && { condition }),
        ...(department !== undefined && { department }),
        ...(status !== undefined && { status }),
      },
    });
    return NextResponse.json(appointment);
  }

  const parsed = doctorPatchSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const doctor = await getDoctorFromSession(session);
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, doctorComments } = parsed.data;
  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(doctorComments !== undefined && { doctorComments }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth(["Admin"]);
  if (error) return error;

  const { id } = await params;
  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
