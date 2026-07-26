import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

interface TablePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function TablePagination({ pagination, onPageChange }: TablePaginationProps) {
  const { page, limit, totalItems, hasNextPage, hasPreviousPage } = pagination;
  const start = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalItems);

  return (
    <div className="flex items-center justify-between border-t px-4.5 py-3 text-xs text-muted-foreground">
      <span>
        Showing {start}&ndash;{end} of {totalItems.toLocaleString()}
      </span>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
