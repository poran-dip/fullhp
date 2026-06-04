import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(4),
});

export async function PATCH(req: Request) {
  const { session, error } = await requireAuth(["Doctor"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.password) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password required" },
        { status: 400 },
      );
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 403 },
      );
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}
