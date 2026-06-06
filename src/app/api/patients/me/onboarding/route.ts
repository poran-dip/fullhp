import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const onboardingSchema = z.object({
  phoneNo: z.string().min(1),
  dob: z.string().min(1),
  gender: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { phoneNo, dob, gender } = parsed.data;

  const existing = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Profile already exists" },
      { status: 409 },
    );
  }

  const phoneTaken = await prisma.patient.findUnique({ where: { phoneNo } });
  if (phoneTaken) {
    return NextResponse.json(
      { error: "Phone number already in use" },
      { status: 409 },
    );
  }

  await prisma.patient.create({
    data: {
      userId: session.user.id,
      dob: new Date(dob),
      gender,
      phoneNo,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
