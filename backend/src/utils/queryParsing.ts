import type { ParsedQs } from "qs";
import { CallDirection, CallStatus } from "@prisma/client";
import type { PaginationParams } from "@/types/pagination";
import {
  CALL_SORT_FIELDS,
  type CallRecordFilters,
  type CallSort,
} from "@/types/callFilters";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function parsePositiveInt(
  value: unknown,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = Number(asString(value) ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

export function parsePagination(query: ParsedQs): PaginationParams {
  const rawPage = Number(asString(query.page) ?? DEFAULT_PAGE);
  const rawLimit = Number(asString(query.limit) ?? DEFAULT_LIMIT);

  const page =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : DEFAULT_PAGE;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  return { page, limit };
}

export function parseCallSort(query: ParsedQs): CallSort {
  const raw = asString(query.sort) ?? "startTime:desc";
  const [fieldRaw, directionRaw] = raw.split(":");
  const field = CALL_SORT_FIELDS.includes(fieldRaw as (typeof CALL_SORT_FIELDS)[number])
    ? (fieldRaw as CallSort["field"])
    : "startTime";
  const direction = directionRaw === "asc" ? "asc" : "desc";
  return { field, direction };
}

export function parseCallFilters(query: ParsedQs): CallRecordFilters {
  const filters: CallRecordFilters = {};

  const dateFrom = asString(query.dateFrom);
  const dateTo = asString(query.dateTo);
  if (dateFrom) {
    const parsed = new Date(dateFrom);
    if (!Number.isNaN(parsed.getTime())) filters.dateFrom = parsed;
  }
  if (dateTo) {
    const parsed = new Date(dateTo);
    if (!Number.isNaN(parsed.getTime())) filters.dateTo = parsed;
  }

  const caller = asString(query.caller);
  if (caller) filters.caller = caller;

  const receiver = asString(query.receiver);
  if (receiver) filters.receiver = receiver;

  const city = asString(query.city);
  if (city) filters.city = city;

  const direction = asString(query.direction)?.toUpperCase();
  if (direction && direction in CallDirection) {
    filters.direction = direction as CallDirection;
  }

  const status = asString(query.status)?.toUpperCase();
  if (status && status in CallStatus) {
    filters.status = status as CallStatus;
  }

  const minDuration = Number(asString(query.minDuration));
  if (Number.isFinite(minDuration) && asString(query.minDuration) !== undefined) {
    filters.minDuration = minDuration;
  }

  const maxDuration = Number(asString(query.maxDuration));
  if (Number.isFinite(maxDuration) && asString(query.maxDuration) !== undefined) {
    filters.maxDuration = maxDuration;
  }

  const search = asString(query.search);
  if (search) filters.search = search;

  return filters;
}
