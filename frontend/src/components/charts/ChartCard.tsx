import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  meta?: string;
  actions?: ReactNode;
  footnote?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  meta,
  actions,
  footnote,
  isLoading,
  isEmpty,
  emptyMessage = "No calls match the current data.",
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn("gap-1 px-4.5 pt-4 pb-3", className)}>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[13.5px] font-semibold">{title}</h2>
        <div className="flex items-center gap-2.5">
          {meta && (
            <span className="shrink-0 text-[11.5px] text-muted-foreground">
              {meta}
            </span>
          )}
          {actions}
        </div>
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : isEmpty ? (
        <EmptyState message={emptyMessage} />
      ) : (
        children
      )}

      {footnote && !isLoading && !isEmpty && (
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          {footnote}
        </p>
      )}
    </Card>
  );
}
