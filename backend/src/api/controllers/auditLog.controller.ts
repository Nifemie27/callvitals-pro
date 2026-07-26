import type { Request, Response } from "express";
import type { AuditAction } from "@prisma/client";
import { auditLogRepository } from "@/repositories/auditLog.repository";
import { parsePagination } from "@/utils/queryParsing";
import { buildPaginationMeta } from "@/types/pagination";
import { sendSuccess } from "@/utils/apiResponse";

export async function list(req: Request, res: Response): Promise<void> {
  const pagination = parsePagination(req.query);
  const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
  const action =
    typeof req.query.action === "string" ? (req.query.action as AuditAction) : undefined;

  const { items, total } = await auditLogRepository.list({
    ...pagination,
    userId,
    action,
  });
  sendSuccess(res, items, { pagination: buildPaginationMeta(pagination, total) });
}
