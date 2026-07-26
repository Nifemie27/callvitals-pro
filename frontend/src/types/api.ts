export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  message: string;
  pagination: PaginationMeta | null;
  timestamp: string;
}

export interface ApiErrorEnvelope {
  success: false;
  data: null;
  message: string;
  errors?: unknown;
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
