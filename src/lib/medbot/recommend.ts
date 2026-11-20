import { genAI } from "../gemini";
import { recommendWithGroq } from "./groq";
import { type Candidate, resolveMatch } from "./match";

import { resolveShortlist } from "./ranking";

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
  "doctorSlug": "string",
  "reason": "string"
}
`;

export async function recommend(
  symptoms: string,
  doctors: Candidate[],
  shortlist = false,
) {
  if (process.env.MEDBOT_PROVIDER === "groq")
    return recommendWithGroq(symptoms, doctors, shortlist);
  const doctorList = doctors
    .map(
      (d) =>
        `- Name: ${d.user.name} | Slug: ${d.slug} | Department: ${d.department} | Specialization: ${d.specialization} | Rating: ${d.avgRating ?? "unrated"}`,
    )
    .join("\n");

  const response = await genAI.models.generateContent({
    model: process.env.MEDBOT_MODEL?.trim() || "gemini-3.8-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `Patient symptoms: ${symptoms}` }],
      },
    ],
    config: {
      systemInstruction: shortlist
        ? `Match symptoms to up to three suitable doctors in best-first order. Candidate order is a weak prior. Give one brief reason about specialty fit per choice. Do not diagnose or promise an outcome. Return a JSON array of {doctorSlug, reason} objects. Choose unique slugs only from these records:\n${doctorList}`
        : SYSTEM_PROMPT(doctorList),
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const raw = response.text?.trim() ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const result = JSON.parse(cleaned);

  return {
    matches: shortlist
      ? resolveShortlist(result, doctors)
      : [resolveMatch(result, doctors)],
    tokens: response.usageMetadata?.promptTokenCount ?? 0,
  };
}
