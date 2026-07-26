import type { Response } from "express";
import type { PaginationMeta } from "@/types/pagination";

interface SuccessEnvelope<T> {
  success: true;
  data: T;
  message: string;
  pagination: PaginationMeta | null;
  timestamp: string;
}

export interface ErrorEnvelope {
  success: false;
  data: null;
  message: string;
  errors?: unknown;
  timestamp: string;
}

interface SendSuccessOptions {
  message?: string;
  pagination?: PaginationMeta;
  statusCode?: number;
}

/** Every successful response in the API follows this envelope shape. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  options: SendSuccessOptions = {},
): void {
  const body: SuccessEnvelope<T> = {
    success: true,
    data,
    message: options.message ?? "OK",
    pagination: options.pagination ?? null,
    timestamp: new Date().toISOString(),
  };
  res.status(options.statusCode ?? 200).json(body);
}

export function sendCreated<T>(res: Response, data: T, message = "Created"): void {
  sendSuccess(res, data, { statusCode: 201, message });
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
