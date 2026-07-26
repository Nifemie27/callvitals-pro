import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "@/errors/AppError";
import type { ErrorEnvelope } from "@/utils/apiResponse";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

interface KnownErrorShape {
  statusCode: number;
  message: string;
  details?: unknown;
}

function fromPrismaError(error: Prisma.PrismaClientKnownRequestError): KnownErrorShape {
  switch (error.code) {
    case "P2002": {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      return {
        statusCode: 409,
        message: target
          ? `A record with this ${target} already exists`
          : "Duplicate record",
      };
    }
    case "P2025":
      return { statusCode: 404, message: "Record not found" };
    case "P2003":
      return { statusCode: 400, message: "Invalid reference to a related record" };
    default:
      return { statusCode: 500, message: "Database error" };
  }
}

function resolveError(error: unknown): KnownErrorShape {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return fromPrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { statusCode: 400, message: "Invalid request data" };
  }

  if (error instanceof SyntaxError && "body" in error) {
    return { statusCode: 400, message: "Malformed JSON in request body" };
  }

  if (error instanceof Error && error.name === "JsonWebTokenError") {
    return { statusCode: 401, message: "Invalid authentication token" };
  }

  if (error instanceof Error && error.name === "TokenExpiredError") {
    return { statusCode: 401, message: "Authentication token has expired" };
  }

  return { statusCode: 500, message: "Internal server error" };
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const resolved = resolveError(error);
  const isServerFault = resolved.statusCode >= 500;

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode: resolved.statusCode,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  const body: ErrorEnvelope = {
    success: false,
    data: null,
    message:
      isServerFault && env.isProduction ? "Internal server error" : resolved.message,
    timestamp: new Date().toISOString(),
  };

  if (resolved.details !== undefined) {
    body.errors = resolved.details;
  }

  res.status(resolved.statusCode).json(body);
}
