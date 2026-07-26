import { ChartCard } from "@/components/charts/ChartCard";
import { ActivityByDayChart } from "@/components/charts/ActivityByDayChart";
import { CostByCityChart } from "@/components/charts/CostByCityChart";
import { CallsByCityChart } from "@/components/charts/CallsByCityChart";
import { CallDistributionPanel } from "@/components/charts/CallDistributionPanel";
import { TopCallersList } from "@/components/charts/TopCallersList";
import type {
  CallDistributionResponse,
  CallsPerCityEntry,
  CallsPerCityResponse,
  CallsPerDayEntry,
  TopCallerResponse,
  TrendsResponse,
} from "@/types/analytics";

interface ChartsSectionProps {
  isLoading: boolean;
  callsPerDay: CallsPerDayEntry[] | undefined;
  callsPerCity: CallsPerCityResponse | undefined;
  costByCity: CallsPerCityEntry[] | undefined;
  topCallers: TopCallerResponse[] | undefined;
  distribution: CallDistributionResponse | undefined;
  trends: TrendsResponse | undefined;
}

function trendLabel(trends: TrendsResponse | undefined): string | undefined {
  if (!trends) return undefined;
  const change = trends.changePercent.calls;
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const magnitude = Math.abs(change);
  return `${direction === "up" ? "Up" : direction === "down" ? "Down" : "Flat"} ${magnitude}% vs previous period`;
}

export function ChartsSection({
  isLoading,
  callsPerDay,
  callsPerCity,
  costByCity,
  topCallers,
  distribution,
  trends,
}: ChartsSectionProps) {
  const isEmpty = !isLoading && (callsPerDay?.length ?? 0) === 0;

  return (
    <div className="flex flex-col gap-3.5">
      <ChartCard
        title="Call volume by day"
        meta={trendLabel(trends)}
        isLoading={isLoading}
        isEmpty={isEmpty}
      >
        <ActivityByDayChart data={callsPerDay ?? []} />
      </ChartCard>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <ChartCard
          title="Call distribution"
          meta="Direction & outcome"
          isLoading={isLoading}
          isEmpty={!isLoading && !distribution}
        >
          {distribution && <CallDistributionPanel data={distribution} />}
        </ChartCard>

        <ChartCard
          title="Highest-cost calls by city"
          meta={costByCity ? `Top ${costByCity.length} cities` : undefined}
          isLoading={isLoading}
          isEmpty={!isLoading && (costByCity?.length ?? 0) === 0}
        >
          <CostByCityChart data={costByCity ?? []} />
        </ChartCard>
      </div>

      <ChartCard
        title="Calls by city"
        meta={
          callsPerCity && callsPerCity.totalDistinctCities > callsPerCity.top.length
            ? `${callsPerCity.top.length} named cities of ${callsPerCity.totalDistinctCities} total`
            : undefined
        }
        isLoading={isLoading}
        isEmpty={isEmpty}
        footnote={
          callsPerCity &&
          callsPerCity.totalDistinctCities > callsPerCity.top.length &&
          "This dataset spans thousands of distinct cities with little repetition per city; the long tail is folded into an honest “Other” bucket rather than hidden."
        }
      >
        {callsPerCity && <CallsByCityChart data={callsPerCity} />}
      </ChartCard>

      <ChartCard
        title="Top callers"
        meta={topCallers ? `Top ${topCallers.length}` : undefined}
        isLoading={isLoading}
        isEmpty={!isLoading && (topCallers?.length ?? 0) === 0}
      >
        {topCallers && <TopCallersList data={topCallers} />}
      </ChartCard>
    </div>
  );
}
