import { NextResponse } from "next/server";
import { z } from "zod";
import { getDoctorFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  result: z.string(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; testId: string }> },
) {
  const { session, error } = await requireAuth(["Doctor"]);
  if (error) return error;

  const { id, testId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const doctor = await getDoctorFromSession(session);
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const test = await prisma.test.update({
    where: { id: testId },
    data: { result: parsed.data.result },
  });
  return NextResponse.json(test);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; testId: string }> },
) {
  const { session, error } = await requireAuth(["Doctor"]);
  if (error) return error;

  const { id, testId } = await params;
  const doctor = await getDoctorFromSession(session);
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.test.delete({ where: { id: testId } });
  return NextResponse.json({ success: true });
}
