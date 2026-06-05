import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { getActiveDoctors } from "@/services/medbot";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

const SYSTEM_PROMPT = (doctorList: string) => `
You are a medical triage assistant. Based on the patient's symptoms, recommend the most appropriate doctor from the list below.

AVAILABLE DOCTORS:
${doctorList}

INSTRUCTIONS:
- Analyze the symptoms carefully
- Pick the single most appropriate doctor from the list above
- Return ONLY valid JSON, no explanation, no markdown, no extra text
- Do not compare with or reference other doctors by name or specialty
- The reason should be warm and reassuring, e.g. "Dr. X is an excellent choice for your symptoms" — not clinical or comparative language like "most appropriate" or "best suited"

RESPONSE FORMAT:
{
  "department": "string",
  "doctorId": "string",
  "doctorName": "string",
  "reason": "string"
}
`;

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const { symptoms } = await req.json();

    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return NextResponse.json(
        { error: "Symptoms are required." },
        { status: 400 },
      );
    }

    const { doctors, error: dbError } = await getActiveDoctors();

    if (dbError || doctors.length === 0) {
      return NextResponse.json(
        { error: "No doctors available at this time." },
        { status: 503 },
      );
    }

    const doctorList = doctors
      .map(
        (d) =>
          `- ID: ${d.id} | Name: ${d.user.name} | Department: ${d.department} | Specialization: ${d.specialization} | Rating: ${d.avgRating ?? "unrated"}`,
      )
      .join("\n");

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Patient symptoms: ${symptoms}` }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT(doctorList),
        temperature: 0.3,
      },
    });

    const raw = response.text?.trim() ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    if (
      !result.department ||
      !result.doctorId ||
      !result.doctorName ||
      !result.reason
    ) {
      throw new Error("Incomplete response from model");
    }

    const matched = doctors.find((d) => d.id === result.doctorId);

    return NextResponse.json({
      department: result.department,
      doctorId: result.doctorId,
      doctorName: result.doctorName,
      reason: result.reason,
      avgRating: matched?.avgRating ?? null,
    });
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
