import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CallLogsToolbarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  actions?: ReactNode;
}

export function CallLogsToolbar({
  value,
  onChange,
  resultCount,
  actions,
}: CallLogsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4.5 py-3.5">
      <h2 className="text-[13.5px] font-semibold">Call logs</h2>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {resultCount.toLocaleString()} {resultCount === 1 ? "result" : "results"}
        </span>
        <div className="flex items-center gap-2 rounded-lg border bg-secondary px-2.5 py-1.5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
          <Search
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search caller, number, city..."
            aria-label="Search call logs"
            className="h-auto w-44 border-0 bg-transparent p-0 text-[13px] shadow-none outline-none focus-visible:ring-0 focus-visible:outline-none sm:w-56"
          />
        </div>
        {actions}
      </div>
    </div>
  );
}
