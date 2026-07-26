import type { Request, Response } from "express";
import { analyticsService } from "@/services/analytics.service";
import { sendSuccess } from "@/utils/apiResponse";

export async function summary(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await analyticsService.summary(req.query));
}

export async function topCallers(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await analyticsService.topCallers(req.query));
}

export async function callDistribution(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await analyticsService.callDistribution(req.query));
}

export async function callsPerDay(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await analyticsService.callsPerDay(req.query));
}

export async function callsPerCity(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await analyticsService.callsPerCity(req.query));
}

export async function trends(req: Request, res: Response): Promise<void> {
  sendSuccess(res, await analyticsService.trends(req.query));
}
