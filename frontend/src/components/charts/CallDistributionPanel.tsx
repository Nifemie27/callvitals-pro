import type { ComponentType } from "react";
import { ArrowDownLeft, ArrowUpRight, CircleCheck, CircleX } from "lucide-react";
import { CHART_OTHER_COLOR, CHART_SERIES_COLOR } from "@/constants/chart-colors";
import type { CallDistributionResponse } from "@/types/analytics";

interface StatRowProps {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  count: number;
  percent: number;
  barColor: string;
}

function StatRow({ icon: Icon, label, count, percent, barColor }: StatRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.8} aria-hidden />
          {label}
        </span>
        <span className="text-muted-foreground">
          {count.toLocaleString()} &middot; {percent}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

export function CallDistributionPanel({ data }: { data: CallDistributionResponse }) {
  return (
    <div className="flex flex-col gap-4 py-1">
      <StatRow
        icon={ArrowDownLeft}
        label="Inbound"
        count={data.byDirection.inbound}
        percent={data.byDirection.inboundPercent}
        barColor={CHART_SERIES_COLOR}
      />
      <StatRow
        icon={ArrowUpRight}
        label="Outbound"
        count={data.byDirection.outbound}
        percent={data.byDirection.outboundPercent}
        barColor={CHART_OTHER_COLOR}
      />
      <div className="my-1 h-px bg-border" />
      <StatRow
        icon={CircleCheck}
        label="Successful"
        count={data.byStatus.successful}
        percent={data.byStatus.successRate}
        barColor="var(--good)"
      />
      <StatRow
        icon={CircleX}
        label="Failed"
        count={data.byStatus.failed}
        percent={data.byStatus.failureRate}
        barColor="var(--destructive)"
      />
    </div>
  );
}
