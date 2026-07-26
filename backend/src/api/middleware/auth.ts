import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "@/utils/jwt";
import { ForbiddenError, UnauthorizedError } from "@/errors/AppError";
import { userRepository } from "@/repositories/user.repository";
import { cacheService } from "@/services/cache.service";

const USER_STATUS_CACHE_PREFIX = "cache:user-status:";
const USER_STATUS_TTL_SECONDS = 30;

interface CachedUserStatus {
  role: Role;
  isActive: boolean;
}

/**
 * Verifies the access token's signature and expiry (no DB hit, that's the
 * point of a stateless JWT), then confirms the user still exists and is
 * active. That second check is cached for a short window so a deactivated
 * or role-changed account is locked out within ~30s without paying a
 * database round trip on every single request.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.get("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    const cacheKey = `${USER_STATUS_CACHE_PREFIX}${payload.sub}`;
    const status = await cacheService.wrap<CachedUserStatus | null>(
      cacheKey,
      USER_STATUS_TTL_SECONDS,
      async () => {
        const user = await userRepository.findSafeById(payload.sub);
        return user ? { role: user.role, isActive: user.isActive } : null;
      },
    );

    if (!status) {
      throw new UnauthorizedError("Account no longer exists");
    }
    if (!status.isActive) {
      throw new ForbiddenError("This account has been deactivated");
    }

    req.user = { id: payload.sub, email: payload.email, role: status.role };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
      return;
    }
    // jsonwebtoken throws its own error classes for bad signatures / expiry.
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError("Your role does not permit this action"));
      return;
    }
    next();
  };
}
