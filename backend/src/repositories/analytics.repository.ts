import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import type { CallRecordFilters } from "@/types/callFilters";

/**
 * Builds a parameterized SQL WHERE fragment from filters. Every value is
 * passed through Prisma.sql's tagged-template binding, never string
 * concatenation, so this is not vulnerable to SQL injection regardless of
 * what a caller puts in query params.
 */
function buildWhereSql(filters: CallRecordFilters): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  if (filters.dateFrom) {
    conditions.push(Prisma.sql`start_time >= ${filters.dateFrom}`);
  }
  if (filters.dateTo) {
    conditions.push(Prisma.sql`start_time <= ${filters.dateTo}`);
  }
  if (filters.caller) {
    conditions.push(Prisma.sql`caller_number ILIKE ${`%${filters.caller}%`}`);
  }
  if (filters.receiver) {
    conditions.push(Prisma.sql`receiver_number ILIKE ${`%${filters.receiver}%`}`);
  }
  if (filters.city) {
    conditions.push(Prisma.sql`city ILIKE ${filters.city}`);
  }
  if (filters.direction) {
    conditions.push(Prisma.sql`direction = ${filters.direction}::"CallDirection"`);
  }
  if (filters.status) {
    conditions.push(Prisma.sql`status = ${filters.status}::"CallStatus"`);
  }
  if (filters.minDuration !== undefined) {
    conditions.push(Prisma.sql`duration_seconds >= ${filters.minDuration}`);
  }
  if (filters.maxDuration !== undefined) {
    conditions.push(Prisma.sql`duration_seconds <= ${filters.maxDuration}`);
  }
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      Prisma.sql`(caller_name ILIKE ${term} OR caller_number ILIKE ${term} OR receiver_number ILIKE ${term} OR city ILIKE ${term})`,
    );
  }

  if (conditions.length === 0) return Prisma.sql`TRUE`;
  return Prisma.join(conditions, " AND ");
}

export interface SummaryRow {
  total_calls: number;
  total_duration: number;
  average_duration: number;
  inbound_calls: number;
  outbound_calls: number;
  successful_calls: number;
  failed_calls: number;
  total_cost: number;
}

export interface TopCallerRow {
  caller_number: string;
  caller_name: string;
  call_count: number;
  total_duration: number;
  total_cost: number;
}

export interface CallsPerDayRow {
  day: Date;
  call_count: number;
  total_duration: number;
}

export interface CallsPerCityRow {
  city: string;
  call_count: number;
  total_cost: number;
}

class AnalyticsRepository {
  async summary(filters: CallRecordFilters): Promise<SummaryRow> {
    const where = buildWhereSql(filters);
    const rows = await prisma.$queryRaw<SummaryRow[]>`
      SELECT
        COUNT(*)::int AS total_calls,
        COALESCE(SUM(duration_seconds), 0)::int AS total_duration,
        COALESCE(AVG(duration_seconds), 0)::float AS average_duration,
        COUNT(*) FILTER (WHERE direction = 'INBOUND')::int AS inbound_calls,
        COUNT(*) FILTER (WHERE direction = 'OUTBOUND')::int AS outbound_calls,
        COUNT(*) FILTER (WHERE status = 'SUCCESS')::int AS successful_calls,
        COUNT(*) FILTER (WHERE status = 'FAILED')::int AS failed_calls,
        COALESCE(SUM(cost), 0)::float AS total_cost
      FROM call_records
      WHERE ${where}
    `;
    return (
      rows[0] ?? {
        total_calls: 0,
        total_duration: 0,
        average_duration: 0,
        inbound_calls: 0,
        outbound_calls: 0,
        successful_calls: 0,
        failed_calls: 0,
        total_cost: 0,
      }
    );
  }

  async topCallers(filters: CallRecordFilters, limit: number): Promise<TopCallerRow[]> {
    const where = buildWhereSql(filters);
    return prisma.$queryRaw<TopCallerRow[]>`
      SELECT
        caller_number,
        MAX(caller_name) AS caller_name,
        COUNT(*)::int AS call_count,
        COALESCE(SUM(duration_seconds), 0)::int AS total_duration,
        COALESCE(SUM(cost), 0)::float AS total_cost
      FROM call_records
      WHERE ${where}
      GROUP BY caller_number
      ORDER BY call_count DESC
      LIMIT ${limit}
    `;
  }

  async callsPerDay(filters: CallRecordFilters): Promise<CallsPerDayRow[]> {
    const where = buildWhereSql(filters);
    return prisma.$queryRaw<CallsPerDayRow[]>`
      SELECT
        date_trunc('day', start_time) AS day,
        COUNT(*)::int AS call_count,
        COALESCE(SUM(duration_seconds), 0)::int AS total_duration
      FROM call_records
      WHERE ${where}
      GROUP BY day
      ORDER BY day ASC
    `;
  }

  async callsPerCity(
    filters: CallRecordFilters,
    limit: number,
    sortBy: "count" | "cost" = "count",
  ): Promise<CallsPerCityRow[]> {
    const where = buildWhereSql(filters);
    const orderBy =
      sortBy === "cost" ? Prisma.sql`total_cost DESC` : Prisma.sql`call_count DESC`;
    return prisma.$queryRaw<CallsPerCityRow[]>`
      SELECT
        city,
        COUNT(*)::int AS call_count,
        COALESCE(SUM(cost), 0)::float AS total_cost
      FROM call_records
      WHERE ${where}
      GROUP BY city
      ORDER BY ${orderBy}
      LIMIT ${limit}
    `;
  }

  distinctCityCount(filters: CallRecordFilters): Promise<{ count: bigint }[]> {
    const where = buildWhereSql(filters);
    return prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT city)::bigint AS count FROM call_records WHERE ${where}
    `;
  }

  async maxStartTime(filters: CallRecordFilters): Promise<Date | null> {
    const where = buildWhereSql(filters);
    const rows = await prisma.$queryRaw<{ max: Date | null }[]>`
      SELECT MAX(start_time) AS max FROM call_records WHERE ${where}
    `;
    return rows[0]?.max ?? null;
  }
}

export const analyticsRepository = new AnalyticsRepository();
