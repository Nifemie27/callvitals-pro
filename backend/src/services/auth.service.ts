import { AuditAction, Role } from "@prisma/client";
import { userRepository } from "@/repositories/user.repository";
import { refreshTokenRepository } from "@/repositories/refreshToken.repository";
import { hashPassword, verifyPassword } from "@/utils/password";
import { signAccessToken } from "@/utils/jwt";
import { generateRefreshToken, hashRefreshToken } from "@/utils/refreshToken";
import { ConflictError, ForbiddenError, UnauthorizedError } from "@/errors/AppError";
import { auditService } from "@/services/audit.service";
import { env } from "@/config/env";
import type {
  AuthResult,
  AuthTokens,
  LoginInput,
  RegisterInput,
  RequestContext,
} from "@/dto/auth.dto";
import { toSafeUser } from "@/dto/auth.dto";
import type { User } from "@prisma/client";

const REFRESH_TTL_MS = env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000;

class AuthService {
  private async issueTokens(user: User, context: RequestContext): Promise<AuthTokens> {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken();

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });

    return { accessToken, refreshToken, accessTokenExpiresIn: env.jwt.accessTtl };
  }

  async register(input: RegisterInput, context: RequestContext): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
      role: Role.ANALYST,
    });

    await auditService.record(
      AuditAction.USER_REGISTER,
      { userId: user.id, ...context },
      { entityType: "User", entityId: user.id },
    );

    const tokens = await this.issueTokens(user, context);
    return { user: toSafeUser(user), tokens };
  }

  async login(input: LoginInput, context: RequestContext): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);

    const passwordMatches = user
      ? await verifyPassword(input.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      await auditService.record(AuditAction.USER_LOGIN_FAILED, {
        userId: user?.id ?? null,
        ...context,
      });
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new ForbiddenError("This account has been deactivated");
    }

    await auditService.record(
      AuditAction.USER_LOGIN,
      { userId: user.id, ...context },
      { entityType: "User", entityId: user.id },
    );

    const tokens = await this.issueTokens(user, context);
    return { user: toSafeUser(user), tokens };
  }

  async refresh(rawToken: string, context: RequestContext): Promise<AuthResult> {
    const tokenHash = hashRefreshToken(rawToken);
    const record = await refreshTokenRepository.findByHash(tokenHash);

    if (!record) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (record.revokedAt) {
      // The token was already rotated or explicitly revoked, yet someone is
      // presenting it again, likely theft of an old token. Burn every
      // active session for this user rather than trust it.
      await refreshTokenRepository.revokeAllForUser(record.userId);
      await auditService.record(AuditAction.USER_LOGOUT, {
        userId: record.userId,
        ...context,
      });
      throw new UnauthorizedError("Refresh token reuse detected, all sessions revoked");
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token has expired");
    }

    if (!record.user.isActive) {
      throw new ForbiddenError("This account has been deactivated");
    }

    const tokens = await this.issueTokens(record.user, context);
    await refreshTokenRepository.revoke(record.id);

    return { user: toSafeUser(record.user), tokens };
  }

  async logout(rawToken: string, context: RequestContext): Promise<void> {
    const tokenHash = hashRefreshToken(rawToken);
    const record = await refreshTokenRepository.findValidByHash(tokenHash);

    if (record) {
      await refreshTokenRepository.revoke(record.id);
      await auditService.record(AuditAction.USER_LOGOUT, {
        userId: record.userId,
        ...context,
      });
    }
  }
}

export const authService = new AuthService();
