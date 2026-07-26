import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CallStatusBadge } from "@/components/table/CallStatusBadge";
import { CallDirectionBadge } from "@/components/table/CallDirectionBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatCurrency } from "@/lib/format/currency";
import { formatDuration } from "@/lib/format/duration";
import { formatDateTime } from "@/lib/format/date";
import { formatPhoneNumber } from "@/lib/format/phone";
import type { CallRecord } from "@/features/calls/types";

interface RecentCallsTableProps {
  records: CallRecord[];
  isLoading: boolean;
}

/** A compact, read-only preview of the most recent calls; the full sortable/searchable explorer lives on the Reports page. */
export function RecentCallsTable({ records, isLoading }: RecentCallsTableProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex items-center justify-between border-b px-4.5 py-3.5">
        <h2 className="text-[13.5px] font-semibold">Recent call logs</h2>
        <Button size="sm" variant="outline" asChild>
          <Link to="/reports">View all</Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Caller
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                City
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duration
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cost
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Direction
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Start time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }, (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }, (_, j) => (
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
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && records.length === 0 && <EmptyState message="No calls recorded yet." />}
    </Card>
  );
}
