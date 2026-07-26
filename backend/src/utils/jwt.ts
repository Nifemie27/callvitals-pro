import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "@/config/env";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtl,
    issuer: env.jwt.issuer,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwt.accessSecret, {
    issuer: env.jwt.issuer,
  });
  return decoded as AccessTokenPayload;
}
