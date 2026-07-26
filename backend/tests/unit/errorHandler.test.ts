import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { errorHandler } from "@/api/middleware/errorHandler";
import { ConflictError, NotFoundError, ValidationError } from "@/errors/AppError";

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

function mockReq(): Request {
  return { method: "GET", originalUrl: "/api/test" } as unknown as Request;
}

describe("errorHandler", () => {
  it("maps a NotFoundError to a 404 with its message", () => {
    const res = mockRes();
    errorHandler(new NotFoundError("Call record"), mockReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Call record not found" }),
    );
  });

  it("maps a ConflictError to a 409", () => {
    const res = mockRes();
    errorHandler(new ConflictError("Duplicate"), mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("includes validation details for a ValidationError", () => {
    const res = mockRes();
    const details = [{ field: "email", message: "Invalid email" }];
    errorHandler(
      new ValidationError("Validation failed", details),
      mockReq(),
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: details }));
  });

  it("maps a Prisma unique-constraint violation (P2002) to a 409", () => {
    const res = mockRes();
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["email"] },
      },
    );
    errorHandler(prismaError, mockReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("maps a Prisma not-found error (P2025) to a 404", () => {
    const res = mockRes();
    const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "test",
    });
    errorHandler(prismaError, mockReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("falls back to a 500 for an unrecognized error", () => {
    const res = mockRes();
    errorHandler(new Error("boom"), mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
