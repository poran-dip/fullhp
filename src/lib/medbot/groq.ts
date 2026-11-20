import { type Candidate, resolveMatch } from "./match";
import { resolveShortlist } from "./ranking";

export async function recommendWithGroq(
  symptoms: string,
  doctors: Candidate[],
  shortlist: boolean,
) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing GROQ_API_KEY");
  const item = {
    type: "object",
    properties: { doctorSlug: { type: "string" }, reason: { type: "string" } },
    required: ["doctorSlug", "reason"],
    additionalProperties: false,
  };
  const schema = shortlist
    ? {
        type: "object",
        properties: { matches: { type: "array", items: item } },
        required: ["matches"],
        additionalProperties: false,
      }
    : item;
  const instruction = shortlist
    ? "Rank up to three unique doctors, best first. Candidate order is a weak prior."
    : "Select one doctor.";
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content:
              instruction +
              " Use only listed slugs. Give a short reason about specialty fit. Do not diagnose or promise outcomes. Directory: " +
              JSON.stringify(
                doctors.map((d) => ({
                  slug: d.slug,
                  department: d.department,
                  specialization: d.specialization,
                  rating: d.avgRating,
                })),
              ),
          },
          { role: "user", content: symptoms },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "recommendation", strict: true, schema },
        },
      }),
      signal: AbortSignal.timeout(60000),
    },
  );
  if (!response.ok)
    throw Object.assign(
      new Error(`Groq ranking request failed (HTTP ${response.status})`),
      { status: response.status },
    );
  const data = await response.json();
  const result = JSON.parse(data.choices?.[0]?.message?.content ?? "");
  return {
    matches: shortlist
      ? resolveShortlist(result.matches, doctors)
      : [resolveMatch(result, doctors)],
    tokens: data.usage?.prompt_tokens ?? 0,
  };
}
