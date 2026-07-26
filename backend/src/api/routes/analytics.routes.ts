import { Router } from "express";
import * as analyticsController from "@/api/controllers/analytics.controller";
import { authenticate } from "@/api/middleware/auth";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get("/summary", analyticsController.summary);
analyticsRouter.get("/top-callers", analyticsController.topCallers);
analyticsRouter.get("/call-distribution", analyticsController.callDistribution);
analyticsRouter.get("/calls-per-day", analyticsController.callsPerDay);
analyticsRouter.get("/calls-per-city", analyticsController.callsPerCity);
analyticsRouter.get("/trends", analyticsController.trends);
