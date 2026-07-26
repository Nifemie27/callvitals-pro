import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  XAxis,
  YAxis,
  type BarShapeProps,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_SERIES_COLOR, CHART_OTHER_COLOR } from "@/constants/chart-colors";
import type { CallsPerCityResponse } from "@/types/analytics";

const chartConfig = {
  callCount: { label: "Calls", color: CHART_SERIES_COLOR },
} satisfies ChartConfig;

interface CallsByCityChartProps {
  data: CallsPerCityResponse;
}

function CityBar(props: BarShapeProps) {
  const isOther = Boolean((props.payload as { isOther?: boolean })?.isOther);
  return (
    <Rectangle
      {...props}
      fill={isOther ? CHART_OTHER_COLOR : "var(--color-callCount)"}
      fillOpacity={isOther ? 0.6 : 1}
    />
  );
}

export function CallsByCityChart({ data }: CallsByCityChartProps) {
  const rows = useMemo(() => {
    const top = data.top.map((c) => ({ city: c.city, callCount: c.callCount, isOther: false }));
    if (data.other) {
      const otherCount = data.totalDistinctCities - data.top.length;
      top.push({
        city: `Other (${otherCount})`,
        callCount: data.other.callCount,
        isOther: true,
      });
    }
    return top;
  }, [data]);

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[220px] w-full"
      role="img"
      aria-label="Horizontal bar chart of call volume by city, with the long tail folded into an Other bucket"
    >
      <BarChart
        accessibilityLayer
        data={rows}
        layout="vertical"
        margin={{ left: 4, right: 24, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="city"
          tickLine={false}
          axisLine={false}
          width={112}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="callCount" radius={[0, 4, 4, 0]} maxBarSize={18} shape={CityBar} />
      </BarChart>
    </ChartContainer>
  );
}
