import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ValidationError } from "@/errors/AppError";

/** Runs after express-validator chains; turns collected errors into a 422. */
export function validate(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const details = result.array().map((err) => ({
    field: err.type === "field" ? err.path : undefined,
    message: err.msg as string,
  }));

  next(new ValidationError("Validation failed", details));
}
