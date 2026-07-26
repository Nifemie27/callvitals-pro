export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function buildPaginationMeta(
  params: PaginationParams,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / params.limit));
  return {
    page: params.page,
    limit: params.limit,
    totalItems,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}
