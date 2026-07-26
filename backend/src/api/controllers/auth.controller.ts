import type { Request, Response } from "express";
import { authService } from "@/services/auth.service";
import { userRepository } from "@/repositories/user.repository";
import { sendCreated, sendSuccess } from "@/utils/apiResponse";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
} from "@/utils/cookies";
import { UnauthorizedError, NotFoundError } from "@/errors/AppError";
import type { LoginInput, RegisterInput, RequestContext } from "@/dto/auth.dto";

function contextFrom(req: Request): RequestContext {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body as RegisterInput, contextFrom(req));
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendCreated(
    res,
    {
      user: result.user,
      accessToken: result.tokens.accessToken,
      accessTokenExpiresIn: result.tokens.accessTokenExpiresIn,
    },
    "Account created",
  );
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body as LoginInput, contextFrom(req));
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendSuccess(
    res,
    {
      user: result.user,
      accessToken: result.tokens.accessToken,
      accessTokenExpiresIn: result.tokens.accessTokenExpiresIn,
    },
    { message: "Login successful" },
  );
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE_NAME];
  if (!token) {
    throw new UnauthorizedError("No refresh token provided");
  }

  const result = await authService.refresh(token, contextFrom(req));
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendSuccess(
    res,
    {
      user: result.user,
      accessToken: result.tokens.accessToken,
      accessTokenExpiresIn: result.tokens.accessTokenExpiresIn,
    },
    { message: "Token refreshed" },
  );
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE_NAME];
  if (token) {
    await authService.logout(token, contextFrom(req));
  }
  clearRefreshTokenCookie(res);
  sendSuccess(res, null, { message: "Logged out" });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await userRepository.findSafeById(req.user!.id);
  if (!user) {
    throw new NotFoundError("User");
  }
  sendSuccess(res, user);
}
