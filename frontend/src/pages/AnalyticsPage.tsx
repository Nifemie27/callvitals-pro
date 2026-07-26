import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCardGrid } from "@/components/cards/KpiCardGrid";
import { ChartsSection } from "@/components/charts/ChartsSection";
import { FilterBar } from "@/components/filters/FilterBar";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCallFilters } from "@/features/calls/hooks/useCallFilters";
import {
  useCallDistribution,
  useCallsPerCity,
  useCallsPerDay,
  useSummary,
  useTopCallers,
  useTrends,
} from "@/features/analytics/hooks/useAnalytics";
import { ApiError } from "@/services/api/client";

export function AnalyticsPage() {
  const { apiFilters } = useCallFilters();

  const summary = useSummary(apiFilters);
  const callsPerDay = useCallsPerDay(apiFilters);
  const callsPerCity = useCallsPerCity(apiFilters, 8);
  const costByCity = useCallsPerCity(apiFilters, 8, "cost");
  const topCallers = useTopCallers(apiFilters, 8);
  const distribution = useCallDistribution(apiFilters);
  const trends = useTrends(apiFilters);

  const isLoading =
    summary.isPending ||
    callsPerDay.isPending ||
    callsPerCity.isPending ||
    costByCity.isPending ||
    topCallers.isPending ||
    distribution.isPending ||
    trends.isPending;

  if (summary.isError) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Analytics"
          description="Deeper breakdowns with date, city, status, and direction filters."
        />
        <ErrorState
          message={
            summary.error instanceof ApiError
              ? summary.error.message
              : "Failed to load analytics data."
          }
          onRetry={() => void summary.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Analytics"
        description="Deeper breakdowns with date, city, status, and direction filters."
      />

      <FilterBar />

      <KpiCardGrid summary={summary.data} isLoading={summary.isPending} />

      <ChartsSection
        isLoading={isLoading}
        callsPerDay={callsPerDay.data}
        callsPerCity={callsPerCity.data}
        costByCity={costByCity.data?.top}
        topCallers={topCallers.data}
        distribution={distribution.data}
        trends={trends.data}
      />
    </div>
  );
}
