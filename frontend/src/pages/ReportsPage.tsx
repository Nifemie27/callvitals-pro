import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CallLogsTable } from "@/components/table/CallLogsTable";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCallRecords } from "@/features/calls/hooks/useCallRecords";
import { useCallRecordMutations } from "@/features/calls/hooks/useCallRecordMutations";
import { useCallFilters } from "@/features/calls/hooks/useCallFilters";
import { useCallListState } from "@/features/calls/hooks/useCallListState";
import { useAuth } from "@/features/auth/AuthContext";
import { CallRecordFormSheet } from "@/features/calls/components/CallRecordFormSheet";
import { downloadCallRecordsCsv, downloadCallRecordsPdf } from "@/services/api/calls.api";
import { ApiError } from "@/services/api/client";
import { toast } from "sonner";
import type { CallRecord } from "@/features/calls/types";

export function ReportsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN";
  const { apiFilters, filters, setFilter } = useCallFilters();
  const { page, setPage, sort, setSort, sortParam } = useCallListState();
  const mutations = useCallRecordMutations();

  const [formTarget, setFormTarget] = useState<"create" | CallRecord | null>(null);
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);

  const { data, isPending, isError, error, refetch } = useCallRecords({
    ...apiFilters,
    page,
    limit: 20,
    sort: sortParam,
  });

  async function handleExport(format: "csv" | "pdf") {
    setIsExporting(format);
    try {
      if (format === "csv") await downloadCallRecordsCsv(apiFilters);
      else await downloadCallRecordsPdf(apiFilters);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  }

  function handleDelete(record: CallRecord) {
    if (window.confirm(`Delete the call record for ${record.callerName}? This cannot be undone.`)) {
      mutations.remove.mutate(record.id);
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Reports" description="Full call log explorer with CSV and PDF export." />
        <ErrorState
          message={error instanceof ApiError ? error.message : "Failed to load call records."}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Reports"
          description="Every call record matching your search, filtered and exportable for offline analysis."
        />
        <div className="flex gap-2 print:hidden">
          <Button
            size="sm"
            variant="outline"
            disabled={isExporting !== null}
            onClick={() => void handleExport("csv")}
          >
            <Download aria-hidden="true" />
            {isExporting === "csv" ? "Exporting..." : "Export CSV"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isExporting !== null}
            onClick={() => void handleExport("pdf")}
          >
            <FileText aria-hidden="true" />
            {isExporting === "pdf" ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <CallLogsTable
        records={data?.items ?? []}
        pagination={
          data?.pagination ?? {
            page: 1,
            limit: 20,
            totalItems: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        }
        isLoading={isPending}
        search={filters.search ?? ""}
        onSearchChange={(value) => setFilter("search", value || null)}
        sort={sort}
        onSortChange={setSort}
        onPageChange={setPage}
        canManage={canManage}
        onCreate={() => setFormTarget("create")}
        onEdit={(record) => setFormTarget(record)}
        onDelete={handleDelete}
      />

      <CallRecordFormSheet
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        record={formTarget === "create" ? null : formTarget}
        isSubmitting={mutations.create.isPending || mutations.update.isPending}
        onSubmit={async (values) => {
          if (formTarget && formTarget !== "create") {
            await mutations.update.mutateAsync({ id: formTarget.id, input: values });
          } else {
            await mutations.create.mutateAsync(values);
          }
        }}
      />
    </div>
  );
}
