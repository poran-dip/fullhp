import assert from "node:assert/strict";
import test from "node:test";
import { isEmergency } from "../src/lib/medbot/emergency.ts";

test("routes red flags even after a negated or historical symptom", () => {
  for (const text of [
    "chest pain",
    "no chest pain but I can’t breathe",
    "slurred speech",
    "heavy bleeding",
    "suicidal thoughts",
    "family history of chest pain but my face is drooping",
  ])
    assert.equal(isEmergency(text), true, text);
  for (const text of [
    "no chest pain",
    "family history of chest pain",
    "itchy knee",
  ])
    assert.equal(isEmergency(text), false, text);
});
