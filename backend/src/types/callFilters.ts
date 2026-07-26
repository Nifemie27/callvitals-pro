import type { CallDirection, CallStatus } from "@prisma/client";

export interface CallRecordFilters {
  dateFrom?: Date;
  dateTo?: Date;
  caller?: string;
  receiver?: string;
  city?: string;
  direction?: CallDirection;
  status?: CallStatus;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
}

export type CallSortField =
  "startTime" | "durationSeconds" | "cost" | "city" | "callerName";

export interface CallSort {
  field: CallSortField;
  direction: "asc" | "desc";
}

export const CALL_SORT_FIELDS: CallSortField[] = [
  "startTime",
  "durationSeconds",
  "cost",
  "city",
  "callerName",
];
