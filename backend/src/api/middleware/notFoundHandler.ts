import type { Request, Response } from "express";
import type { ErrorEnvelope } from "@/utils/apiResponse";

export function notFoundHandler(req: Request, res: Response): void {
  const body: ErrorEnvelope = {
    success: false,
    data: null,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  };
  res.status(404).json(body);
}
