import type { Request, Response } from "express";
import { userService } from "@/services/user.service";
import { sendCreated, sendNoContent, sendSuccess } from "@/utils/apiResponse";
import { actorFromRequest } from "@/services/audit.service";
import type { CreateUserBody, UpdateUserBody } from "@/dto/user.dto";

export async function create(req: Request, res: Response): Promise<void> {
  const actor = actorFromRequest(req, req.user?.id);
  const user = await userService.create(req.body as CreateUserBody, actor);
  sendCreated(res, user, "User created");
}

export async function list(req: Request, res: Response): Promise<void> {
  const result = await userService.list(req.query);
  sendSuccess(res, result.items, { pagination: result.pagination });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const user = await userService.getById(req.params.id as string);
  sendSuccess(res, user);
}

export async function update(req: Request, res: Response): Promise<void> {
  const actor = actorFromRequest(req, req.user?.id);
  const user = await userService.update(
    req.params.id as string,
    req.body as UpdateUserBody,
    actor,
  );
  sendSuccess(res, user, { message: "User updated" });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const actor = actorFromRequest(req, req.user?.id);
  await userService.delete(req.params.id as string, actor);
  sendNoContent(res);
}
