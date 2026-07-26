import { useQuery } from "@tanstack/react-query";
import * as analyticsApi from "@/services/api/analytics.api";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { CallRecordFilters } from "@/features/calls/types";

export function useSummary(filters: CallRecordFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.summary(filters),
    queryFn: () => analyticsApi.getSummary(filters),
  });
}

export function useTopCallers(filters: CallRecordFilters, limit = 8) {
  const params = { ...filters, limit };
  return useQuery({
    queryKey: QUERY_KEYS.analytics.topCallers(params),
    queryFn: () => analyticsApi.getTopCallers(params),
  });
}

export function useCallDistribution(filters: CallRecordFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.distribution(filters),
    queryFn: () => analyticsApi.getCallDistribution(filters),
  });
}

export function useCallsPerDay(filters: CallRecordFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.perDay(filters),
    queryFn: () => analyticsApi.getCallsPerDay(filters),
  });
}

export function useCallsPerCity(
  filters: CallRecordFilters,
  limit = 8,
  sortBy: "count" | "cost" = "count",
) {
  const params = { ...filters, limit, sortBy };
  return useQuery({
    queryKey: QUERY_KEYS.analytics.perCity(params),
    queryFn: () => analyticsApi.getCallsPerCity(params),
  });
}

export function useTrends(filters: CallRecordFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.trends(filters),
    queryFn: () => analyticsApi.getTrends(filters),
  });
}
