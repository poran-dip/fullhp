import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { s3 } from "@/lib/s3";

const BUCKET = "avatars";
const STORAGE_URL = process.env.STORAGE_URL;

if (!STORAGE_URL) {
  throw new Error("Missing storage URL");
}

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${session.user.id}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const converted = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: path,
      Body: converted,
      ContentType: "image/jpeg",
    }),
  );

  const publicUrl = `${STORAGE_URL}/${BUCKET}/${path}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: publicUrl },
  });

  return NextResponse.json({ url: publicUrl });
}
