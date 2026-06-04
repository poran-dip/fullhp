import { NextResponse } from "next/server";
import { z } from "zod";
import { getDoctorFromSession, requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const daySchema = z.object({
  id: z.string().nullable().optional(),
  day: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  startTime: z.string(),
  endTime: z.string(),
});

const schema = z.object({
  days: z.array(daySchema),
  deletedIds: z.array(z.string()),
});

export async function PATCH(req: Request) {
  const { session, error } = await requireAuth(["Doctor"]);
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { days, deletedIds } = parsed.data;
  const doctor = await getDoctorFromSession(session);

  // ensure schedule exists
  let schedule = await prisma.schedule.findUnique({
    where: { doctorId: doctor.id },
  });
  if (!schedule) {
    schedule = await prisma.schedule.create({ data: { doctorId: doctor.id } });
  }

  await prisma.$transaction([
    // delete removed days
    ...(deletedIds.length > 0
      ? [prisma.day.deleteMany({ where: { id: { in: deletedIds } } })]
      : []),
    // upsert each day
    ...days.map((d) =>
      d.id
        ? prisma.day.update({
            where: { id: d.id },
            data: { day: d.day, startTime: d.startTime, endTime: d.endTime },
          })
        : prisma.day.create({
            data: {
              day: d.day,
              startTime: d.startTime,
              endTime: d.endTime,
              scheduleId: schedule.id,
            },
          }),
    ),
  ]);

  const updated = await prisma.schedule.findUnique({
    where: { id: schedule.id },
    include: { days: true },
  });

  return NextResponse.json(updated);
}
