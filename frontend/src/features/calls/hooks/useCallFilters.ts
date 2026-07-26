import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { CallDirection, CallRecordFilters, CallStatus } from "@/features/calls/types";

export type DirectionFilter = "all" | CallDirection;
export type StatusFilter = "all" | CallStatus;

export interface CallFiltersState {
  dateFrom: string | null;
  dateTo: string | null;
  city: string | null;
  direction: DirectionFilter;
  status: StatusFilter;
  search: string | null;
}

function isDirectionFilter(value: string | null): value is DirectionFilter {
  return value === "all" || value === "INBOUND" || value === "OUTBOUND";
}

function isStatusFilter(value: string | null): value is StatusFilter {
  return value === "all" || value === "SUCCESS" || value === "FAILED";
}

/** Filter state synced to the URL, so a filtered view is shareable and survives a refresh. */
export function useCallFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: CallFiltersState = useMemo(
    () => ({
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      city: searchParams.get("city"),
      direction: isDirectionFilter(searchParams.get("direction"))
        ? (searchParams.get("direction") as DirectionFilter)
        : "all",
      status: isStatusFilter(searchParams.get("status"))
        ? (searchParams.get("status") as StatusFilter)
        : "all",
      search: searchParams.get("q"),
    }),
    [searchParams],
  );

  const setFilter = useCallback(
    (key: keyof CallFiltersState, value: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const paramName = key === "search" ? "q" : key;
          if (!value || value === "all") {
            next.delete(paramName);
          } else {
            next.set(paramName, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters =
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.city !== null ||
    filters.direction !== "all" ||
    filters.status !== "all" ||
    filters.search !== null;

  const apiFilters: CallRecordFilters = useMemo(
    () => ({
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
      ...(filters.city ? { city: filters.city } : {}),
      ...(filters.direction !== "all" ? { direction: filters.direction } : {}),
      ...(filters.status !== "all" ? { status: filters.status } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    }),
    [filters],
  );

  return { filters, apiFilters, setFilter, reset, hasActiveFilters };
}
