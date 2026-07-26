import type { Request, Response } from "express";
import { callRecordService } from "@/services/callRecord.service";
import { sendCreated, sendNoContent, sendSuccess } from "@/utils/apiResponse";
import { actorFromRequest } from "@/services/audit.service";
import type { CreateCallRecordBody, UpdateCallRecordBody } from "@/dto/callRecord.dto";

export async function list(req: Request, res: Response): Promise<void> {
  const result = await callRecordService.list(req.query);
  sendSuccess(res, result.items, { pagination: result.pagination });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const record = await callRecordService.getById(req.params.id as string);
  sendSuccess(res, record);
}

export async function create(req: Request, res: Response): Promise<void> {
  const actor = actorFromRequest(req, req.user?.id);
  const record = await callRecordService.create(req.body as CreateCallRecordBody, actor);
  sendCreated(res, record, "Call record created");
}

export async function update(req: Request, res: Response): Promise<void> {
  const actor = actorFromRequest(req, req.user?.id);
  const record = await callRecordService.update(
    req.params.id as string,
    req.body as UpdateCallRecordBody,
    actor,
  );
  sendSuccess(res, record, { message: "Call record updated" });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const actor = actorFromRequest(req, req.user?.id);
  await callRecordService.delete(req.params.id as string, actor);
  sendNoContent(res);
}
