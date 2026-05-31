import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Doctor Validation Schema
const DoctorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  image: z.string().optional(),
  location: z.string().optional(),
  specialization: z.string(),
  status: z
    .enum(["AVAILABLE", "ON_DUTY", "OFF_DUTY", "UNAVAILABLE"])
    .optional()
    .default("AVAILABLE"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = DoctorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const doctor = await prisma.doctor.create({
      data: {
        ...validation.data,
        password: hashedPassword,
      },
    });

    // Exclude sensitive information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...doctorResponse } = doctor;

    return NextResponse.json(doctorResponse, { status: 201 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "an unknown error occurred";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get("specialization");
    const location = searchParams.get("location");

    const doctors = await prisma.doctor.findMany({
      where: {
        ...(specialization ? { specialization } : {}),
        ...(location ? { location } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        specialization: true,
        status: true,
        rating: true,
        image: true,
        location: true,
        appointments: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
    return NextResponse.json(doctors);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "an unknown error occurred";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
