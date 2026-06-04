import { NextResponse } from "next/server";
import { z } from "zod";
import { getDoctorFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["Active", "Inactive", "OnLeave"]),
});

export async function PATCH(req: Request) {
  const { session, error } = await requireAuth(["Doctor"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const doctor = await getDoctorFromSession(session);
  const updated = await prisma.doctor.update({
    where: { id: doctor.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
