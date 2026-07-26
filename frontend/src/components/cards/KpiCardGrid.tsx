import { Phone, CircleDollarSign, Clock, CircleCheck, CircleX } from "lucide-react";
import { KpiCard } from "@/components/cards/KpiCard";
import { formatCurrency } from "@/lib/format/currency";
import { formatDuration } from "@/lib/format/duration";
import type { SummaryResponse } from "@/types/analytics";

interface KpiCardGridProps {
  summary: SummaryResponse | undefined;
  isLoading: boolean;
}

export function KpiCardGrid({ summary, isLoading }: KpiCardGridProps) {
  const s = summary ?? {
    totalCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
    incomingCalls: 0,
    outgoingCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    successRate: 0,
    totalCost: 0,
  };
  const averageCost = s.totalCalls > 0 ? s.totalCost / s.totalCalls : 0;

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        icon={Phone}
        label="Total calls"
        value={s.totalCalls.toLocaleString()}
        subtitle={`${s.incomingCalls.toLocaleString()} in / ${s.outgoingCalls.toLocaleString()} out`}
        isLoading={isLoading}
      />
      <KpiCard
        icon={CircleDollarSign}
        label="Total cost"
        value={formatCurrency(s.totalCost)}
        subtitle={`${formatCurrency(averageCost)} average per call`}
        isLoading={isLoading}
      />
      <KpiCard
        icon={Clock}
        label="Avg. duration"
        value={formatDuration(s.averageDuration)}
        subtitle={`${formatDuration(s.totalDuration)} total`}
        isLoading={isLoading}
      />
      <KpiCard
        icon={CircleCheck}
        label="Successful calls"
        value={s.successfulCalls.toLocaleString()}
        subtitle={`${s.successRate}% success rate`}
        tone={s.totalCalls > 0 && s.successfulCalls === 0 ? "critical" : "default"}
        isLoading={isLoading}
      />
      <KpiCard
        icon={CircleX}
        label="Failed calls"
        value={s.failedCalls.toLocaleString()}
        subtitle={`${s.totalCalls > 0 ? Math.round((s.failedCalls / s.totalCalls) * 100) : 0}% of total calls`}
        tone={s.failedCalls === s.totalCalls && s.totalCalls > 0 ? "critical" : "default"}
        isLoading={isLoading}
      />
    </div>
  );
}
