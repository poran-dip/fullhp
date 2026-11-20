const specialties: Record<string, string[]> = {
  Dermatology: ["eczema", "acne", "scalp conditions"],
  Orthopedics: ["knee injuries", "shoulder problems", "sports injuries"],
  Ophthalmology: ["dry eye", "lens disorders", "routine eye care"],
  ENT: ["hearing loss", "nasal disorders", "voice disorders"],
  Gastroenterology: ["reflux", "bowel disorders", "digestive health"],
  Neurology: ["headache clinic", "movement disorders", "peripheral nerves"],
  Cardiology: [
    "heart rhythm disorders",
    "preventive cardiology",
    "heart failure",
    "valve disease",
  ],
  Endocrinology: [
    "diabetes",
    "thyroid disorders",
    "metabolic bone disease",
    "adrenal disorders",
  ],
  Rheumatology: [
    "inflammatory arthritis",
    "lupus",
    "gout",
    "connective tissue disease",
  ],
  Pulmonology: [
    "asthma",
    "sleep medicine",
    "interstitial lung disease",
    "chronic cough",
  ],
  Urology: [
    "kidney stones",
    "prostate disorders",
    "bladder disorders",
    "reconstructive urology",
  ],
  Nephrology: [
    "chronic kidney disease",
    "dialysis",
    "hypertension",
    "glomerular disease",
  ],
  "General Medicine": [
    "primary care",
    "preventive medicine",
    "adult medicine",
    "geriatric medicine",
  ],
  Pediatrics: [
    "general pediatrics",
    "pediatric allergy",
    "developmental pediatrics",
    "adolescent medicine",
  ],
};

export function buildEvalRoster(size = 100) {
  if (!Number.isSafeInteger(size) || size < 1)
    throw new Error("Expected a positive integer roster size");
  const profiles = Object.entries(specialties).flatMap(([department, areas]) =>
    areas.map((specialization, index) => ({
      department,
      specialization,
      index,
      areas,
    })),
  );
  const active = Array.from({ length: size }, (_, i) => {
    const profile = profiles[i % profiles.length];
    if (!profile) throw new Error("Empty specialty catalog");
    const { department, specialization, index, areas } = profile;
    const round = Math.floor(i / profiles.length);
    const number = index + round * areas.length;
    // Later cohorts share a primary specialty and rotate a secondary focus.
    const offset = round % areas.length;
    const focus = offset
      ? specialization + " and " + areas[(index + offset) % areas.length]
      : specialization;
    const ratings = [
      { avgRating: null, ratingCount: 0 },
      { avgRating: 4.6, ratingCount: 40 },
      { avgRating: 5, ratingCount: 1 },
    ] as const;
    return {
      slug: `${department.toLowerCase().replaceAll(" ", "-")}-${number}`,
      user: { name: `Dr. ${department} ${number + 1}` },
      department,
      specialization: focus,
      status: "Active",
      ...ratings[number % 3]!,
    };
  });
  return [
    ...active,
    { ...active[0]!, slug: "inactive", status: "Inactive" },
    { ...(active[1] ?? active[0])!, slug: "on-leave", status: "OnLeave" },
  ];
}
