import assert from "node:assert/strict";
import test from "node:test";
import { resolveMatch } from "../src/lib/medbot/match.ts";

const doctor = {
  slug: "dr-a",
  department: "A",
  specialization: "B",
  avgRating: null,
  user: { name: "A" },
};
test("resolves only supplied candidates and uses directory metadata", () => {
  assert.equal(
    resolveMatch({ doctorSlug: "dr-a", doctorName: "wrong", reason: " fit " }, [
      doctor,
    ]).doctorName,
    "A",
  );
  for (const value of [
    null,
    {},
    { doctorSlug: "other", reason: "fit" },
    { doctorSlug: "dr-a", reason: " " },
  ])
    assert.throws(() => resolveMatch(value, [doctor]));
});
