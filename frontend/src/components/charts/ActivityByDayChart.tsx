import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatDayLabel } from "@/lib/format/date";
import { CHART_SERIES_COLOR } from "@/constants/chart-colors";
import type { CallsPerDayEntry } from "@/types/analytics";

const chartConfig = {
  callCount: { label: "Calls", color: CHART_SERIES_COLOR },
} satisfies ChartConfig;

export function ActivityByDayChart({ data }: { data: CallsPerDayEntry[] }) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[240px] w-full"
      role="img"
      aria-label="Area chart of call volume by calendar day"
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(date: string) => formatDayLabel(date)}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatDayLabel(String(value))}
            />
          }
        />
        <Area
          dataKey="callCount"
          type="monotone"
          fill="var(--color-callCount)"
          fillOpacity={0.12}
          stroke="var(--color-callCount)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
