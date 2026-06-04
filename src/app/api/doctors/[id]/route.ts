import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  specialization: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  phoneNo: z.string().min(1).optional(),
  image: z.string().optional(),
  status: z.enum(["Active", "Inactive", "OnLeave"]).optional(),
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

  const { name, email, specialization, department, phoneNo, image, status } =
    parsed.data;

  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor)
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const updated = await prisma.doctor.update({
    where: { id },
    data: {
      ...(specialization !== undefined && { specialization }),
      ...(department !== undefined && { department }),
      ...(phoneNo !== undefined && { phoneNo }),
      ...(status !== undefined && { status }),
      user: {
        update: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(image !== undefined && { image }),
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

  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor)
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: doctor.userId } });
  return NextResponse.json({ success: true });
}
