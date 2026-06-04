import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  gender: z.string().min(1).optional(),
  dob: z.string().min(1).optional(),
  phoneNo: z.string().min(1).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth(["Admin"]);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, email, gender, dob, phoneNo } = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient)
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  const updated = await prisma.patient.update({
    where: { id },
    data: {
      ...(gender !== undefined && { gender }),
      ...(dob !== undefined && { dob: new Date(dob) }),
      ...(phoneNo !== undefined && { phoneNo }),
      user: {
        update: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
        },
      },
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

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient)
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: patient.userId } });
  return NextResponse.json({ success: true });
}
