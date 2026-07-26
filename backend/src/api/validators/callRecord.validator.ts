import { body, param, query } from "express-validator";
import { CallDirection, CallStatus } from "@prisma/client";

export const idParamValidator = [param("id").isUUID().withMessage("Invalid id")];

export const listQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("dateFrom must be an ISO 8601 date"),
  query("dateTo").optional().isISO8601().withMessage("dateTo must be an ISO 8601 date"),
  query("direction")
    .optional()
    .isIn(Object.values(CallDirection))
    .withMessage("direction must be INBOUND or OUTBOUND"),
  query("status")
    .optional()
    .isIn(Object.values(CallStatus))
    .withMessage("status must be SUCCESS or FAILED"),
  query("minDuration").optional().isInt({ min: 0 }),
  query("maxDuration").optional().isInt({ min: 0 }),
];

export const createCallRecordValidator = [
  body("callerName").trim().isLength({ min: 1, max: 200 }),
  body("callerNumber").trim().isLength({ min: 1, max: 30 }),
  body("receiverNumber").trim().isLength({ min: 1, max: 30 }),
  body("city").trim().isLength({ min: 1, max: 200 }),
  body("direction").isIn(Object.values(CallDirection)),
  body("status").isIn(Object.values(CallStatus)),
  body("durationSeconds").isInt({ min: 0 }),
  body("cost").isFloat({ min: 0 }),
  body("startTime").isISO8601(),
  body("endTime").isISO8601(),
];

export const updateCallRecordValidator = [
  body("callerName").optional().trim().isLength({ min: 1, max: 200 }),
  body("callerNumber").optional().trim().isLength({ min: 1, max: 30 }),
  body("receiverNumber").optional().trim().isLength({ min: 1, max: 30 }),
  body("city").optional().trim().isLength({ min: 1, max: 200 }),
  body("direction").optional().isIn(Object.values(CallDirection)),
  body("status").optional().isIn(Object.values(CallStatus)),
  body("durationSeconds").optional().isInt({ min: 0 }),
  body("cost").optional().isFloat({ min: 0 }),
  body("startTime").optional().isISO8601(),
  body("endTime").optional().isISO8601(),
];
