import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCardGrid } from "@/components/cards/KpiCardGrid";
import { DataQualityNotice } from "@/components/cards/DataQualityNotice";
import { ChartsSection } from "@/components/charts/ChartsSection";
import { RecentCallsTable } from "@/components/table/RecentCallsTable";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCallRecords } from "@/features/calls/hooks/useCallRecords";
import {
  useCallDistribution,
  useCallsPerCity,
  useCallsPerDay,
  useSummary,
  useTopCallers,
  useTrends,
} from "@/features/analytics/hooks/useAnalytics";
import { ApiError } from "@/services/api/client";

const EMPTY_FILTERS = {};

export function DashboardPage() {
  const summary = useSummary(EMPTY_FILTERS);
  const callsPerDay = useCallsPerDay(EMPTY_FILTERS);
  const callsPerCity = useCallsPerCity(EMPTY_FILTERS, 8);
  const costByCity = useCallsPerCity(EMPTY_FILTERS, 8, "cost");
  const topCallers = useTopCallers(EMPTY_FILTERS, 8);
  const distribution = useCallDistribution(EMPTY_FILTERS);
  const trends = useTrends(EMPTY_FILTERS);
  const recentCalls = useCallRecords({ page: 1, limit: 8, sort: "startTime:desc" });

  const isLoading =
    summary.isPending ||
    callsPerDay.isPending ||
    callsPerCity.isPending ||
    costByCity.isPending ||
    topCallers.isPending ||
    distribution.isPending ||
    trends.isPending;

  const firstError = [summary, callsPerDay, callsPerCity, recentCalls].find((q) => q.isError);

  if (firstError?.error) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Dashboard"
          description="Overview of call activity, cost, and success across the network."
        />
        <ErrorState
          message={
            firstError.error instanceof ApiError
              ? firstError.error.message
              : "Failed to load dashboard data."
          }
          onRetry={() => void summary.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Dashboard"
        description="Overview of call activity, cost, and success across the network."
      />

      <KpiCardGrid summary={summary.data} isLoading={summary.isPending} />

      {summary.data && !summary.isPending && <DataQualityNotice summary={summary.data} />}

      <ChartsSection
        isLoading={isLoading}
        callsPerDay={callsPerDay.data}
        callsPerCity={callsPerCity.data}
        costByCity={costByCity.data?.top}
        topCallers={topCallers.data}
        distribution={distribution.data}
        trends={trends.data}
      />

      <RecentCallsTable
        records={recentCalls.data?.items ?? []}
        isLoading={recentCalls.isPending}
      />
    </div>
  );
}
