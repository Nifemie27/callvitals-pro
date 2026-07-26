import { Role } from "@prisma/client";
import { signAccessToken, verifyAccessToken } from "@/utils/jwt";

describe("access token", () => {
  const payload = { sub: "user-1", email: "user@example.com", role: Role.ANALYST };

  it("round-trips a signed token back to its original payload", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("rejects a token with a tampered signature", () => {
    const token = signAccessToken(payload);
    const lastChar = token.at(-1);
    const flipped = lastChar === "a" ? "b" : "a";
    const tampered = token.slice(0, -1) + flipped;
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it("rejects a malformed token", () => {
    expect(() => verifyAccessToken("not-a-jwt")).toThrow();
  });
});
