import rateLimit from "express-rate-limit";
import { env } from "@/config/env";
import type { ErrorEnvelope } from "@/utils/apiResponse";

function tooManyRequestsBody(message: string): ErrorEnvelope {
  return {
    success: false,
    data: null,
    message,
    timestamp: new Date().toISOString(),
  };
}

/** Applied globally: generous enough not to bother real usage, tight enough to blunt abuse. */
export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooManyRequestsBody("Too many requests, please try again later"),
});

/** Applied to /api/auth/login and /api/auth/register: brute-force / credential-stuffing guard. */
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: tooManyRequestsBody(
    "Too many authentication attempts, please try again later",
  ),
});
