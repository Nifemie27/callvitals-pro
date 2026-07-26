import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_SERIES_COLOR } from "@/constants/chart-colors";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format/currency";
import type { CallsPerCityEntry } from "@/types/analytics";

const chartConfig = {
  totalCost: { label: "Cost", color: CHART_SERIES_COLOR },
} satisfies ChartConfig;

export function CostByCityChart({ data }: { data: CallsPerCityEntry[] }) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[240px] w-full"
      role="img"
      aria-label="Horizontal bar chart of the top cities by total call cost"
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(value: number) => formatCurrencyCompact(value)}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="city"
          tickLine={false}
          axisLine={false}
          width={104}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-muted-foreground">Total cost</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatCurrency(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="totalCost" fill="var(--color-totalCost)" radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ChartContainer>
  );
}
