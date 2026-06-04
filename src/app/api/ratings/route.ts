import { NextResponse } from "next/server";
import { z } from "zod";
import { getPatientFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const writeSchema = z.object({
  doctorId: z.string(),
  appointmentId: z.string(),
  stars: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const deleteSchema = z.object({
  doctorId: z.string(),
});

export async function POST(req: Request) {
  const { session, error } = await requireAuth(["Patient"]);
  if (error) return error;

  const body = await req.json();
  const parsed = writeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { doctorId, stars, comment } = parsed.data;
  const patient = await getPatientFromSession(session);

  const existing = await prisma.rating.findUnique({
    where: { patientId_doctorId: { patientId: patient.id, doctorId } },
  });
  if (existing)
    return NextResponse.json(
      { error: "Rating already exists" },
      { status: 409 },
    );

  const rating = await prisma.rating.create({
    data: {
      patientId: patient.id,
      doctorId,
      stars,
      ...(comment !== undefined && { comment }),
    },
  });

  await updateDoctorRating(doctorId);
  return NextResponse.json(rating, { status: 201 });
}

export async function PATCH(req: Request) {
  const { session, error } = await requireAuth(["Patient"]);
  if (error) return error;

  const body = await req.json();
  const parsed = writeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { doctorId, stars, comment } = parsed.data;
  const patient = await getPatientFromSession(session);

  const existing = await prisma.rating.findUnique({
    where: { patientId_doctorId: { patientId: patient.id, doctorId } },
  });
  if (!existing)
    return NextResponse.json({ error: "Rating not found" }, { status: 404 });

  const updated = await prisma.rating.update({
    where: { patientId_doctorId: { patientId: patient.id, doctorId } },
    data: {
      stars,
      ...(comment !== undefined && { comment }),
    },
  });

  await updateDoctorRating(doctorId);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const { session, error } = await requireAuth(["Patient"]);
  if (error) return error;

  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { doctorId } = parsed.data;
  const patient = await getPatientFromSession(session);

  const existing = await prisma.rating.findUnique({
    where: { patientId_doctorId: { patientId: patient.id, doctorId } },
  });
  if (!existing)
    return NextResponse.json({ error: "Rating not found" }, { status: 404 });

  await prisma.rating.delete({
    where: { patientId_doctorId: { patientId: patient.id, doctorId } },
  });

  await updateDoctorRating(doctorId);
  return NextResponse.json({ success: true });
}

async function updateDoctorRating(doctorId: string) {
  const ratings = await prisma.rating.findMany({ where: { doctorId } });
  const count = ratings.length;
  const avg =
    count > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / count : null;

  await prisma.doctor.update({
    where: { id: doctorId },
    data: { avgRating: avg, ratingCount: count },
  });
}
