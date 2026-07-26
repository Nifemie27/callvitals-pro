import { Router } from "express";
import { Role } from "@prisma/client";
import * as auditLogController from "@/api/controllers/auditLog.controller";
import { authenticate, authorize } from "@/api/middleware/auth";

export const auditLogRouter = Router();

auditLogRouter.use(authenticate, authorize(Role.ADMIN));

auditLogRouter.get("/", auditLogController.list);
