import assert from "node:assert/strict";
import test from "node:test";
import { limiterIdentity } from "../src/lib/medbot/identity.ts";

test("limiter keys use authenticated identity or a single trusted platform address", () => {
  const headers = new Headers({
    "x-vercel-forwarded-for": "192.0.2.1",
    "x-forwarded-for": "192.0.2.42",
  });
  assert.deepEqual(limiterIdentity("123", headers, true), {
    signedIn: true,
    key: "user:123",
  });
  assert.equal(limiterIdentity(undefined, headers, true).key, "ip:192.0.2.1");
  assert.equal(
    limiterIdentity(undefined, headers, false).key,
    "anonymous:unknown",
  );
  for (const ip of ["", "garbage", "192.0.2.1, 192.0.2.2"]) {
    headers.set("x-vercel-forwarded-for", ip);
    assert.equal(
      limiterIdentity(undefined, headers, true).key,
      "anonymous:unknown",
    );
  }
});
