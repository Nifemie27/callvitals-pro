import { apiClient } from "@/services/api/client";
import { downloadBlob } from "@/lib/download";
import type { ApiSuccessEnvelope, PaginatedResult } from "@/types/api";
import type {
  CallRecord,
  CallRecordFilters,
  CallRecordInput,
  CallRecordListParams,
} from "@/features/calls/types";

export async function listCallRecords(
  params: CallRecordListParams,
): Promise<PaginatedResult<CallRecord>> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<CallRecord[]>>("/calls", {
    params,
  });
  return { items: data.data, pagination: data.pagination! };
}

export async function getCallRecord(id: string): Promise<CallRecord> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<CallRecord>>(`/calls/${id}`);
  return data.data;
}

export async function createCallRecord(input: CallRecordInput): Promise<CallRecord> {
  const { data } = await apiClient.post<ApiSuccessEnvelope<CallRecord>>("/calls", input);
  return data.data;
}

export async function updateCallRecord(
  id: string,
  input: Partial<CallRecordInput>,
): Promise<CallRecord> {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<CallRecord>>(
    `/calls/${id}`,
    input,
  );
  return data.data;
}

export async function deleteCallRecord(id: string): Promise<void> {
  await apiClient.delete(`/calls/${id}`);
}

function timestampSuffix(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function downloadCallRecordsCsv(filters: CallRecordFilters): Promise<void> {
  const response = await apiClient.get<Blob>("/calls/export/csv", {
    params: filters,
    responseType: "blob",
  });
  downloadBlob(response.data, `call-records-${timestampSuffix()}.csv`);
}

export async function downloadCallRecordsPdf(filters: CallRecordFilters): Promise<void> {
  const response = await apiClient.get<Blob>("/calls/export/pdf", {
    params: filters,
    responseType: "blob",
  });
  downloadBlob(response.data, `call-records-${timestampSuffix()}.pdf`);
}
