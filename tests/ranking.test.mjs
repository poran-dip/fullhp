import assert from "node:assert/strict";
import test from "node:test";
import { candidateScore, resolveShortlist } from "../src/lib/medbot/ranking.ts";

test("rating evidence only nudges similarity", () => {
  const score = (similarity, avgRating, ratingCount) =>
    candidateScore({ similarity, avgRating, ratingCount });
  assert.ok(score(0.8, null, null) > score(0.7, 5, 100));
  assert.ok(score(0.8, 4.8, 40) > score(0.8, 5, 1));
  assert.equal(score(0.8, null, null), score(0.8, 3.5, 10));
});
test("invalid or duplicated shortlist fails closed", () => {
  const d = {
    slug: "x",
    user: { name: "X" },
    department: "A",
    specialization: "A",
    avgRating: null,
  };
  const m = { doctorSlug: "x", reason: "fit" };
  assert.equal(resolveShortlist([m], [d])[0].doctorSlug, "x");
  for (const value of [[], [m, m], [{ ...m, doctorSlug: "z" }]])
    assert.throws(() => resolveShortlist(value, [d, d]));
});
