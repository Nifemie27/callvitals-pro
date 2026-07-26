import type { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";

interface AuditLogListFilters {
  page: number;
  limit: number;
  userId?: string;
  action?: AuditAction;
}

export type AuditLogWithActor = AuditLog & {
  user: { id: string; email: string; name: string } | null;
};

class AuditLogRepository {
  async list(
    filters: AuditLogListFilters,
  ): Promise<{ items: AuditLogWithActor[]; total: number }> {
    const where: Prisma.AuditLogWhereInput = {
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.action ? { action: filters.action } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }
}

export const auditLogRepository = new AuditLogRepository();
