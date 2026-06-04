import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
  gender: z.string().min(1),
  dob: z.string().min(1),
  phoneNo: z.string().min(1),
});

const getDicebearUrl = (name: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;

export async function POST(req: Request) {
  const { error } = await requireAuth(["Admin"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, email, gender, dob, phoneNo } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { patient: { phoneNo } }] },
  });
  if (existing) {
    const conflict = existing.email === email ? "Email" : "Phone number";
    return NextResponse.json(
      { error: `${conflict} already in use` },
      { status: 409 },
    );
  }

  const tempPassword = crypto.randomUUID();
  const hashed = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      image: getDicebearUrl(name),
      role: "Patient",
      patient: {
        create: {
          gender,
          dob: new Date(dob),
          phoneNo,
        },
      },
    },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
