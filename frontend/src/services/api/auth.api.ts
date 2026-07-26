import { apiClient } from "@/services/api/client";
import type { ApiSuccessEnvelope } from "@/types/api";
import type { AuthSession, User } from "@/types/auth";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiSuccessEnvelope<AuthSession>>(
    "/auth/login",
    input,
  );
  return data.data;
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiSuccessEnvelope<AuthSession>>(
    "/auth/register",
    input,
  );
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function refresh(): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiSuccessEnvelope<AuthSession>>("/auth/refresh");
  return data.data;
}

export async function me(): Promise<User> {
  const { data } = await apiClient.get<ApiSuccessEnvelope<User>>("/auth/me");
  return data.data;
}
