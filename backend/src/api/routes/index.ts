import { Router } from "express";
import { authRouter } from "@/api/routes/auth.routes";
import { callsRouter } from "@/api/routes/calls.routes";
import { analyticsRouter } from "@/api/routes/analytics.routes";
import { userRouter } from "@/api/routes/user.routes";
import { auditLogRouter } from "@/api/routes/auditLog.routes";

export const router = Router();

router.use("/auth", authRouter);
router.use("/calls", callsRouter);
router.use("/analytics", analyticsRouter);
router.use("/users", userRouter);
router.use("/audit-logs", auditLogRouter);
