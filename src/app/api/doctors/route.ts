import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(4),
  slug: z.string().min(2),
  specialization: z.string().min(1),
  department: z.string().min(1),
  phoneNo: z.string().min(1),
  image: z.string().optional(),
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

  const {
    name,
    email,
    password,
    slug,
    specialization,
    department,
    phoneNo,
    image,
  } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { doctor: { phoneNo } }] },
  });
  if (existing) {
    const conflict = existing.email === email ? "Email" : "Phone number";
    return NextResponse.json(
      { error: `${conflict} already in use` },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      image: image || getDicebearUrl(name),
      role: "Doctor",
      doctor: {
        create: {
          slug,
          specialization,
          department,
          phoneNo,
          status: "Active",
        },
      },
    },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
