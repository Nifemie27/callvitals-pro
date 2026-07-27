import { Router } from "express";
import { Role } from "@prisma/client";
import * as userController from "@/api/controllers/user.controller";
import {
  createUserValidator,
  updateUserValidator,
  userIdParamValidator,
} from "@/api/validators/user.validator";
import { validate } from "@/api/middleware/validate";
import { authenticate, authorize } from "@/api/middleware/auth";

export const userRouter = Router();

userRouter.use(authenticate, authorize(Role.ADMIN));

userRouter.post("/", createUserValidator, validate, userController.create);
userRouter.get("/", userController.list);
userRouter.get("/:id", userIdParamValidator, validate, userController.getById);
userRouter.patch(
  "/:id",
  userIdParamValidator,
  updateUserValidator,
  validate,
  userController.update,
);
userRouter.delete("/:id", userIdParamValidator, validate, userController.remove);
