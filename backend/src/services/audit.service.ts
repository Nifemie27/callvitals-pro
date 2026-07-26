import type { Request } from "express";
import { AuditAction } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { logger } from "@/utils/logger";

export interface AuditActor {
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

interface AuditDetails {
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export function actorFromRequest(req: Request, userId?: string | null): AuditActor {
  return {
    userId: userId ?? null,
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  };
}

/**
 * Records who did what, to what, and when. Failures here are logged but
 * never thrown. A full audit table should never be the reason a user
 * request fails. For strict compliance workloads this would instead write
 * to a durable outbox and be retried, but that's beyond this project's scope.
 */
class AuditService {
  async record(
    action: AuditAction,
    actor: AuditActor,
    details: AuditDetails = {},
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          userId: actor.userId,
          ipAddress: actor.ipAddress,
          userAgent: actor.userAgent,
          entityType: details.entityType,
          entityId: details.entityId,
          metadata: details.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (error) {
      logger.error("Failed to write audit log", {
        action,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const auditService = new AuditService();
export { AuditAction };
