import { CircleAlert } from "lucide-react";
import type { SummaryResponse } from "@/types/analytics";

interface DataQualityNoticeProps {
  summary: SummaryResponse;
}

export function DataQualityNotice({ summary }: DataQualityNoticeProps) {
  if (summary.totalCalls === 0) return null;

  const allFailed = summary.successfulCalls === 0;
  const allOutbound = summary.incomingCalls === 0;

  if (!allFailed && !allOutbound) return null;

  const subject =
    allFailed && allOutbound
      ? "failed and outbound"
      : allFailed
        ? "failed"
        : "outbound";

  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5">
      <CircleAlert
        className="mt-0.5 size-4 shrink-0 text-destructive"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <p className="text-[12.5px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">
          Every call matching the current filters is recorded as {subject}.
        </span>{" "}
        That reflects the underlying data, not a rendering issue.
      </p>
    </div>
  );
}
