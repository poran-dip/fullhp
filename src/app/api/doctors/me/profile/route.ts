import { NextResponse } from "next/server";
import { z } from "zod";
import { getDoctorFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  phoneNo: z.string().min(1).optional(),
  specialization: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  image: z.string().optional(),
});

export async function PATCH(req: Request) {
  const { session, error } = await requireAuth(["Doctor"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, email, phoneNo, specialization, department, image } =
    parsed.data;
  const doctor = await getDoctorFromSession(session);

  const updated = await prisma.doctor.update({
    where: { id: doctor.id },
    data: {
      ...(specialization !== undefined && { specialization }),
      ...(department !== undefined && { department }),
      ...(phoneNo !== undefined && { phoneNo }),
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
