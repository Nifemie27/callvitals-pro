import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteUser, listUsers, updateUser, type ListUsersParams, type UpdateUserInput } from "@/services/api/users.api";
import { QUERY_KEYS } from "@/constants/query-keys";
import { ApiError } from "@/services/api/client";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(params),
    queryFn: () => listUsers(params),
    placeholderData: (previous) => previous,
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: async () => {
      await invalidate();
      toast.success("User updated");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update user")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      await invalidate();
      toast.success("User deleted");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to delete user")),
  });

  return { update, remove };
}
