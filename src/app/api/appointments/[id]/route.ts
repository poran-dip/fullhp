import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Appointment Update Schema
const AppointmentUpdateSchema = z.object({
  doctorId: z.string().optional(),
  ambulanceId: z.string().optional(),
  dateTime: z.string().datetime().optional(),
  condition: z.string().optional(),
  specialization: z.string().optional(),
  status: z
    .enum(["NEW", "PENDING", "COMPLETED", "CANCELED", "EMERGENCY"])
    .optional(),
  comments: z.string().optional(),
  description: z.string().optional(),
  prescriptions: z.array(z.string()).optional(),
  tests: z.array(z.string()).optional(),
  relatedAppointmentId: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        ambulance: true,
        relatedAppointments: true,
        relatedTo: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        {
          error: "Appointment not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(appointment);
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const validation = AppointmentUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(body.doctorId && { doctor: { connect: { id: body.doctorId } } }),
        ...(body.ambulanceId && {
          ambulance: { connect: { id: body.ambulanceId } },
        }),
        ...(body.relatedAppointmentId && {
          relatedTo: { connect: { id: body.relatedAppointmentId } },
        }),
        dateTime: body.dateTime ? new Date(body.dateTime) : undefined,
        condition: body.condition,
        specialization: body.specialization,
        status: body.status,
        comments: body.comments,
        description: body.description,
        prescriptions: body.prescriptions,
        tests: body.tests,
      },
      include: {
        patient: true,
        doctor: true,
        ambulance: true,
      },
    });

    return NextResponse.json(appointment);
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const relatedAppointments = await prisma.appointment.findMany({
      where: {
        relatedTo: { some: { id } },
      },
      select: { id: true },
    });

    // Update related appointments in a transaction
    await prisma.$transaction(async (tx) => {
      for (const related of relatedAppointments) {
        await tx.appointment.update({
          where: { id: related.id },
          data: {
            relatedTo: {
              disconnect: { id },
            },
          },
        });
      }

      await tx.appointment.delete({
        where: { id },
      });
    });

    return NextResponse.json<{ message: string }>({
      message: "Appointment deleted successfully",
    });
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
