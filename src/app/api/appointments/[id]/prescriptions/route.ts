import { NextResponse } from "next/server";
import { z } from "zod";
import { getDoctorFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  medicine: z.string().min(1),
  dosage: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireAuth(["Doctor"]);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const doctor = await getDoctorFromSession(session);
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { medicine, dosage } = parsed.data;
  const prescription = await prisma.prescription.create({
    data: { medicine, dosage, appointmentId: id },
  });
  return NextResponse.json(prescription, { status: 201 });
}
