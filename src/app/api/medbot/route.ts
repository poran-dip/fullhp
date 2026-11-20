import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { emergencyMessage, isEmergency } from "@/lib/medbot/emergency";
import { recommend } from "@/lib/medbot/recommend";
import { getActiveDoctors } from "@/services/medbot";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();

    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return NextResponse.json(
        { error: "Symptoms are required." },
        { status: 400 },
      );
    }

    if (isEmergency(symptoms))
      return NextResponse.json({ kind: "urgent", message: emergencyMessage });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const { doctors, error: dbError } = await getActiveDoctors();

    if (dbError || doctors.length === 0) {
      return NextResponse.json(
        { error: "No doctors available at this time." },
        { status: 503 },
      );
    }

    const { match } = await recommend(symptoms, doctors);
    return NextResponse.json(match);
  } catch (error) {
    console.error("MedBot error:", error);

    const status = (error as { status?: number })?.status;

    if (status === 503) {
      return NextResponse.json(
        { error: "Servers are being fried right now, try again in a moment." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "We had issues processing that, try again later." },
      { status: 500 },
    );
  }
}
