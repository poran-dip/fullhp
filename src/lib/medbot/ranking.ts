import { type Candidate, resolveMatch } from "./match";

export function candidateScore(d: {
  similarity: number;
  avgRating: number | null;
  ratingCount: number | null;
}) {
  const count = d.avgRating === null ? 0 : (d.ratingCount ?? 0);
  const rating = ((d.avgRating ?? 3.5) * count + 35) / (count + 10);
  return 0.95 * d.similarity + (0.05 * rating) / 5;
}

export function resolveShortlist(value: unknown, doctors: Candidate[]) {
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > Math.min(3, doctors.length)
  ) {
    throw new Error("Invalid shortlist length");
  }
  const matches = value.map((item) => resolveMatch(item, doctors));
  if (new Set(matches.map((m) => m.doctorSlug)).size !== matches.length)
    throw new Error("Duplicate doctor");
  return matches;
}
