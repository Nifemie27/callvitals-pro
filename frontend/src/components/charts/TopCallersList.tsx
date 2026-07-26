import { formatCurrency } from "@/lib/format/currency";
import { formatDuration } from "@/lib/format/duration";
import { formatPhoneNumber } from "@/lib/format/phone";
import type { TopCallerResponse } from "@/types/analytics";

export function TopCallersList({ data }: { data: TopCallerResponse[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {data.map((caller, index) => (
        <li key={caller.callerNumber} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-medium text-muted-foreground">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{caller.callerName}</div>
            <div className="text-xs text-muted-foreground">
              {formatPhoneNumber(caller.callerNumber)}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[13px] font-medium tabular-nums">
              {caller.callCount.toLocaleString()} calls
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {formatDuration(caller.totalDuration)} &middot; {formatCurrency(caller.totalCost)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
