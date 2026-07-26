import type { RefreshToken, User } from "@prisma/client";
import { prisma } from "@/database/prisma";

interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
}

export type RefreshTokenWithUser = RefreshToken & { user: User };

class RefreshTokenRepository {
  create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  findValidByHash(tokenHash: string): Promise<RefreshTokenWithUser | null> {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
  }

  /** Unfiltered lookup, used to detect reuse of an already-rotated/revoked token. */
  findByHash(tokenHash: string): Promise<RefreshTokenWithUser | null> {
    return prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revoke(id: string, replacedBy?: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedBy },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Housekeeping: drop tokens that are long past expiry so the table doesn't grow forever. */
  async deleteExpired(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
