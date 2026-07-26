import { apiClient } from "@/services/api/client";
import type { ApiSuccessEnvelope } from "@/types/api";
import type { CallRecordFilters } from "@/features/calls/types";
import type {
  CallDistributionResponse,
  CallsPerCityResponse,
  CallsPerDayEntry,
  SummaryResponse,
  TopCallerResponse,
  TrendsResponse,
} from "@/types/analytics";

export async function getSummary(filters: CallRecordFilters): Promise<SummaryResponse> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<SummaryResponse>>(
    "/analytics/summary",
    { params: filters },
  );
  return data.data;
}

export async function getTopCallers(
  filters: CallRecordFilters & { limit?: number },
): Promise<TopCallerResponse[]> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TopCallerResponse[]>>(
    "/analytics/top-callers",
    { params: filters },
  );
  return data.data;
}

export async function getCallDistribution(
  filters: CallRecordFilters,
): Promise<CallDistributionResponse> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<CallDistributionResponse>>(
    "/analytics/call-distribution",
    { params: filters },
  );
  return data.data;
}

export async function getCallsPerDay(
  filters: CallRecordFilters,
): Promise<CallsPerDayEntry[]> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<CallsPerDayEntry[]>>(
    "/analytics/calls-per-day",
    { params: filters },
  );
  return data.data;
}

export async function getCallsPerCity(
  filters: CallRecordFilters & { limit?: number; sortBy?: "count" | "cost" },
): Promise<CallsPerCityResponse> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<CallsPerCityResponse>>(
    "/analytics/calls-per-city",
    { params: filters },
  );
  return data.data;
}

export async function getTrends(filters: CallRecordFilters): Promise<TrendsResponse> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<TrendsResponse>>(
    "/analytics/trends",
    { params: filters },
  );
  return data.data;
}
