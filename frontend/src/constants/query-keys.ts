import type { CallRecordListParams } from "@/features/calls/types";
import type { ListUsersParams } from "@/services/api/users.api";

export const QUERY_KEYS = {
  calls: {
    list: (params: CallRecordListParams) => ["calls", "list", params] as const,
    detail: (id: string) => ["calls", "detail", id] as const,
  },
  analytics: {
    summary: (filters: unknown) => ["analytics", "summary", filters] as const,
    topCallers: (params: unknown) => ["analytics", "top-callers", params] as const,
    distribution: (filters: unknown) => ["analytics", "distribution", filters] as const,
    perDay: (filters: unknown) => ["analytics", "per-day", filters] as const,
    perCity: (params: unknown) => ["analytics", "per-city", params] as const,
    trends: (filters: unknown) => ["analytics", "trends", filters] as const,
  },
  users: {
    list: (params: ListUsersParams) => ["users", "list", params] as const,
  },
} as const;
