import { genAI } from "../gemini";
import { type Candidate, resolveMatch } from "./match";

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

export async function recommend(symptoms: string, doctors: Candidate[]) {
  const doctorList = doctors
    .map(
      (d) =>
        `- Name: ${d.user.name} | Slug: ${d.slug} | Department: ${d.department} | Specialization: ${d.specialization} | Rating: ${d.avgRating ?? "unrated"}`,
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

  return {
    match: resolveMatch(result, doctors),
    tokens: response.usageMetadata?.promptTokenCount ?? 0,
  };
}
