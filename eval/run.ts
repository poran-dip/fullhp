import { isEmergency } from "../src/lib/medbot/emergency";
import { recommend } from "../src/lib/medbot/recommend";
import cases from "./cases.json";
import roster from "./roster.json";

async function main() {
  const active = roster.filter((d) => d.status === "Active");
  let hits = 0;
  let urgent = 0;
  let tokens = 0;
  let calls = 0;
  const start = performance.now();
  for (const c of cases) {
    if (isEmergency(c.text)) {
      if (c.emergency) urgent++;
      else console.error("Unexpected emergency:", c.text);
      continue;
    }
    if (c.emergency) {
      console.error("Missed emergency:", c.text);
      continue;
    }
    const result = await recommend(c.text, active);
    calls++;
    tokens += result.tokens;
    if (result.match.department === c.expectedDepartment) hits++;
    else console.error("Miss:", c.text, result.match.department);
  }
  console.table([
    {
      mode: "full-directory single",
      hits,
      routine: cases.filter((c) => !c.emergency).length,
      urgent,
      calls,
      meanPromptTokens: tokens / calls,
      elapsedMs: performance.now() - start,
    },
  ]);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
