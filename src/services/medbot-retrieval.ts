import { embed } from "@/lib/medbot/embedding";
import type { Candidate } from "@/lib/medbot/match";
import { prisma } from "@/lib/prisma";

export async function retrieveDoctors(symptoms: string) {
  const query = await embed(symptoms, "RETRIEVAL_QUERY");
  return prisma.$queryRaw<
    (Candidate & { similarity: number; ratingCount: number | null })[]
  >`
    SELECT d.slug, d.department, d.specialization, d.avg_rating AS "avgRating",
           d.rating_count AS "ratingCount", json_build_object('name', u.name) AS "user",
           (SELECT sum(v * q) FROM unnest(d.medbot_embedding, ${query}::float8[]) AS pair(v,q)) AS similarity
    FROM doctors d JOIN users u ON u.id = d.user_id
    WHERE d.status = 'Active' AND d.medbot_embedding IS NOT NULL
    ORDER BY similarity DESC, d.slug LIMIT 10`;
}
