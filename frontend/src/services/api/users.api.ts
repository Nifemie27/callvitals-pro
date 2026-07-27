import { apiClient } from "@/services/api/client";
import type { ApiSuccessEnvelope, PaginatedResult } from "@/types/api";
import type { Role, User } from "@/types/auth";

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}

export interface UpdateUserInput {
  role?: Role;
  isActive?: boolean;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export async function listUsers(params: ListUsersParams): Promise<PaginatedResult<User>> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<User[]>>("/users", { params });
  return { items: data.data, pagination: data.pagination! };
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data } = await apiClient.post<ApiSuccessEnvelope<User>>("/users", input);
  return data.data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const { data } = await apiClient.patch<ApiSuccessEnvelope<User>>(`/users/${id}`, input);
  return data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
