import { genAI } from "../gemini";

export function profileText(d: { department: string; specialization: string }) {
  return [d.department, d.specialization].join(" — ");
}

export async function embed(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
) {
  const response = await genAI.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { taskType, outputDimensionality: 768 },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values || values.length !== 768 || !values.every(Number.isFinite))
    throw new Error("Invalid embedding");
  const norm = Math.hypot(...values);
  if (!norm) throw new Error("Empty embedding");
  return values.map((v) => v / norm);
}
