import type { ParsedQs } from "qs";
import { AuditAction } from "@prisma/client";
import { callRecordRepository } from "@/repositories/callRecord.repository";
import { NotFoundError, BadRequestError } from "@/errors/AppError";
import { buildPaginationMeta, type PaginationMeta } from "@/types/pagination";
import { parseCallFilters, parseCallSort, parsePagination } from "@/utils/queryParsing";
import {
  toCallRecordResponse,
  type CallRecordResponse,
  type CreateCallRecordBody,
  type UpdateCallRecordBody,
} from "@/dto/callRecord.dto";
import { cacheService, CACHE_PREFIXES } from "@/services/cache.service";
import { auditService, type AuditActor } from "@/services/audit.service";
import { env } from "@/config/env";

interface ListResult {
  items: CallRecordResponse[];
  pagination: PaginationMeta;
}

function validateTimeRange(startTime: Date, endTime: Date): void {
  if (endTime <= startTime) {
    throw new BadRequestError("endTime must be after startTime");
  }
}

class CallRecordService {
  async list(query: ParsedQs): Promise<ListResult> {
    const pagination = parsePagination(query);
    const sort = parseCallSort(query);
    const filters = parseCallFilters(query);

    const cacheKey = `${CACHE_PREFIXES.calls}list:${JSON.stringify({ pagination, sort, filters })}`;

    return cacheService.wrap(cacheKey, env.redis.callsTtlSeconds, async () => {
      const { items, total } = await callRecordRepository.list(filters, pagination, sort);
      return {
        items: items.map(toCallRecordResponse),
        pagination: buildPaginationMeta(pagination, total),
      };
    });
  }

  async getById(id: string): Promise<CallRecordResponse> {
    const record = await callRecordRepository.findById(id);
    if (!record) throw new NotFoundError("Call record");
    return toCallRecordResponse(record);
  }

  async create(
    input: CreateCallRecordBody,
    actor: AuditActor,
  ): Promise<CallRecordResponse> {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    validateTimeRange(startTime, endTime);

    const record = await callRecordRepository.create({
      callerName: input.callerName,
      callerNumber: input.callerNumber,
      receiverNumber: input.receiverNumber,
      city: input.city,
      direction: input.direction,
      status: input.status,
      durationSeconds: input.durationSeconds,
      cost: input.cost,
      startTime,
      endTime,
    });

    await this.invalidateCaches();
    await auditService.record(AuditAction.CALL_CREATED, actor, {
      entityType: "CallRecord",
      entityId: record.id,
    });

    return toCallRecordResponse(record);
  }

  async update(
    id: string,
    input: UpdateCallRecordBody,
    actor: AuditActor,
  ): Promise<CallRecordResponse> {
    const existing = await callRecordRepository.findById(id);
    if (!existing) throw new NotFoundError("Call record");

    const startTime = input.startTime ? new Date(input.startTime) : existing.startTime;
    const endTime = input.endTime ? new Date(input.endTime) : existing.endTime;
    validateTimeRange(startTime, endTime);

    const record = await callRecordRepository.update(id, {
      ...(input.callerName !== undefined ? { callerName: input.callerName } : {}),
      ...(input.callerNumber !== undefined ? { callerNumber: input.callerNumber } : {}),
      ...(input.receiverNumber !== undefined
        ? { receiverNumber: input.receiverNumber }
        : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.direction !== undefined ? { direction: input.direction } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.durationSeconds !== undefined
        ? { durationSeconds: input.durationSeconds }
        : {}),
      ...(input.cost !== undefined ? { cost: input.cost } : {}),
      ...(input.startTime !== undefined ? { startTime } : {}),
      ...(input.endTime !== undefined ? { endTime } : {}),
    });

    await this.invalidateCaches();
    await auditService.record(AuditAction.CALL_UPDATED, actor, {
      entityType: "CallRecord",
      entityId: record.id,
      metadata: input,
    });

    return toCallRecordResponse(record);
  }

  async delete(id: string, actor: AuditActor): Promise<void> {
    const existing = await callRecordRepository.findById(id);
    if (!existing) throw new NotFoundError("Call record");

    await callRecordRepository.delete(id);
    await this.invalidateCaches();
    await auditService.record(AuditAction.CALL_DELETED, actor, {
      entityType: "CallRecord",
      entityId: id,
    });
  }

  private async invalidateCaches(): Promise<void> {
    await Promise.all([
      cacheService.invalidateByPrefix(CACHE_PREFIXES.calls),
      cacheService.invalidateByPrefix(CACHE_PREFIXES.analytics),
    ]);
  }
}

export const callRecordService = new CallRecordService();
