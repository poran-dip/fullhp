import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { emergencyMessage, isEmergency } from "@/lib/medbot/emergency";
import { limiterIdentity } from "@/lib/medbot/identity";
import { candidateScore } from "@/lib/medbot/ranking";
import { recommend } from "@/lib/medbot/recommend";
import { getActiveDoctors } from "@/services/medbot";
import { retrieveDoctors } from "@/services/medbot-retrieval";

const redis = Redis.fromEnv();
const signedInLimit = new Ratelimit({
  redis,
  prefix: "medbot:account",
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

const guestLimit = new Ratelimit({
  redis,
  prefix: "medbot:guest",
  limiter: Ratelimit.slidingWindow(5, "1 h"),
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

    const session = await auth();
    const identity = limiterIdentity(
      session?.user?.id,
      req.headers,
      process.env.VERCEL === "1",
    );
    const limiter = identity.signedIn ? signedInLimit : guestLimit;
    const { success } = await limiter.limit(identity.key);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const shortlist = process.env.MEDBOT_MODE === "retrieval";
    const doctors = shortlist
      ? (await retrieveDoctors(symptoms)).sort(
          (a, b) => candidateScore(b) - candidateScore(a),
        )
      : (await getActiveDoctors()).doctors;

    if (doctors.length === 0) {
      return NextResponse.json(
        { error: "No doctors available at this time." },
        { status: 503 },
      );
    }

    const { matches } = await recommend(symptoms, doctors, shortlist);
    return NextResponse.json({ kind: "matches", matches });
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
