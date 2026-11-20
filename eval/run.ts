import { embed, profileText } from "../src/lib/medbot/embedding";
import { isEmergency } from "../src/lib/medbot/emergency";
import { candidateScore } from "../src/lib/medbot/ranking";
import { recommend } from "../src/lib/medbot/recommend";
import cases from "./cases.json";
import roster from "./roster.json";

async function main() {
  const copies = Number(process.env.EVAL_ROSTER_COPIES ?? 1);
  if (!Number.isSafeInteger(copies) || copies < 1)
    throw new Error("Expected positive EVAL_ROSTER_COPIES");
  const active = Array.from({ length: copies }, (_, i) =>
    roster
      .filter((d) => d.status === "Active")
      .map((d) => ({ ...d, slug: i ? d.slug + "-" + i : d.slug })),
  ).flat();
  const cache = new Map<string, number[]>();
  for (const doctor of active) {
    const text = profileText(doctor);
    if (!cache.has(text))
      cache.set(text, await embed(text, "RETRIEVAL_DOCUMENT"));
  }
  const rows = [];
  const routine = cases.filter((c) => !c.emergency).length;
  for (const mode of ["single", "directory-3", "retrieval-3"]) {
    let hits1 = 0,
      hits3 = 0,
      emergencies = 0,
      errors = 0,
      calls = 0,
      tokens = 0,
      recalled = 0;
    const times: number[] = [];
    for (const c of cases) {
      const urgent = isEmergency(c.text);
      if (urgent || c.emergency) {
        if (urgent && c.emergency) emergencies++;
        else console.error(mode, "triage mismatch", c.text);
        continue;
      }
      const start = performance.now();
      try {
        let doctors = active;
        if (mode === "retrieval-3") {
          const query = await embed(c.text, "RETRIEVAL_QUERY");
          const nearest = active
            .map((d) => {
              const vector = cache.get(profileText(d));
              if (!vector) throw new Error("Missing fixture embedding");
              const similarity = vector.reduce(
                (sum, v, i) => sum + v * (query[i] ?? 0),
                0,
              );
              return { ...d, similarity };
            })
            .sort(
              (a, b) =>
                b.similarity - a.similarity || a.slug.localeCompare(b.slug),
            )
            .slice(0, 10);
          doctors = nearest.sort(
            (a, b) => candidateScore(b) - candidateScore(a),
          );
          if (doctors.some((d) => d.department === c.expectedDepartment))
            recalled++;
        }
        const result = await recommend(c.text, doctors, mode !== "single");
        const departments = result.matches.map((m) => m.department);
        if (departments[0] === c.expectedDepartment) hits1++;
        else console.error(mode, "top-1 miss", c.text, departments);
        if (c.expectedDepartment && departments.includes(c.expectedDepartment))
          hits3++;
        tokens += result.tokens;
        calls++;
      } catch (error) {
        errors++;
        console.error(mode, c.text, error);
      }
      times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    rows.push({
      mode,
      roster: active.length,
      routine,
      hitAt1: hits1 / routine,
      hitAt3: mode === "single" ? "—" : hits3 / routine,
      recallAt10: mode === "retrieval-3" ? recalled / routine : "—",
      emergencyRecall: emergencies / (cases.length - routine),
      errors,
      meanPromptTokens: calls ? tokens / calls : null,
      p50ms: Math.round(times[Math.floor(times.length * 0.5)] ?? 0),
      p95ms: Math.round(times[Math.floor(times.length * 0.95)] ?? 0),
    });
    if (errors) process.exitCode = 1;
  }
  console.table(rows);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
