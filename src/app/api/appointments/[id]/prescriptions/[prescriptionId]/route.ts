import { NextResponse } from "next/server";
import { getDoctorFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> },
) {
  const { session, error } = await requireAuth(["Doctor"]);
  if (error) return error;

  const { id, prescriptionId } = await params;
  const doctor = await getDoctorFromSession(session);
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.prescription.delete({ where: { id: prescriptionId } });
  return NextResponse.json({ success: true });
}
