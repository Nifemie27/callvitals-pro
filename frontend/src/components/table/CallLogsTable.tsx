import { ArrowDown, ArrowUp, ChevronsUpDown, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CallLogsToolbar } from "@/components/table/CallLogsToolbar";
import { CallStatusBadge } from "@/components/table/CallStatusBadge";
import { CallDirectionBadge } from "@/components/table/CallDirectionBadge";
import { TablePagination } from "@/components/table/TablePagination";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatCurrency } from "@/lib/format/currency";
import { formatDuration } from "@/lib/format/duration";
import { formatDateTime } from "@/lib/format/date";
import { formatPhoneNumber } from "@/lib/format/phone";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/api";
import type { CallRecord } from "@/features/calls/types";
import type { CallSort } from "@/features/calls/hooks/useCallListState";

const COLUMN_COUNT = 8;

interface SortHeaderProps {
  label: string;
  sortKey: CallSort["field"];
  activeSort: CallSort;
  onSort: (key: CallSort["field"]) => void;
  className?: string;
}

function SortHeader({ label, sortKey, activeSort, onSort, className }: SortHeaderProps) {
  const isActive = activeSort.field === sortKey;
  const Icon = isActive ? (activeSort.direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <TableHead
      className={className}
      aria-sort={isActive ? (activeSort.direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide",
          isActive ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon className="size-3" strokeWidth={2} aria-hidden="true" />
      </button>
    </TableHead>
  );
}

interface CallLogsTableProps {
  records: CallRecord[];
  pagination: PaginationMeta;
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  sort: CallSort;
  onSortChange: (field: CallSort["field"]) => void;
  onPageChange: (page: number) => void;
  canManage: boolean;
  onCreate?: () => void;
  onEdit?: (record: CallRecord) => void;
  onDelete?: (record: CallRecord) => void;
}

export function CallLogsTable({
  records,
  pagination,
  isLoading,
  search,
  onSearchChange,
  sort,
  onSortChange,
  onPageChange,
  canManage,
  onCreate,
  onEdit,
  onDelete,
}: CallLogsTableProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CallLogsToolbar
        value={search}
        onChange={onSearchChange}
        resultCount={pagination.totalItems}
        actions={
          canManage &&
          onCreate && (
            <Button size="sm" onClick={onCreate}>
              New call record
            </Button>
          )
        }
      />

      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Caller
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Receiver
              </TableHead>
              <SortHeader label="City" sortKey="city" activeSort={sort} onSort={onSortChange} />
              <SortHeader
                label="Duration"
                sortKey="durationSeconds"
                activeSort={sort}
                onSort={onSortChange}
              />
              <SortHeader label="Cost" sortKey="cost" activeSort={sort} onSort={onSortChange} />
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Direction
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <SortHeader
                label="Start time"
                sortKey="startTime"
                activeSort={sort}
                onSort={onSortChange}
              />
              {canManage && <TableHead className="w-20" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }, (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: COLUMN_COUNT + (canManage ? 1 : 0) }, (_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="font-medium">{record.callerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPhoneNumber(record.callerNumber)}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatPhoneNumber(record.receiverNumber)}
                  </TableCell>
                  <TableCell>{record.city}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatDuration(record.durationSeconds)}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(record.cost)}</TableCell>
                  <TableCell>
                    <CallDirectionBadge direction={record.direction} />
                  </TableCell>
                  <TableCell>
                    <CallStatusBadge status={record.status} />
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatDateTime(new Date(record.startTime))}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Edit call record"
                          onClick={() => onEdit?.(record)}
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Delete call record"
                          onClick={() => onDelete?.(record)}
                        >
                          <Trash2 className="size-3.5 text-destructive" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && records.length === 0 && (
        <EmptyState message="No calls match your filters." />
      )}

      {!isLoading && records.length > 0 && (
        <TablePagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </Card>
  );
}
