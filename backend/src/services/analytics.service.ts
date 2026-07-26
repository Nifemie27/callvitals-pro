import type { ParsedQs } from "qs";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { cacheService, CACHE_PREFIXES } from "@/services/cache.service";
import { parseCallFilters, parsePositiveInt } from "@/utils/queryParsing";
import { env } from "@/config/env";
import type { CallRecordFilters } from "@/types/callFilters";
import {
  round,
  type CallDistributionResponse,
  type CallsPerCityResponse,
  type CallsPerDayEntry,
  type SummaryResponse,
  type TopCallerResponse,
  type TrendsResponse,
} from "@/dto/analytics.dto";

const DEFAULT_TOP_CALLERS = 10;
const MAX_TOP_CALLERS = 50;
const DEFAULT_TOP_CITIES = 15;
const MAX_TOP_CITIES = 50;
const DEFAULT_TREND_WINDOW_DAYS = 30;

function cacheKey(name: string, params: unknown): string {
  return `${CACHE_PREFIXES.analytics}${name}:${JSON.stringify(params)}`;
}

class AnalyticsService {
  async summary(query: ParsedQs): Promise<SummaryResponse> {
    const filters = parseCallFilters(query);
    return cacheService.wrap(
      cacheKey("summary", filters),
      env.redis.analyticsTtlSeconds,
      async () => {
        const row = await analyticsRepository.summary(filters);
        const successRate =
          row.total_calls > 0 ? (row.successful_calls / row.total_calls) * 100 : 0;
        return {
          totalCalls: row.total_calls,
          totalDuration: row.total_duration,
          averageDuration: round(row.average_duration),
          incomingCalls: row.inbound_calls,
          outgoingCalls: row.outbound_calls,
          successfulCalls: row.successful_calls,
          failedCalls: row.failed_calls,
          successRate: round(successRate),
          totalCost: round(row.total_cost),
        };
      },
    );
  }

  async topCallers(query: ParsedQs): Promise<TopCallerResponse[]> {
    const filters = parseCallFilters(query);
    const limit = parsePositiveInt(query.limit, DEFAULT_TOP_CALLERS, MAX_TOP_CALLERS);

    return cacheService.wrap(
      cacheKey("top-callers", { filters, limit }),
      env.redis.analyticsTtlSeconds,
      async () => {
        const rows = await analyticsRepository.topCallers(filters, limit);
        return rows.map((row) => ({
          callerNumber: row.caller_number,
          callerName: row.caller_name,
          callCount: row.call_count,
          totalDuration: row.total_duration,
          totalCost: round(row.total_cost),
        }));
      },
    );
  }

  async callDistribution(query: ParsedQs): Promise<CallDistributionResponse> {
    const filters = parseCallFilters(query);
    return cacheService.wrap(
      cacheKey("distribution", filters),
      env.redis.analyticsTtlSeconds,
      async () => {
        const row = await analyticsRepository.summary(filters);
        const total = row.total_calls;
        return {
          byDirection: {
            inbound: row.inbound_calls,
            outbound: row.outbound_calls,
            inboundPercent: total > 0 ? round((row.inbound_calls / total) * 100) : 0,
            outboundPercent: total > 0 ? round((row.outbound_calls / total) * 100) : 0,
          },
          byStatus: {
            successful: row.successful_calls,
            failed: row.failed_calls,
            successRate: total > 0 ? round((row.successful_calls / total) * 100) : 0,
            failureRate: total > 0 ? round((row.failed_calls / total) * 100) : 0,
          },
        };
      },
    );
  }

  async callsPerDay(query: ParsedQs): Promise<CallsPerDayEntry[]> {
    const filters = parseCallFilters(query);
    return cacheService.wrap(
      cacheKey("calls-per-day", filters),
      env.redis.analyticsTtlSeconds,
      async () => {
        const rows = await analyticsRepository.callsPerDay(filters);
        return rows.map((row) => ({
          date: row.day.toISOString().slice(0, 10),
          callCount: row.call_count,
          totalDuration: row.total_duration,
        }));
      },
    );
  }

  async callsPerCity(query: ParsedQs): Promise<CallsPerCityResponse> {
    const filters = parseCallFilters(query);
    const limit = parsePositiveInt(query.limit, DEFAULT_TOP_CITIES, MAX_TOP_CITIES);
    const sortBy = query.sortBy === "cost" ? "cost" : "count";

    return cacheService.wrap(
      cacheKey("calls-per-city", { filters, limit, sortBy }),
      env.redis.analyticsTtlSeconds,
      async () => {
        const [top, summaryRow, distinctRows] = await Promise.all([
          analyticsRepository.callsPerCity(filters, limit, sortBy),
          analyticsRepository.summary(filters),
          analyticsRepository.distinctCityCount(filters),
        ]);

        const total = summaryRow.total_calls;
        const topEntries = top.map((row) => ({
          city: row.city,
          callCount: row.call_count,
          totalCost: round(row.total_cost),
          percentOfTotal: total > 0 ? round((row.call_count / total) * 100) : 0,
        }));

        const topCallCount = topEntries.reduce((sum, entry) => sum + entry.callCount, 0);
        const topCost = topEntries.reduce((sum, entry) => sum + entry.totalCost, 0);
        const remainingCalls = total - topCallCount;

        return {
          top: topEntries,
          other:
            remainingCalls > 0
              ? {
                  callCount: remainingCalls,
                  totalCost: round(summaryRow.total_cost - topCost),
                  percentOfTotal: total > 0 ? round((remainingCalls / total) * 100) : 0,
                }
              : null,
          totalDistinctCities: Number(distinctRows[0]?.count ?? 0),
        };
      },
    );
  }

  async trends(query: ParsedQs): Promise<TrendsResponse> {
    const filters = parseCallFilters(query);

    // Anchored to the most recent record in the data, not wall-clock time.
    // This is a fixed dataset, not a live feed, so "last 30 days" measured
    // against today's real date would drift further from the data with
    // every day that passes and eventually compare against an empty window.
    const to =
      filters.dateTo ?? (await analyticsRepository.maxStartTime(filters)) ?? new Date();
    const from =
      filters.dateFrom ??
      new Date(to.getTime() - DEFAULT_TREND_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const windowMs = to.getTime() - from.getTime();

    const previousTo = new Date(from.getTime());
    const previousFrom = new Date(from.getTime() - windowMs);

    return cacheService.wrap(
      cacheKey("trends", { filters, from, to }),
      env.redis.analyticsTtlSeconds,
      async () => {
        const currentFilters: CallRecordFilters = {
          ...filters,
          dateFrom: from,
          dateTo: to,
        };
        const previousFilters: CallRecordFilters = {
          ...filters,
          dateFrom: previousFrom,
          dateTo: previousTo,
        };

        const [current, previous] = await Promise.all([
          analyticsRepository.summary(currentFilters),
          analyticsRepository.summary(previousFilters),
        ]);

        const changePercent = (currentValue: number, previousValue: number): number => {
          if (previousValue === 0) return currentValue > 0 ? 100 : 0;
          return round(((currentValue - previousValue) / previousValue) * 100);
        };

        return {
          currentPeriod: {
            from: from.toISOString(),
            to: to.toISOString(),
            totalCalls: current.total_calls,
            totalDuration: current.total_duration,
          },
          previousPeriod: {
            from: previousFrom.toISOString(),
            to: previousTo.toISOString(),
            totalCalls: previous.total_calls,
            totalDuration: previous.total_duration,
          },
          changePercent: {
            calls: changePercent(current.total_calls, previous.total_calls),
            duration: changePercent(current.total_duration, previous.total_duration),
          },
        };
      },
    );
  }
}

export const analyticsService = new AnalyticsService();
