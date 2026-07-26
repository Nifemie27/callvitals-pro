import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type CallSortField = "startTime" | "durationSeconds" | "cost" | "city" | "callerName";

export interface CallSort {
  field: CallSortField;
  direction: "asc" | "desc";
}

const VALID_FIELDS: CallSortField[] = [
  "startTime",
  "durationSeconds",
  "cost",
  "city",
  "callerName",
];

/** Page number and sort order, synced to the URL, independent of the filter params in useCallFilters. */
export function useCallListState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const sort: CallSort = useMemo(() => {
    const raw = searchParams.get("sort") ?? "startTime:desc";
    const [field, direction] = raw.split(":");
    return {
      field: VALID_FIELDS.includes(field as CallSortField) ? (field as CallSortField) : "startTime",
      direction: direction === "asc" ? "asc" : "desc",
    };
  }, [searchParams]);

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextPage <= 1) next.delete("page");
          else next.set("page", String(nextPage));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSort = useCallback(
    (field: CallSortField) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const currentRaw = prev.get("sort") ?? "startTime:desc";
          const [currentField, currentDirection] = currentRaw.split(":");
          const nextDirection =
            currentField === field && currentDirection === "desc" ? "asc" : "desc";
          next.set("sort", `${field}:${nextDirection}`);
          next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const sortParam = `${sort.field}:${sort.direction}`;

  return { page, setPage, sort, setSort, sortParam };
}
