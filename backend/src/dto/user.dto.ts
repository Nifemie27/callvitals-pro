import type { Role } from "@prisma/client";

export interface UpdateUserBody {
  role?: Role;
  isActive?: boolean;
}

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
}
