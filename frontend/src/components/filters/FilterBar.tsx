import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { useCallFilters } from "@/features/calls/hooks/useCallFilters";

export function FilterBar() {
  const { filters, setFilter, reset, hasActiveFilters } = useCallFilters();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => setFilter("dateFrom", e.target.value || null)}
        aria-label="From date"
        className="w-36 text-xs"
      />
      <span className="text-xs text-muted-foreground">to</span>
      <Input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => setFilter("dateTo", e.target.value || null)}
        aria-label="To date"
        className="w-36 text-xs"
      />

      <Input
        type="text"
        value={filters.city ?? ""}
        onChange={(e) => setFilter("city", e.target.value || null)}
        placeholder="Filter by city"
        aria-label="Filter by city"
        className="w-40 text-xs"
      />

      <Segmented
        options={[
          { value: "all", label: "All statuses" },
          { value: "SUCCESS", label: "Successful" },
          { value: "FAILED", label: "Failed" },
        ]}
        value={filters.status}
        onChange={(value) => setFilter("status", value)}
      />

      <Segmented
        options={[
          { value: "all", label: "All directions" },
          { value: "INBOUND", label: "Inbound" },
          { value: "OUTBOUND", label: "Outbound" },
        ]}
        value={filters.direction}
        onChange={(value) => setFilter("direction", value)}
      />

      {hasActiveFilters && (
        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={reset}>
          <X className="size-3.5" aria-hidden="true" />
          Reset filters
        </Button>
      )}
    </div>
  );
}
