import { randomBytes, createHash } from "node:crypto";

/**
 * Refresh tokens are opaque, high-entropy random strings, not JWTs.
 * Unlike access tokens they must be individually revocable (logout,
 * "log out everywhere", theft response), which requires a database row
 * per token; there is no benefit to also making them self-describing JWTs.
 * Only the SHA-256 hash is ever persisted, so a leaked database dump
 * doesn't hand out valid sessions.
 */
export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
