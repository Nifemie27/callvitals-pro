import type { CookieOptions, Response } from "express";
import { env } from "@/config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.secure ? "none" : "lax",
    domain: env.cookie.domain,
    path: "/api/auth",
    maxAge: env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000,
  };
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, cookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
}

export { REFRESH_COOKIE_NAME };
