import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      message: "OK",
      doctorId: doctor.id,
      email: doctor.email,
      role: "doctor",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
