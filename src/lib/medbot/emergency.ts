// Conservative routing cues, not a diagnostic or exhaustive triage screen.
const cues =
  /\b(chest (pain|pressure)|pain in (my|the) chest|trouble breathing|difficulty breathing|shortness of breath|can(?:not|'t) (?:catch my breath|breathe)|struggling to breathe|face (?:is )?drooping|facial droop|slurred speech|signs of (?:a )?stroke|sudden(?:ly)? (?:one.sided weakness|weakness on one side)|(?:severe|heavy|uncontrolled) bleeding|bleed(?:ing)? (?:that )?(?:will not|won't|doesn't) stop|suicidal(?: thoughts)?|thoughts of suicide|(?:kill|hurt) myself|(?:want to|going to) end my life)\b/gi;

export function isEmergency(text: string) {
  const normalized = text.toLowerCase().replaceAll("’", "'");
  for (const match of normalized.matchAll(cues)) {
    const prefix = normalized.slice(0, match.index);
    if (
      /\b(?:no|without|denies|no longer (?:have|having)|family history of)\s+$/.test(
        prefix,
      )
    )
      continue;
    return true;
  }
  return false;
}

export const emergencyMessage =
  "These symptoms may need immediate help. Call your local emergency number or seek emergency care now. If you might harm yourself, ask someone nearby to stay with you while you get help.";
