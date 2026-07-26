import { Router } from "express";
import { Role } from "@prisma/client";
import * as callsController from "@/api/controllers/callRecord.controller";
import * as exportController from "@/api/controllers/export.controller";
import {
  createCallRecordValidator,
  idParamValidator,
  listQueryValidator,
  updateCallRecordValidator,
} from "@/api/validators/callRecord.validator";
import { validate } from "@/api/middleware/validate";
import { authenticate, authorize } from "@/api/middleware/auth";

export const callsRouter = Router();

callsRouter.use(authenticate);

callsRouter.get("/export/csv", exportController.exportCsv);
callsRouter.get("/export/pdf", exportController.exportPdf);

callsRouter.get("/", listQueryValidator, validate, callsController.list);
callsRouter.get("/:id", idParamValidator, validate, callsController.getById);

callsRouter.post(
  "/",
  authorize(Role.ADMIN),
  createCallRecordValidator,
  validate,
  callsController.create,
);
callsRouter.patch(
  "/:id",
  authorize(Role.ADMIN),
  idParamValidator,
  updateCallRecordValidator,
  validate,
  callsController.update,
);
callsRouter.delete(
  "/:id",
  authorize(Role.ADMIN),
  idParamValidator,
  validate,
  callsController.remove,
);
