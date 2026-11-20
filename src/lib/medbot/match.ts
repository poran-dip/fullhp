export interface Candidate {
  slug: string;
  department: string;
  specialization: string;
  avgRating: number | null;
  user: { name: string | null };
}

export function resolveMatch(value: unknown, doctors: Candidate[]) {
  if (
    !value ||
    typeof value !== "object" ||
    !("doctorSlug" in value) ||
    !("reason" in value) ||
    typeof value.reason !== "string" ||
    !value.reason.trim()
  ) {
    throw new Error("Invalid recommendation");
  }
  const doctor = doctors.find((d) => d.slug === value.doctorSlug);
  if (!doctor) throw new Error("Unknown doctor slug");
  return {
    doctorSlug: doctor.slug,
    department: doctor.department,
    doctorName: doctor.user.name ?? doctor.slug,
    avgRating: doctor.avgRating,
    reason: value.reason.trim(),
  };
}
