import { isIP } from "node:net";

export function limiterIdentity(
  userId: string | undefined,
  headers: Headers,
  onVercel: boolean,
) {
  if (userId) return { signedIn: true, key: `user:${userId}` };
  const ip = onVercel
    ? headers.get("x-vercel-forwarded-for")?.trim()
    : undefined;
  // An unauthenticated client cannot select its bucket on an untrusted host.
  return {
    signedIn: false,
    key: ip && isIP(ip) ? `ip:${ip}` : "anonymous:unknown",
  };
}
