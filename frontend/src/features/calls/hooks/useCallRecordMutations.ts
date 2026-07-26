import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCallRecord,
  deleteCallRecord,
  updateCallRecord,
} from "@/services/api/calls.api";
import { ApiError } from "@/services/api/client";
import type { CallRecordInput } from "@/features/calls/types";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function useCallRecordMutations() {
  const queryClient = useQueryClient();

  function invalidateAll() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["calls"] }),
      queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    ]);
  }

  const create = useMutation({
    mutationFn: (input: CallRecordInput) => createCallRecord(input),
    onSuccess: async () => {
      await invalidateAll();
      toast.success("Call record created");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to create call record")),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CallRecordInput> }) =>
      updateCallRecord(id, input),
    onSuccess: async () => {
      await invalidateAll();
      toast.success("Call record updated");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update call record")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCallRecord(id),
    onSuccess: async () => {
      await invalidateAll();
      toast.success("Call record deleted");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to delete call record")),
  });

  return { create, update, remove };
}
