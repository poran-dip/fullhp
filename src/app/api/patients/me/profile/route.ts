import { NextResponse } from "next/server";
import { z } from "zod";
import { getPatientFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  phoneNo: z.string().min(1).optional(),
  gender: z.string().min(1).optional(),
  dob: z.string().min(1).optional(),
});

export async function PATCH(req: Request) {
  const { session, error } = await requireAuth(["Patient"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, email, phoneNo, gender, dob } = parsed.data;
  const patient = await getPatientFromSession(session);

  const updated = await prisma.patient.update({
    where: { id: patient.id },
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
