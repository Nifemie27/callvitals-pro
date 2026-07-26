import { useQuery } from "@tanstack/react-query";
import { listCallRecords } from "@/services/api/calls.api";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { CallRecordListParams } from "@/features/calls/types";

export function useCallRecords(params: CallRecordListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.calls.list(params),
    queryFn: () => listCallRecords(params),
    placeholderData: (previous) => previous,
  });
}
