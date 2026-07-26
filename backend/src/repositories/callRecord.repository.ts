import type { CallRecord, Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import type { CallRecordFilters, CallSort } from "@/types/callFilters";

function buildWhere(filters: CallRecordFilters): Prisma.CallRecordWhereInput {
  const where: Prisma.CallRecordWhereInput = {};

  if (filters.dateFrom || filters.dateTo) {
    where.startTime = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }
  if (filters.caller) {
    where.callerNumber = { contains: filters.caller, mode: "insensitive" };
  }
  if (filters.receiver) {
    where.receiverNumber = { contains: filters.receiver, mode: "insensitive" };
  }
  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }
  if (filters.direction) {
    where.direction = filters.direction;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
    where.durationSeconds = {
      ...(filters.minDuration !== undefined ? { gte: filters.minDuration } : {}),
      ...(filters.maxDuration !== undefined ? { lte: filters.maxDuration } : {}),
    };
  }
  if (filters.search) {
    where.OR = [
      { callerName: { contains: filters.search, mode: "insensitive" } },
      { callerNumber: { contains: filters.search, mode: "insensitive" } },
      { receiverNumber: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export type CreateCallRecordInput = Omit<
  Prisma.CallRecordCreateInput,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateCallRecordInput = Partial<CreateCallRecordInput>;

class CallRecordRepository {
  async list(
    filters: CallRecordFilters,
    pagination: { page: number; limit: number },
    sort: CallSort,
  ): Promise<{ items: CallRecord[]; total: number }> {
    const where = buildWhere(filters);

    const [items, total] = await Promise.all([
      prisma.callRecord.findMany({
        where,
        orderBy: { [sort.field]: sort.direction },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.callRecord.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string): Promise<CallRecord | null> {
    return prisma.callRecord.findUnique({ where: { id } });
  }

  create(data: CreateCallRecordInput): Promise<CallRecord> {
    return prisma.callRecord.create({ data });
  }

  update(id: string, data: UpdateCallRecordInput): Promise<CallRecord> {
    return prisma.callRecord.update({ where: { id }, data });
  }

  delete(id: string): Promise<CallRecord> {
    return prisma.callRecord.delete({ where: { id } });
  }

  count(filters: CallRecordFilters = {}): Promise<number> {
    return prisma.callRecord.count({ where: buildWhere(filters) });
  }

  /**
   * Keyset-paginated async iterator over every record matching the filter,
   * ordered by id. Used by CSV/PDF export so a 10k+ row dump doesn't load
   * the whole table into memory or degrade like large OFFSET pagination
   * would on much bigger datasets.
   */
  async *iterate(
    filters: CallRecordFilters,
    batchSize = 1000,
  ): AsyncGenerator<CallRecord[], void, void> {
    const where = buildWhere(filters);
    let cursor: string | undefined;

    for (;;) {
      const batch: CallRecord[] = await prisma.callRecord.findMany({
        where,
        orderBy: { id: "asc" },
        take: batchSize,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      if (batch.length === 0) return;
      yield batch;

      const last = batch[batch.length - 1];
      if (!last || batch.length < batchSize) return;
      cursor = last.id;
    }
  }
}

export const callRecordRepository = new CallRecordRepository();
